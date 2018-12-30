<template>
  <div>
    <group>
      <group-title slot="title" class="groupTitle" style="margin-top:18px">
        <span>请输入玩家姓名</span>
      </group-title>
      <x-input placeholder="最多十个字" v-model="username" :max="10"></x-input>
    </group>
    <x-button id="completeBtn" class="primaryBtn" type='primary' @click.native="complete">完成</x-button>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        username: ''
      }
    },

    complete() {
      if(username) {
        this.$socket.emit('addUser', {
          socketId: this.$socket.id,
          username: this.username
        })
      }
    },

    mounted() {

    }
  }

</script>

<style scoped>
  #completeBtn {
    /* border-radius: 0; */
    margin-top: 24px;
  }

</style>
