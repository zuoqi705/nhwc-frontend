export default {
  connect: function () { //不要使用箭头函数，否则会绑定错误
    console.log('room connected');
    //在这里处理刷新重连获取roomData信息
  },
  message: function (msg) {
    console.log('msg', msg);
    this.pushTalk(`${msg.text}`)
  },
  join: function (msg) {
    console.log('joinData:', msg);
    this.$vux.toast.text(`${msg.joinUserInfo.username}加入房间`, 'bottom');
    sessionStorage.setItem('roomData', JSON.stringify(msg.roomData));
    this.roomData = msg.roomData;
    console.log('roomData', this.roomData)
    this.roomTitle = `目前房间有${msg.roomData.players.length}人`;
    this.name = this.roomData.ownername + '的房间';
  },
  leave: function (msg) {
    console.log('leaveData:', msg);
    this.$vux.toast.text(`${msg.leaveUserInfo.username}离开房间`, 'bottom');
    sessionStorage.setItem('roomData', JSON.stringify(msg.roomData));
    this.roomTitle = `目前房间有${msg.roomData.players.length}人`;
    this.roomData = msg.roomData;
  },
  seats: function (msg) {
    console.log('seatsMsg', msg);
    this.roomData.seats = msg.seats;
    this.roomData.sittedNum = msg.sittedNum;
    sessionStorage.setItem('roomData', JSON.stringify(this.roomData));
    // console.log(this.roomData);
  },
  enterDraw: function (data) {
    this.$vux.loading.show({
      text: ''
    })
    setTimeout(() => {
      this.$vux.loading.hide();
      this.$router.push({
        name: 'Draw',
        params: {
          roomId: this.roomId,
          gameData: data.gameData,
          gameSeats: data.gameSeats
        }
      })
    }, 1000)

  }
}