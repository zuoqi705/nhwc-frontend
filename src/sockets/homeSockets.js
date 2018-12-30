export default { //接受服务端传来的信息
  connect: function () {
    console.log('home connected');
    if (JSON.parse(sessionStorage.getItem('userInfo'))) {
      this.userInfo.socketId = this.$socket.id; //重连时更新socketId
      sessionStorage.setItem('userInfo', JSON.stringify(this.userInfo));
      console.log('sessionUserInfo2:', JSON.parse(sessionStorage.getItem('userInfo')));
    }
    if (!this.userInfo.uid) this.$socket.emit('newUser', true);
  },
  userInfo: function (msg) {
    if (!this.userInfo.uid) {
      this.userInfo = msg;
      sessionStorage.setItem('userInfo', JSON.stringify(msg)); //将userInfo存起来
      console.log('userInfo:', msg);
    }
  },
  editInfo: function (msg) {
    if (msg) {
      this.$vux.toast.text('修改成功', 'top')
      this.disabled = true;
      this.btnType = 'default';
    } else {
      this.$vux.toast.text('该名称已被使用', 'top');
      this.$refs.userInput.focus();
    }
  },
  rooms: function (msg) {
    console.log('rooms', msg);
    this.rooms = msg; //动态监听rooms变化
    sessionStorage.setItem('rooms', JSON.stringify(msg));
  },

  join: function (msg) {
    console.log('joinMsg', msg);
    this.roomData = msg.roomData;
  }
}