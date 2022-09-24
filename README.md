# 简单版的MD文档预览指令

## 🌈使用方式
1. 首先，需要是用@vue/cli 脚手架创建工程
之后进入工程

```shell
npm i @youzi/vue-cli-plugin-docs
```

2. 在工程根目录下创建对应的文件
``` shell
【工程】
├─ example                  # 全部示例组件文件夹
│  └─ button                # 具体示例组件
│     └─ index.vue          # 示例组件Demo
├─ packages                 # 组件实现文件夹
│  └─ button                # 具体实现组件
│     ├─ assets
│     │  └─ images
│     │     └─ ninelie.png
│     ├─ Index.vue
│     └─ README.md          # 组件文档（必要）
└─ README.md
```

3. 组件文档中，是用`::: vue :::`占位符，记录展示路径;

    eg. 
    ::: vue  example/button/index.vue :::

4. 在工程根目录下运行
```shell 
npx vue-cli-service serve --mode docs
```
即可预览
![](https://raw.githubusercontent.com/wuzequanyouzi/vue-cli-plugin-docs/master/screenshots.gif)
