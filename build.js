/**
 * build.js
 * 改造cli-service build 指令
 * 调整webpack loader配置
 * 加载md-loader
 * 运行./template/main.js
 */

const prompts = require("prompts");
const { red, bold } = require("kolorist");
const path = require("path");
const {
  getModules,
  generateMainJs,
  deleteMainJs,
} = require("./utils");
module.exports = (api) => {
  const { build } = api.service.commands;
  const buildCallBack = build.fn;
  return (...args) => {
    const { parent = "packages", entry = "README.md", mode } = args[0];
    if (mode === "docs") {
      const modules = getModules(api.getCwd(), parent, entry);
      if (!modules.length) {
        console.log(red(bold("没有可以执行打包的组件文档！")));
        process.exit();
      }
      console.log(`🚀 ${bold(`准备打包组件...`)}`);

      // 打包配置
      api.chainWebpack((config) => {
        config.entryPoints.clear();
        config.optimization.delete("splitChunks");
        config.module
          .rule("markdown")
          .test(/.md$/)
          .use("vue-loader")
          .loader("vue-loader")
          .end()
          .use("xiaoe-md-loader")
          .loader(path.resolve(__dirname, "./md-loader.js"))
          .options({
            framework: "vue",
          })
          .end();
      });
      console.log(`👌 ${bold(`加载配置成功`)}`);

      for (let index = 0; index < modules.length; index++) {
        const module = modules[index];
        const mainPath = generateMainJs(module.value.path, module.value.name);
        api.chainWebpack((config) => {
          config.entry(module.value.name).add(mainPath);
        });
      }
      const p = buildCallBack(...args);
      p.then(() => {
        console.log(`👌 ${bold(`最后操作: 去掉不必要产物`)}`);
        for (let index = 0; index < modules.length; index++) {
          const module = modules[index];
          deleteMainJs(module.value.name);
        }
        console.log(`👌 ${bold(`Done`)}`);
      });
    } else {
      buildCallBack(...args);
    }
  };
};
