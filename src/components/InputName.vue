<template>
  <div>
    <div id="gameTitle">
      <div class="flex1">你画我猜小游戏</div>
      <x-button mini type="primary" @click.native="$router.replace('/')">返回主页</x-button>
    </div>
    <group>
      <group-title slot="title" class="groupTitle" style="margin-top:18px">
        <span>请输入玩家姓名</span>
      </group-title>
      <x-input placeholder="最多十个字" v-model="username" :max="10" @on-enter="handleInput"></x-input>
    </group>
    <x-button id="completeBtn" class="primaryBtn" type="primary" @click.native="handleInput">完成</x-button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      username: "",
      joinRoomId: "",
      roomData: {}
    };
  },
  sockets: {
    connect: function() {
      console.log("inputname connected");
    },
    join: function(msg) {
      console.log("joinMsg", msg);
      this.roomData = msg.roomData;
    }
  },
  methods: {
    handleInput() {
      if (this.username) {
        this.axios
          .get("/adduser", {
            params: {
              username: this.username,
              socketId: this.$socket.id,
              joinRoomId: this.joinRoomId
            }
          })
          .then(res => {
            console.log("​complete -> res", res);
            if (res.data) {
              //将userInfo存起来
              let userInfo = res.data.userInfo;
              let state = res.data.state;
              sessionStorage.setItem("userInfo", JSON.stringify(userInfo));

              switch (state) {
                case 1:
                  this.$vux.toast.text("该房间不存在", "top");
                  break;
                case 2:
                  this.$vux.toast.text("该房间已经开始游戏", "top");
                  break;
                case 3:
                  this.$socket.emit("joinRoom", {
                    ...userInfo,
                    joinRoomId: this.joinRoomId
                  });
                  this.$vux.loading.show({
                    text: ""
                  });
                  setTimeout(() => {
                    this.$vux.loading.hide();
                    this.$router.push({
                      name: "Room",
                      params: {
                        ownername: this.roomData.ownername,
                        roomId: this.joinRoomId,
                        roomData: this.roomData
                      }
                    });
                  }, 1000);
              }
            } else {
              this.$vux.toast.text("该名称已被使用", "top");
              this.username = "";
            }
          });
      }
    }
  },

  mounted() {
    this.joinRoomId = this.$route.query.roomId;
  }
};
</script>

<style scoped>
#completeBtn {
  /* border-radius: 0; */
  margin-top: 24px;
}
</style>
