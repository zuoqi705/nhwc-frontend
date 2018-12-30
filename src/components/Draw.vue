<template>
  <div>
    <div id="infoBar" ref="infoBar">
      <transition name="fade">
        <div id="tipLabel" class="flex1" v-show="showTipLabel">{{tipText}}</div>
      </transition>
      <div id="timerLabel">{{getTimerLabel()}}</div>
    </div>
    <div id="sketchOuter">
      <div id="sketch" ref="sketch">
        <canvas height="320" id="backCanvas" ref="backCanvas"></canvas>
        <canvas height="320" id='canvas' @mousedown="drawBegin" @touchstart="drawBegin"
                @mousemove="drawing" @touchmove.prevent="drawing" @mouseup="drawEnd"
                @touchend="drawEnd" ref='canvas'>
        </canvas>

        <transition name="fade">
          <div id="talkCont" ref="talkCont" v-show="flyingTalkNum > 0">
            <div id="talkText" ref="talkText">test</div>
          </div>
        </transition>

        <transition name="fade">
          <div id="outputLabel" v-show="outputShow">{{outputText}}</div>
        </transition>

        <transition name="fade">
          <div id="endRoundCont" v-show="showEndRoundPanel">
            <div id="endRoundTitle">回合结束</div>
            <div id="endRoundText">{{endRoundText}}</div>
          </div>
        </transition>
      </div>

      <div id="palette" v-show="showPalette">
        <div class="paletteItem" v-for="color in colors" :key="color" @click="selectColor(color)">
          <div class="paletteItemIcon" :style="{background: color}"></div>
        </div>
      </div>

      <div id="brushSizeBar" v-if="showBrush">
        <div class="brushSizeItem" v-for="size in brushSizes" :key="size"
             @click="selectBrush(size)" v-if="!erase">
          <div class="brushSizeIcon" :style="{width: size + 'px', height: size + 'px', marginTop: (-size/2) + 'px'}"></div>
          <div class="brushSizeLabel">{{size}}</div>
        </div>

        <div class="brushSizeItem" v-for="size in eraseSizes" :key="size"
             @click="selectBrush(size)" v-if="erase">
          <div class="brushSizeIcon" :style="{width: size + 'px', height: size + 'px', marginTop: (-size/2) + 'px'}"></div>
          <div class="brushSizeLabel">{{size}}</div>
        </div>
      </div>

      <div id="toolBar" v-show="toolBarShow">
        <div class="tool">
          <div id="colorSample" :style="{background: current.color}" @click="showPalette = true; erase = false"></div>
        </div>
        <div class="tool" @click="showBrush = true; erase = false">
          <div class="toolLabel" v-if="erase">
            <i class="iconfont icon-paintbrush"></i>
          </div>
          <div id="brushSample" :style="{width: current.width + 'px', height: current.width + 'px'}"
               v-else></div>
        </div>
        <div class="tool" @click="handleUndo">
          <div class="toolLabel" ref="undoLabel" style="color:#DCDFE6">
            <i class="iconfont icon-undo"></i>
          </div>
        </div>
        <div class="tool" @click="handleRedo">
          <div class="toolLabel" style="color:#DCDFE6" ref="redoLabel">
            <i class="iconfont icon-redo"></i>
          </div>
        </div>
        <div class="tool" @click="handleErase">
          <div class="toolLabel">
            <i class="iconfont icon-eraser" v-if="!erase"></i>
            <div id="brushSample" :style="{width: current.width + 'px', height: current.width + 'px'}"
                 v-if="erase"></div>
          </div>
        </div>
        <div class="tool" @click="handleClearCanvas">
          <div class="toolLabel">
            <i class="iconfont icon-trash"></i>
          </div>
        </div>
      </div>
    </div>

    <group v-show="talkInputShow">
      <group-title slot="title" class="groupTitle">
        <span>聊天输入框</span>
      </group-title>
      <x-input id="talkInput" :max="10" placeholder="写答案或聊天，最多十个字" v-model="inputText"
               @keyup.enter.native="sendTalk" ref="talkInput">
        <x-button slot="right" mini @click.native="sendTalk" type="primary">发送</x-button>
      </x-input>
    </group>

    <group id="playerGroup">
      <group-title slot="title" class="groupTitle">
        <span>房间成员</span>
      </group-title>
      <cell-box id="playersOuter">
        <div class="playerWrapper" v-for="player in gameSeats" :key="player.uid">
          <div class="playerCont ellipsis" :class="{drawer: player.draw}">
            <span class="playName">{{player.uid == userInfo.uid ? '我' :
              `${player.username}`}}</span>
            <!-- <div class="playerInfo" v-show="player.draw">画</div> -->
          </div>
          <div class="playerInfoWrapper">
            <div class="playerScore">分数：</div>
            <transition name="fade">
              <div class="playerScore" ref="playerScores" v-show="showPlayerScore">
                {{player.roundScore ? `${player.sumScore}
                (+${player.roundScore})` : player.sumScore}}
              </div>
            </transition>
          </div>
        </div>
      </cell-box>
    </group>

    <transition name="fade">
      <div id="endGameLayer" v-show="endGame">
        <div id="endGamePanel">
          <div id="endGameTitle">游戏结束</div>
          <div class="rankRow" v-for="(item,index) in rankList" :key="index"
               :class="{bluebg: index%2==1}">
            <div class="rankTitle">玩家名称：{{item.name}}</div>
            <div class="rankScore">分数：{{item.score}}</div>
          </div>
          <div id="backCont">
            <x-button id="backBtn" mini type="primary" @click.native="$router.replace('/')">返回首页</x-button>
            <x-button id="backBtn" mini type="primary" @click.native="$router.replace(`/room/${roomId}`)">返回房间</x-button>
          </div>
        </div>
      </div>
    </transition>
  </div>


