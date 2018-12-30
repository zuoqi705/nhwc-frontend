// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import FastClick from 'fastclick'
import App from './App'
import 'lib-flexible/flexible'
import VueSocketIO from 'vue-socket.io';
// import socketio from 'socket.io-client';
import axios from 'axios'
import VueAxios from 'vue-axios'
import  Velocity from 'velocity-animate';
import './assets/iconfont/iconfont.css';
import './styles/global.css'
import router from './router'
import {
  XButton,
  Cell,
  CellBox,
  LoadingPlugin,
  InlineLoading,
  ToastPlugin,
  ConfirmPlugin ,
  AlertPlugin,
  Flexbox,
  Divider,
  Group,
  GroupTitle,
  XInput,
  FlexboxItem,
} from 'vux'

Vue.component('x-button', XButton)
Vue.component('flexbox', Flexbox)
Vue.component('flexbox-item', FlexboxItem)
Vue.component('group', Group)
Vue.component('cell', Cell)
Vue.component('cell-box', CellBox)
Vue.component('divider', Divider)
Vue.component('group-title', GroupTitle)
Vue.component('inline-loading', InlineLoading)
Vue.component('x-input', XInput)
Vue.use(LoadingPlugin)
Vue.use(ConfirmPlugin)
Vue.use(AlertPlugin)
Vue.use(ToastPlugin, {time:'1000'})

Vue.use(VueAxios, axios);

axios.defaults.baseURL = 'http://47.106.227.84:4000'
// Vue.use(VueSocketio, socketio('abc.zhaozuoqi.com:4000')); //服务器
Vue.use(new VueSocketIO({
  debug: true,
  connection: 'abc.zhaozuoqi.com:4000',
}))

// Vue.use(VueSocketio, socketio('localhost:4000')); //本地

FastClick.attach(document.body)

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  router,
  render: h => h(App)
}).$mount('#app-box')