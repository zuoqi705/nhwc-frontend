import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/components/Home'
import Room from '@/components/Room'
import Draw from '@/components/Draw'
import GameRule from '@/components/GameRule'
import InputName from '@/components/InputName'

Vue.use(Router)

export default new Router({
  routes: [{
      path: '/',
      name: 'Home',
      component: Home
    },
    {
      path: '/rule',
      name: 'GameRule',
      component: GameRule
    },
    {
      path: '/room/:roomId',
      name: 'Room',
      component: Room
    },
    {
      path:'/draw/:roomId',
      name:'Draw',
      component:Draw
    },
    {
      path:'/inputname',
      name: 'InputName',
      component: InputName
    }
  ]
})