</template>

<script>
  import {
    throttle
  } from "vux";
  import drawSockets from "../sockets/drawSockets";
  import {
    setTimeout,
    clearTimeout
  } from "timers";

  export default {
    data() {
      return {
        context: "",
        backContext: "",
        roomId: this.$route.params.roomId || JSON.parse(sessionStorage.getItem(
          'roomData')).roomId,
        userInfo: JSON.parse(sessionStorage.getItem('userInfo')), //进入该房间的用户信息,从sessionStorage中直接获取
        gameData: {},
        gameSeats: [],
        paintEnable: false, //是否可以画
        inputText: '', //绑定输入框内容
        talkQueue: [], //用来保存talk队列
        flyingTalkNum: 0, //还在运动的talk
        talkTimer: null, //talkCont计时器     
        talkInputShow: true, //是否显示talkInput
        toolBarShow: true, //是否显示toolBar
        timerSec: -1, //timerLabel显示内容
        timer: null, //计时器
        tipText: "", //tipLabel显示内容
        outputText: "", //outputLabel显示内容
        outputShow: false, //是否显示outputLabel
        outputTimer: null,
        showEndRoundPanel: false, //是否显示endRoundPanel
        endRoundText: '',
        endRoundTimer: null,
        newClueTimer: null, //是否给出新提示计时器
        sysTextColor: '#E6A23C', //系统textColor
        myTextColor: '#F56C6C', //我的textColor
        enableDoColor: '#409eff',
        unableDoColor: '#DCDFE6',
        showTipLabel: false, //是否显示tipLabel
        draw: false, //用于判断是否在绘制
        w: "", //画布宽度
        h: "", //画布高度
        current: {
          //当前画布相关数据
          x: "",
          y: "",
          color: "black",
          width: 2
        },
        drawingData: {
          //drawLine函数中用到的参数对象
          x0: "",
          y0: "",
          x1: "",
          y1: "",
          color: "",
          width: "",
          emit: true //emit表示画布数据是否需要emit出去
        },
        currStroke: [], //当前一笔数据
        undoStrokes: [], //可以撤销的操作数据
        redoStrokes: [], //可以恢复的操作数据
        undoLimit: 5, //可以撤销的步数
        showPalette: false,
        showBrush: false,
        erase: false, //是否使用橡皮擦
        colors: [
          //调色板颜色数组
          "#ffffff",
          "#000000",
          "#9b9b9b",
          "#ff4c62",
          "#fec410",
          "#fdf902",
          "#91c601",
          "#516dfe",
          "#2ccff5",
          "#9c7cff",
          // "#af743f","#cca86d","#f0d881","#ffc4d6","#ff00b2",
          "#00A64C",
          "#cca86d",
          "#f0d881",
          "#ffc4d6",
          "#ff00b2"
        ],
        brushSizes: [2, 4, 6, 10, 18], //笔刷大小数组
        eraseSizes: [10, 18, 24, 32, 40], //橡皮擦大小数组
        showPlayerScore: true, //用于分数过渡动画显示
        correct: false, //用于记录自己本轮是否已经答对
        correctNum: 0, //已经答对的人数
        seatIndex: '', //我在gameSeats中的index
        endGame: false, //记录游戏是否结束
        rankList: [],
      };
    },

    sockets: drawSockets,

    methods: {
      drawBegin(e) {
        // console.log('begin');
        // console.log(e);
        if (!this.paintEnable) return;
        this.showPalette = false;
        this.showBrush = false;
        this.draw = true;
        this.updateXY(e); //更新当前的x,y
        if (!this.erase) {
          this.currStroke.push(
            this.current.color,
            this.current.width,
            this.current.x,
            this.current.y
          ); //储存当前起始点
        } else {
          this.currStroke.push(
            "#ffffff",
            this.current.width,
            this.current.x,
            this.current.y
          ); //储存当前起始点
        }
      },

      drawing: throttle(function (e) {
        if (!this.paintEnable) return;
        //这里用到了节流函数
        if (this.draw) {
          this.drawingData.x0 = this.current.x;
          this.drawingData.y0 = this.current.y;
          this.drawingData.x1 = (e.clientX || e.touches[0].clientX) - 1;
          this.drawingData.y1 =
            (e.clientY || e.touches[0].clientY) -
            this.$refs.infoBar.clientHeight -
            1;
          this.drawingData.width = this.current.width;

          //进一步节流
          let dx = Math.abs(this.drawingData.x1 - this.drawingData.x0);
          let dy = Math.abs(this.drawingData.y1 - this.drawingData.y0);
          if (dx * dx + dy * dy < 4) {
            return;
          }

          if (this.erase) {
            //如果使用了橡皮擦
            // console.log('erasing');
            this.drawingData.color = "#ffffff";
            this.drawLine(this.drawingData);
          } else {
            this.drawingData.color = this.current.color;
            this.drawLine(this.drawingData);
          }
          //更新当前的相对于画布的x,y坐标
          this.updateXY(e); //更新当前的x,y
          this.currStroke.push(this.current.x, this.current.y);
          // console.log('drawing', this.current.x, this.current.y);
        }
      }, 10),

      drawEnd(e) {
        if (!this.paintEnable) return;
        // console.log('end');
        if (!this.draw) {
          return;
        }

        if (this.currStroke.length > 4) {
          this.undoStrokes.push(this.currStroke); //把当前画的那一笔存起来
          this.$refs.undoLabel.style.color = this.enableDoColor;
          this.$refs.redoLabel.style.color = this.unableDoColor;
        }

        if (this.undoStrokes.length > this.undoLimit) {
          console.log("drawBackCanvas");

          this.$socket.emit("drawBackCanvas", {
            roomId: this.roomId,
            undoStrokes: this.undoStrokes
          });

          //把不能撤销的笔画在backCanvas上
          this.drawStrokeData(this.backContext, this.undoStrokes.shift());

          //重新绘制currCanvas
          this.redrawUndoCanvas();
        }

        this.currStroke = [];
        this.redoStrokes = [];
        this.draw = false;
      },

      //实时画的函数，只于curCanvas有关
      drawLine(drawingData) {
        this.context.beginPath();
        this.context.lineJoin = "round";
        this.context.lineCap = "round";
        this.context.moveTo(drawingData.x0, drawingData.y0);
        this.context.lineTo(drawingData.x1, drawingData.y1);
        this.context.strokeStyle = drawingData.color;
        this.context.lineWidth = drawingData.width;
        this.context.stroke();
        this.context.closePath();

        if (!drawingData.emit) {
          return;
        }
        this.$socket.emit("drawing", {
          roomId: this.roomId,
          x0: drawingData.x0 / this.w,
          y0: drawingData.y0 / this.h,
          x1: drawingData.x1 / this.w,
          y1: drawingData.y1 / this.h,
          color: drawingData.color,
          width: drawingData.width
        });
      },

      //画那一笔的函数
      drawStrokeData(ctx, stroke) {
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        ctx.strokeStyle = stroke[0];
        ctx.lineWidth = stroke[1];
        let ptX = stroke[2]; //起始点X
        let ptY = stroke[3]; //起始点Y

        ctx.beginPath();
        ctx.moveTo(ptX, ptY);

        let ptNum = (stroke.length - 4) / 2; //要绘制的点数
        for (let i = 0; i < ptNum; i++) {
          ptX = stroke[4 + i * 2]; //绘制点X
          ptY = stroke[4 + i * 2 + 1]; //绘制点Y
          ctx.lineTo(ptX, ptY);
        }
        ctx.stroke();
      },

      //点击undo函数
      handleUndo() {
        if (this.undoStrokes.length == 0) {
          return;
        }
        this.$socket.emit("reDraw", {
          roomId: this.roomId,
          type: "undo",
          undoStrokes: this.undoStrokes,
          redoStrokes: this.redoStrokes
        });
        this.undo();
        this.$refs.redoLabel.style.color = this.enableDoColor;
        if (this.undoStrokes.length == 0) {
          this.$refs.undoLabel.style.color = this.unableDoColor;
        }
      },

      //点击redo函数
      handleRedo() {
        if (this.redoStrokes.length == 0) {
          return;
        }
        this.$socket.emit("reDraw", {
          roomId: this.roomId,
          type: "redo",
          undoStrokes: this.undoStrokes,
          redoStrokes: this.redoStrokes
        });
        this.redo();
        this.$refs.undoLabel.style.color = this.enableDoColor;
        if (this.redoStrokes.length == 0) {
          this.$refs.redoLabel.style.color = this.unableDoColor;
        }
      },
      //撤销操作函数
      undo() {
        if (this.undoStrokes.length == 0) {
          return;
        }
        this.redoStrokes.push(this.undoStrokes.pop()); //向redoStrokes中存入撤销的stroke
        this.redrawUndoCanvas();
      },

      //恢复操作函数
      redo() {
        if (this.redoStrokes.length == 0) {
          return;
        }
        this.undoStrokes.push(this.redoStrokes.pop()); //向undoStrokes中恢复stroke
        this.redrawUndoCanvas();
      },

      //重新绘制撤销后的currCanvas，undoStrokes最多存5笔
      redrawUndoCanvas() {
        this.context.clearRect(0, 0, this.w, this.h);
        this.undoStrokes.forEach(stroke => {
          this.drawStrokeData(this.context, stroke);
        });
      },

      //更新坐标函数
      updateXY(e) {
        this.current.x = (e.clientX || e.touches[0].clientX) - 1; //减1是减去border的1px
        this.current.y =
          (e.clientY || e.touches[0].clientY) -
          this.$refs.infoBar.clientHeight -
          1;
      },

      selectColor(color) {
        this.current.color = color;
        this.showPalette = false;
      },

      selectBrush(size) {
        this.current.width = size;
        this.showBrush = false;
      },

      //点击清空画布函数
      handleClearCanvas() {
        const _this = this;
        this.$vux.confirm.show({
          title: "操作提示",
          content: "确认清空画布吗？",
          onConfirm() {
            _this.clearCanvas();
            _this.$socket.emit("clearCanvas", _this.roomId);
          }
        });
      },

      //清空画布函数
      clearCanvas() {
        this.context.clearRect(0, 0, this.w, this.h);
        this.backContext.clearRect(0, 0, this.w, this.h);
        this.currStroke = [];
        this.redoStrokes = [];
        this.undoStrokes = [];
        this.$refs.undoLabel.style.color = this.$refs.redoLabel.style.color =
          this.unableDoColor; //undo和redo变为灰色
        this.erase = false;
      },

      handleErase() {
        this.showBrush = true;
        this.erase = true;
      },

      getTimerLabel() {
        return this.timerSec > 0 ? this.timerSec : "";
      },

      timerRun() {
        if (this.timerSec < 0) {
          this.timerSec = 0;
          return;
        }
        this.timerSec -= 1;
        this.timer = setTimeout(this.timerRun, 1000);
      },

      setTimer(sec) {
        //设置定时器函数
        if (this.timer) {
          clearTimeout(this.timer);
          this.timer = null;
        }
        if (sec == 0) {
          this.timerSec = 0;
          return;
        }
        this.timerSec = sec;
        this.timerRun();
      },

      setTip(text) {
        //设置tipText函数
        this.showTipLabel = false;
        this.tipText = text;
        this.showTipLabel = true;
      },

      // getPlayerCont(player) {
      //   return player.uid == this.userInfo.uid ? '我' :
      //     `${player.username}`;
      // },

      sendTalk() {
        if (this.inputText && this.inputText != this.gameData.word) {
          let copyText = `${this.userInfo.username}: ${this.inputText}`; //用来缓存inputText
          this.inputText = '';
          this.$socket.emit('talk', {
            userInfo: this.userInfo,
            roomId: this.roomId,
            text: copyText,
          });
        }

        //如果答对了
        if (this.inputText == this.gameData.word) {
          if (!this.correct) { //如果还没答对
            this.correct = true;
            this.$socket.emit('correct', {
              roomId: this.roomId,
              userInfo: this.userInfo,
              index: this.seatIndex
            });
          } else {
            this.pushTalk('您已经答对了');
          }

          this.inputText = '';
        }
      },

      pushTalk(text, color) {
        if (!color) {
          color = '#409eff'
        }
        this.talkQueue.push([text, color]);
        if (!this.talkTimer) this.popTalk();
      },

      popTalk() {
        if (this.talkQueue.length == 0) {
          clearTimeout(this.talkTimer);
          this.talkTimer = null;
          return;
        }
        this.flyingTalkNum++;
        let textNColor = this.talkQueue.shift();
        let text = textNColor[0];
        let color = textNColor[1];
        let textEle = this.$refs.talkText.cloneNode()
        textEle.innerHTML = text;
        textEle.style.color = color;
        // console.log(text, color); 
        this.$refs.talkCont.appendChild(textEle);
        let textWidth = textEle.offsetWidth;
        // console.log('textWidth', textWidth);

        Velocity(textEle, {
          left: "-200px",
        }, {
          easing: "linear",
          duration: 4000,
          complete: (ele) => {
            // console.log(ele);
            this.$refs.talkCont.removeChild(textEle);
            this.flyingTalkNum--;
          }
        })

        this.talkTimer = setTimeout(this.popTalk, textWidth * 8 + 3000);
      },

      //设置outputLabel和显示时间
      setOutputLabel(text, showMsec) {
        return new Promise((resolve) => {
          this.outputText = text;
          this.outputShow = true;
          clearTimeout(this.outputTimer);
          this.outputTimer = setTimeout(() => {
            this.outputShow = false;
            resolve();
          }, showMsec)
        })
      },

      //设置endRoundPanel显示时间
      setEndRoundPanel(text, showMsec) {
        return new Promise((resolve) => {
          this.endRoundText = text;
          this.showEndRoundPanel = true;
          clearTimeout(this.endRoundTimer);
          this.endRoundTimer = setTimeout(() => {
            this.showEndRoundPanel = false;
            resolve();
          }, showMsec)
        })
      },

      enablePaint(enable) {
        this.paintEnable = enable;
        // console.log('paintEnable', this.paintEnable);
        if (enable) {
          this.toolBarShow = true;
          this.talkInputShow = false;
          this.inputText = '';
          this.$refs.talkInput.blur();
        } else {
          this.toolBarShow = false;
          this.talkInputShow = true;
        }
      },

      wait(func, msec) { //延时函数
        var timer = setTimeout(function () {
          func();
          clearTimeout(timer);
          timer = null;
        }, msec);
      },

      emitStartGame() {
        this.$socket.emit('startGame', this.roomId);
      },

      emitEndRound() {
        if (this.seatIndex == this.gameData.drawerIndex) {
          this.$socket.emit('endRound', this.roomId);
        }
        this.correct = false;
        this.correctNum = 0;
        this.gameData.state = 'endRound';
      },

      saveGameData() {
        sessionStorage.setItem('gameData', JSON.stringify(this.gameData));
      },

      saveGameSeats() {
        sessionStorage.setItem('gameSeats', JSON.stringify(this.gameSeats));
      },

      getGameSeats() {
        if (this.$route.params.gameSeats) {
          this.gameSeats = this.$route.params.gameSeats;
        } else {
          this.gameSeats = JSON.parse(sessionStorage.getItem('gameSeats'));
        }
        this.gameSeats.forEach((player, index) => {
          if (player.uid == this.userInfo.uid) {
            this.seatIndex = index;
            console.log('seatIndex', this.seatIndex);
          }
        })
      },

      getGameData() {
        if (this.$route.params.gameData) {
          this.gameData = this.$route.params.gameData;
        } else {
          this.gameData = JSON.parse(sessionStorage.getItem('gameData'));
        }
      },

      //设置分数
      setPlayerScore(player, index) {
        if (player.roundScore == 0) { //本轮没得分就直接返回
          // console.log('score unchanged');
          return player.sumScore;
        } else {
          let text = `${player.sumScore} (+${player.roundScore})`;

          //获取要改变分数的dom
          let scoreEle = this.$refs.playerScores[index];
          console.log(scoreEle);
          // scoreEle.velocity('fadeIn');
        }
      },

      initContext() {
        this.context = this.$refs.canvas.getContext("2d");
        this.backContext = this.$refs.backCanvas.getContext("2d");
        this.$refs.canvas.width = this.$refs.backCanvas.width =
          document.body.clientWidth;
        this.w = this.$refs.canvas.width;
        this.h = this.$refs.canvas.height;
      }
    },

    computed: { //可以缓存数据
      getPlayerCont() {
        return function (player) {
          console.log('cnm1');
          return player.uid == this.userInfo.uid ? '我' : `${player.username}`;
        }
      },
    },

    mounted() {
      this.getGameData();
      this.getGameSeats();
      this.saveGameData();
      this.saveGameSeats();
      console.log("roomId:", this.roomId);
      console.log("gameData:", this.gameData);
      this.initContext();
    },

    watch: {
      timerSec: function (val) {
        if (this.gameData.state == 'round' && val == 0) {
          // console.log('watch1');
          this.wait(this.emitEndRound, 1000);
        }
      },   correctNum: function (val) {
        if (val == this.gameSeats.length - 1) {
          // console.log('watch2');
          this.wait(this.emitEndRound, 1000);
        }
      },

      endGame: function (val) {
        if (val) {
          document.body.style.position = 'fixed';
          document.body.style.width = "100%";
        }
      }
    }
  };

</script>

<style scoped src='../styles/draw.css'>
  /* @import '../styles/draw.css'; */

</style>
