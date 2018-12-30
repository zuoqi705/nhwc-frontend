export default {
  drawing: function (data) {
    //屏幕等比缩放
    data.x0 = data.x0 * this.w;
    data.y0 = data.y0 * this.h;
    data.x1 = data.x1 * this.w;
    data.y1 = data.y1 * this.h;
    data.emit = false;
    // console.log('drawingData', data);
    this.drawLine(data);
  },

  clearCanvas: function () {
    console.log('clearCanvas');
    this.clearCanvas();
  },

  drawBackCanvas: function (data) {
    // console.log('drawBackCanvas', data);
    this.undoStrokes = data.undoStrokes;
    //把不能撤销的笔画在backCanvas上
    this.drawStrokeData(this.backContext, this.undoStrokes.shift());
    //重新绘制currCanvas
    this.redrawUndoCanvas();
  },

  reDraw: function (data) {
    // console.log('reDraw', data);
    this.undoStrokes = data.undoStrokes;
    this.redoStrokes = data.redoStrokes;

    if (data.type == 'undo') this.undo();
    else this.redo();
  },

  talk: function (msg) {
    this.pushTalk(`${msg.text}`)
  },

  startGame: function () {
    this.setTip('游戏开始');
    this.setOutputLabel('游戏开始', 2000);
    // this.$socket.emit('startRound', this.roomId);
  },

  startRound: function (data) {
    let gameData = data.gameData;
    let gameSeats = data.gameSeats;
    let roundSec = gameData.roundSec;
    let drawerIndex = gameData.drawerIndex;
    let tips = gameData.tips;
    let word = gameData.word;
    let roundIndex = gameData.roundIndex;
    let roundNum = gameData.roundNum;

    this.clearCanvas();
    console.log('startRound gameData', gameData);
    console.log('startRound gameSeats', gameSeats);
    this.gameData = { ...gameData
    };
    this.gameSeats = [...gameSeats];
    this.saveGameData();
    let drawerUid = gameSeats[drawerIndex].uid; //找出本轮drawerUid
    let drawerName = gameSeats[drawerIndex].username; //找出本轮drawerName

    //设置能不能画
    if (this.userInfo.uid == drawerUid) {
      console.log('I draw');
      this.setTip(`我画：${word} (${tips[1]})`);
      this.setOutputLabel(`第${roundIndex+1}/${roundNum}轮：我画 '${word}'`, 3000).then(() => {
        this.setTimer(roundSec);
      });
      this.enablePaint(true);
    } else {
      this.enablePaint(false);
      this.setTip(`提示：${tips[0]}`);

      //如果还在本局中，且对局还没有结束，20s之后给出第二个tip
      if (this.gameData.state == 'round' &&
        this.gameData.roundIndex == roundIndex) {
        this.newClueTimer = setTimeout(() => {
          this.setTip(`提示：${tips[0]}，${tips[1]}`);
          this.pushTalk(`新提示：${tips[1]}`, this.sysTextColor);
        }, 20000);
      }

      this.setOutputLabel(`第${roundIndex+1}/${roundNum}轮：${drawerName}画，我猜`, 3000).then(() => {
        this.setTimer(roundSec);
      });
    }
  },

  correct: function (data) {
    this.correctNum++;
    let gameData = data.gameData;
    let gameSeats = data.gameSeats;
    let correctIndex = data.index;
    let scoreEle = this.$refs.playerScores[correctIndex];
    let drawerEle = this.$refs.playerScores[gameData.drawerIndex];
    // scoreEle.velocity('fadeIn');
    this.gameData = { ...gameData
    };
    this.gameSeats = [...gameSeats];
    Velocity(scoreEle, 'fadeIn', {
      duration: 1000,
    });
    Velocity(drawerEle, 'fadeIn', {
      duration: 1000,
    })
    console.log('correct gameData', this.gameData);
    console.log('correct gameSeats', this.gameSeats);

    if (data.userInfo.uid == this.userInfo.uid) {
      this.pushTalk(`我 猜对了答案，+${data.addScore}分`, this.myTextColor);
    } else {
      this.pushTalk(`${data.userInfo.username} 猜对了答案，+${data.addScore}分`, this.sysTextColor);
    }

    if (this.getTimerLabel() > 0 && this.gameSeats.length > 1 && this.correctNum < this.gameSeats.length - 1) {
      console.log('correctNum', this.correctNum);
      this.setTimer(30);
      this.pushTalk('答题时间更改为30秒', this.sysTextColor);
    }
  },

  endRound: function () {
    console.log('endRound');
    if (this.seatIndex == this.gameData.drawerIndex) {
      this.wait(()=> {
        this.timerSec = -1;
        clearTimeout(this.timer);
        clearTimeout(this.newClueTimer);
        this.timer = null;
        this.newClueTimer = null;
        this.setTip('回合结束');
        this.setOutputLabel('回合结束', 4000);
      },4500)
    } else {
      this.wait(()=> {
        this.timerSec = -1;
        clearTimeout(this.timer);
        clearTimeout(this.newClueTimer);
        this.timer = null;
        this.newClueTimer = null;
        this.setTip('回合结束');
        this.setEndRoundPanel(`答案：${this.gameData.word}`, 4000);
      },4500);
      
    }
  },

  end: function (rankList) {
    console.log('end');
    this.setTip('游戏结束');
    this.rankList = rankList;
    this.endGame = true;
    // this.setOutputLabel('游戏结束', 3000);
  }
}
