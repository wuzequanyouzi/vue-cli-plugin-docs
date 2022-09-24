const fs = require("fs");
const path = require("path");
const { red, bold } = require("kolorist");
module.exports.getModules = function (rootPath, examplesPath, entry) {
  const modules = [];
  fs.readdirSync(path.resolve(rootPath, examplesPath)).forEach((dir) => {
    const entryPath = path.resolve(rootPath, examplesPath, dir, entry);
    if (fs.existsSync(entryPath)) {
      modules.push({
        title: dir,
        value: {
          path: entryPath,
          relativePath: path.join(examplesPath, dir, entry),
          name: dir
        },
        relativePath: path.join(examplesPath, dir, entry),
      });
    } else {
      console.log(red(bold(`${dir}组件不存在README.md文件，已过滤`)))
    }
  });
  return modules;
};

const getMainTemplate = () => {
    return `import Vue from 'vue'
    import './style.css'
    import 'highlight.js/styles/github.css';
    :::ikunFans*ikunFans=doubleIkun:::
    new Vue({
      render: h => h(md),
    }).$mount('#app')
    `
};

module.exports.reWriteMainJs = (mdPath) => {
    const mainPath = path.resolve(__dirname, 'template', 'main.js')
    mdPath = mdPath.replace(/\\/g, '\\\\');
    const mainTemplateStr = getMainTemplate().replace(':::ikunFans*ikunFans=doubleIkun:::', `import md from '${mdPath}'`);
    fs.writeFileSync(mainPath, mainTemplateStr, {
        encoding: 'utf-8'
    });
    return mainPath;
}

module.exports.generateMainJs = (mdPath, name) => {
  const mainPath = path.resolve(__dirname, 'template', `${name}.js`)
  mdPath = mdPath.replace(/\\/g, '\\\\');
  const mainTemplateStr = getMainTemplate().replace(':::ikunFans*ikunFans=doubleIkun:::', `import md from '${mdPath}'`);
  fs.writeFileSync(mainPath, mainTemplateStr, {
      encoding: 'utf-8'
  });
  return mainPath;
}

module.exports.deleteMainJs = (name) => {
  const mainPath = path.resolve(__dirname, 'template', `${name}.js`)
  fs.unlinkSync(mainPath);
}