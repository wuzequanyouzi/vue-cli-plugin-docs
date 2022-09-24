const { getOptions } = require("loader-utils");
const {validate} = require("schema-utils");
const MarkdownIt = require("markdown-it");
const MarkdownItContainer = require("markdown-it-container");
const hljs = require("highlight.js");
const path = require("path");
const fs = require("fs");

const schema = {
  type: "object",
  properties: {
    framework: {
      type: "string",
    },
    options: {
      type: "object",
    },
  },
};

// 将文档的组件文件解析成code
const addCode = (path, markdownOption) => {
  const fileStr = fs.readFileSync(path).toString();
  const md = new MarkdownIt(markdownOption);
  return md.render(`
  \`\`\`html
  ${fileStr}
  \`\`\`
  `);
};

const NEW_LINE = "\r\n";
const DEFAULT_MARKDOWN_OPTIONS = {
  html: true,
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang }).value;
      } catch (err) {
        // ignore
      }
    }
    return ""; // use external default escaping
  },
};

class MdParser {
  constructor({ source, options = {} }) {
    // 原文件信息
    this.source = source;

    // 参数合并
    this.options = Object.assign({}, options, {
      markdownOption: {
        ...DEFAULT_MARKDOWN_OPTIONS,
        ...options?.markdownOption,
      },
    });

    // 记录MD插槽文件路径
    this.filePaths = [];

    // 初始化MD解析器
    this.markdown = new MarkdownIt(this.options.markdownOption);
    // 初始化MD解析器插件
    MdParser.useMarkdownItContainer.apply(this);
  }

  // 解析MD
  parse() {
    // 定义结果对象，包括template，script，style三个部分
    let result =
      typeof this.options.process === "function"
        ? this.options.process(this.source)
        : {
            template: this.source,
          };

    const html = this.markdown.render(result.template);

    // 默认解析MD之后需要动态生成的script
    const scriptStr = `
      <script>
        ${this.filePaths
          .map((item) => `import ${item.name} from '${item.path}'`)
          .join(";")}
        export default {
          components: {
            ${this.filePaths.map((item) => item.name).join(",")}
          }
        }
      </script>
    `;

    // 预留自定义处理函数
    if (typeof this.options.process === "function") {
      // 这里后续处理，目前双script不生效
      result.script = `<script>
        ${result.script || ""}
      </script>
      ${scriptStr}
      `;
      result.style = `<style>${
        result.style ||
        `
          pre {
            padding: 10px;
            background: #DDD;
          }
        `
      }</style>`;
    } else {
      result = {
        template: this.source,
        script: scriptStr,
        style: `<style>
          pre {
            padding: 10px;
            background: #DDD;
          }
        </style>`,
      };
    }

    // 判断使用的框架
    let vueFile = `
      <template>
        <div>
          ${html}
        </div>
      </template>
      ${result.script}
    `;
    return vueFile;
  }
  static useMarkdownItContainer() {
    let { framework = "vue" } = this.options;
    framework = framework.toLocaleLowerCase();
    const that = this;
    this.markdown.use(MarkdownItContainer, framework, {
      validate(params) {
        return params.trim().match(/^vue\s+(.*)$/);
      },
      render(tokens, idx) {
        let str = tokens[idx].info.trim().match(/\s+(.*):::$/);
        if (tokens[idx].nesting === 1) {
          const pathTemp = str[1].trim();
          const filePath = path.resolve("./", pathTemp);
          if (!fs.existsSync(filePath)) {
            console.log("示例组件路径错误：", str[1]);
            return "\n";
          } else {
            const name = pathTemp.replace(/\//g, "_").split(".")[0];
            that.filePaths.push({
              path: filePath.replace(/\\/g, "\\\\"),
              name,
            });
            return `<${name}/> ${NEW_LINE}
                ${addCode(filePath, that.options.markdownOption)} ${NEW_LINE}
              `;
          }
        } else {
          return "";
        }
      },
    });
  }
}

module.exports = function (source) {
  const options = getOptions(this);
  validate(schema, options, {name: 'xiaoe-md-loader'});
  return new MdParser({
    source,
    options,
  }).parse();
};
