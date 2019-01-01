# nhwc-frontend

> 你画我猜小游戏（毕业设计）前端部分

## 如何开始

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report

# run unit tests
npm run unit

# run e2e tests
npm run e2e

# run all tests
npm test
```

For a detailed explanation on how things work, check out the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).

## 用到的第三方库

- **vux**

  vue.js 移动端 UI 组件库

- **velocity.js**

  与vue结合实现一些过渡，动画功能

- **axios / vue axios**

  实现向后端发出http请求

- **flexible / px2remloader**

  将px转化为rem，实现移动端自适应

- **vuesocket.io**

  与后端通过socket建立双全工实时通信

- **vue-clipboard-2**

  一个用于实现复制到剪贴板功能的插件

## 遇到的一些问题

- **如何保存用户信息？**

  通过sessionStorage保存，每当进入Home页面时，查看sessionStorage中是否还有userInfo，没有的话则发出newUser的请求。

- **如何实现多人聊天？**

  点击发送按钮后，向后端发送一个socket，并将发送内容传过去，后端收到后，再向房间内所有人发送一个socket，将该内容传出去。

- **如何实现聊天的动画效果？**

  通过setTimeout实现每隔时间执行一次popTalk()，通过Velocity函数实现动画效果。

- **如何监听到disconnect事件后实现离开房间功能？**

  通过离开房间时的socketId实现追踪删除。


## 论文中要写的原理部分

- websocket通信原理，与http比较
- vue中一些重要概念
- webpack打包原理
- 移动端自适应原理
- nginx反向代理原理