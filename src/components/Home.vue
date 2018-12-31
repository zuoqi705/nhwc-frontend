<template>
  <div>
    <div id="gameTitle">
      <div class="flex1">你画我猜小游戏</div>
      <x-button mini type="primary" @click.native="$router.push('rule')">游戏规则</x-button>
    </div>
    <group>
      <group-title slot="title" class="groupTitle" style="margin-top:18px">
        <span>玩家姓名</span>
      </group-title>
      <x-input :max="10" placeholder="最多十个字" v-model="userInfo.username" ref="userInput"
               :disabled="disabled" @on-enter="handleInput" id="userInput">
        <x-button slot="right" :type="btnType" mini @click.native="handleInput">{{disabled
          ? "修改昵称" : "修改完成"}}</x-button>
      </x-input>
    </group>

    <group id="roomGroup" v-if="rooms.length > 0">
      <group-title slot="title" class="groupTitle">
        <span>房间列表 共{{rooms.length}}间</span>
      </group-title>
      <transition-group name="fade">
        <cell v-for="room in rooms" :key="room.roomId" :title="room.ownername+'的房间'"
              :value="`进入房间 (${room.players.length}/8)`" is-link @click.native="joinRoom(room)"
              :border-intent="false" id="joinCell">
        </cell>

      </transition-group>

    </group>

    <x-button type="primary" @click.native="createMyRoom" class="primaryBtn" id="createBtn"
              v-if="!createdRoom">创建房间</x-button>
    <!-- <x-button class="refreshBtn" @click.native="refreshRoom" type="primary">刷新房间列表</x-button> -->
  </div>

</template>

<script>
  import homeSockets from '../sockets/homeSockets';

  export default {
    data() {
      return {
        userInfo: {
          socketId: '',
          uid: '',
          username: '',
          roomId: '',
        },
        createdRoom: false, //判断是否创建过房间
        disabled: true,
        btnType: 'default',
        rooms: [], //房间列表
        roomData: {}
      }
    },
    sockets: homeSockets,
    methods: {
      handleInput() {
        if (this.disabled) {
          this.disabled = false;
          this.btnType = 'primary';
          this.userInfo.username = '';
          this.$nextTick(() => { //要等到输入框*DOM更新之后再获取焦点
            this.$refs.userInput.focus();
          })
        } else if (this.userInfo.username.trim() === '') {
          this.$vux.toast.text('名称不能为空', 'top')
          this.$refs.userInput.focus();
        } else {
          var userInfo = {
            uid: this.userInfo.uid,
            username: this.userInfo.username,
            roomId: this.userInfo.roomId,
          }
          sessionStorage.setItem('userInfo', JSON.stringify(userInfo));
          this.$socket.emit('editUserName', userInfo);
        }
      },
      createMyRoom() {
        this.$vux.loading.show({
          text: ''
        })
        this.$socket.emit('createRoom', this.userInfo);
        sessionStorage.setItem('createdRoom', true);
        setTimeout(() => {
          this.$vux.loading.hide();
          this.$router.push({
            name: 'Room',
            params: {
              ownername: this.userInfo.username,
              roomId: this.userInfo.roomId,
              roomData: this.roomData
            }
          })
        }, 1000)
      },
      joinRoom(room) {
        if (room.players.length < 8) {
          this.$socket.emit('joinRoom', { ...this.userInfo,
            joinRoomId: room.roomId
          });
          this.$vux.loading.show({
            text: ''
          })
          setTimeout(() => {
            this.$vux.loading.hide();
            this.$router.push({
              name: 'Room',
              params: {
                ownername: room.ownername,
                roomId: room.roomId,
                roomData: this.roomData
              }
            })
          }, 1000)
        } else {
          this.$vux.toast.text('该房间已满员', 'bottom');
        }
      },
      refreshRoom() {
        this.showLoading = true;
        setTimeout(() => {
          this.$socket.emit('refreshRooms', true);
          this.showLoading = false;
        }, 1000)
      }
    },
    mounted() {
      if (JSON.parse(sessionStorage.getItem('userInfo'))) {
        this.userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
      }
      if (!this.userInfo.uid) this.$socket.emit('newUser', true);
      console.log('sessionUserInfo1:', JSON.parse(sessionStorage.getItem(
        'userInfo')));
      this.createdRoom = sessionStorage.getItem('createdRoom');
      this.rooms = JSON.parse(sessionStorage.getItem('rooms')) ? JSON.parse(
        sessionStorage.getItem('rooms')) : [];
      console.log('sessionRoomsInfo', this.rooms);
    }
  }

</script>

<style scoped>
  #createBtn {
    margin-top: 30px;
  }

  #roomGroup {
    margin: 24px 0 30px 0
  }

  #joinCell:focus,
  #joinCell:active {
    background: #ecf8ff;
  }

  #userInput,
  #joinCell {
    font-size: 16px;
  }

  /* #joinCell {
    padding: 14px;
  } */

</style>
