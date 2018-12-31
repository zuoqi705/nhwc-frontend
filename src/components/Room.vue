<template>
  <div v-if="!start">
    <div id="seatCont">
      <!-- <x-header :title="name" 
      id="roomHeader" 
      :left-options="{backText: '离开'}" 
      left-options.preventGoBack="false"
      @on-click-back="$router.replace('/')">
      </x-header>-->
      <div id="roomHeader">
        <img src="static/logo.jpg" id="logo">
        <div id="titleCont">
          <div id="roomTitle">你画我猜</div>
          <div id="roomName" class="ellipsis">{{name}}</div>
        </div>
        <div id="btnCont">
          <x-button mini type="primary" @click.native="$router.replace('/')">返回主页</x-button>
          <x-button mini type="primary" style="margin: 0 0 0 8px;" @click.native="copyUrl">邀请好友</x-button>
        </div>
      </div>

      <div id="seatOutput" v-show="roomData.players.length<2" ref="seatOutput">
        请耐心等待朋友进入房间或者立即邀请朋友加入
        <span style="font-size:20px;">👆</span>
      </div>

      <flexbox :gutter="0" wrap="wrap" style="margin-top:20px;position:relative">
        <flexbox-item
          :span="1/4"
          v-for="seat in roomData.seats"
          :key="seat.index"
          @click.native="seatClick(seat)"
          class="outBtnSeat"
        >
          <div class="btnSeat" :class="{btnSitSeat:seat.sitted}">
            {{
            getSeatName(seat) }}
          </div>
        </flexbox-item>
      </flexbox>
      <x-button
        :disabled="getBtnStatus()"
        id="startBtn"
        type="primary"
        class="primaryBtn"
        @click.native="enterDraw"
      >{{getBtnText()}}</x-button>
    </div>

    <div id="talkCont" ref="talkCont">
      <div id="talkText" ref="talkText"></div>
    </div>

    <group>
      <group-title slot="title" class="groupTitle">
        <span>聊天输入框</span>
      </group-title>
      <x-input
        id="talkInput"
        :max="10"
        placeholder="最多十个字"
        v-model="inputText"
        @keyup.enter.native="sendText"
      >
        <x-button slot="right" mini @click.native="sendText" type="primary">发送</x-button>
      </x-input>
    </group>

    <group style="margin-top:24px">
      <group-title slot="title" class="groupTitle">
        <span>{{roomTitle}}</span>
      </group-title>
      <cell-box style="display:flex;flex-wrap:wrap;padding:0 0 12px 12px">
        <div class="playerContent" v-for="player in roomData.players" :key="player.uid">
          {{player.uid == userInfo.uid ? `${player.username}(我)`
          :`${player.username} `}}
        </div>
      </cell-box>
    </group>
  </div>
</template>

<script>
import { XHeader } from "vux";

import roomSockets from "../sockets/roomSockets";

export default {
  data() {
    return {
      start: false, //表示该房间游戏是否已经开始
      name: `${this.$route.params.ownername ||
        JSON.parse(sessionStorage.getItem("roomData")).ownername}的房间`,
      roomId:
        this.$route.params.roomId ||
        JSON.parse(sessionStorage.getItem("roomData")).roomId,
      userInfo: JSON.parse(sessionStorage.getItem("userInfo")), //进入该房间的用户信息,从sessionStorage中直接获取
      // seats: [],
      sitindex: "null", //用来储存自己的index
      inputText: "", //绑定输入框内容
      talkQueue: [], //用来保存talk队列
      talkTimer: null, //计时器
      roomTitle: "",
      gameData: {},
      roomData: {
        ownerSocketId: "",
        ownername: "",
        uid: "",
        players: [],
        roomId: "",
        seats: [],
        sittedNum: 0
      }
    };
  },
  sockets: roomSockets,
  components: {
    XHeader
  },
  methods: {
    getSeatName(seat) {
      // console.log('getSeat', seat);
      if (seat.sitted) {
        if (seat.userInfo.uid == this.userInfo.uid) {
          return "我";
        } else return seat.userInfo.username;
      } else return "坐下";
    },
    getBtnText() {
      if (this.sitindex == 0 && this.roomData.sittedNum < 2) {
        return "至少需要2人开始游戏";
      } else if (this.sitindex != 0) return "坐第一个位置有权开始游戏";
      else return "开始游戏";
    },
    getBtnStatus() {
      if (this.sitindex == 0 && this.roomData.sittedNum >= 2) return false;
      else return true;
    },
    enterDraw() {
      this.$socket.emit("enterDraw", {
        roomId: this.roomId,
        seats: this.roomData.seats
      });
    },
    seatClick(seat) {
      // console.log(seat.userInfo.uid);
      if (seat.sitted && this.sitindex == seat.index) {
        //从自己座位上起来
        console.log("type1");
        this.roomData.seats[this.sitindex].sitted = false;
        this.roomData.seats[this.sitindex].userInfo = {};
        this.roomData.sittedNum -= 1;
        this.sitindex = "null";
        this.emitSeats();
      } else if (!seat.sitted && this.sitindex != "null") {
        //自己已坐下但要换座位
        console.log("type2");
        //原先座位要变为空座
        this.roomData.seats[this.sitindex].sitted = false;
        this.roomData.seats[this.sitindex].userInfo = {};

        //将sitindex设为现在的座位
        this.sitindex = seat.index;
        this.roomData.seats[this.sitindex].sitted = true;
        this.roomData.seats[this.sitindex].userInfo = this.userInfo;
        //更新seats信息
        this.roomData.seats[this.sitindex].userInfo = this.userInfo;
        this.emitSeats();
      } else if (!seat.sitted && this.sitindex == "null") {
        //自己要找空座坐下
        console.log("type3");
        //将sitindex设为现在的座位
        this.sitindex = seat.index;
        this.roomData.seats[this.sitindex].sitted = true;
        this.roomData.seats[this.sitindex].userInfo = this.userInfo;
        this.roomData.sittedNum += 1;
        this.emitSeats();
      }
    },
    emitSeats() {
      //先把数据存起来
      sessionStorage.setItem("roomData", JSON.stringify(this.roomData));
      sessionStorage.setItem("sitindex", this.sitindex);
      this.$socket.emit("seats", {
        roomId: this.roomId,
        seats: this.roomData.seats,
        sittedNum: this.roomData.sittedNum
      });
    },

    sendText() {
      //聊天内容动画显示
      if (this.inputText) {
        let copyText = `${this.userInfo.username}: ${this.inputText}`; //用来缓存inputText
        this.inputText = "";
        this.$socket.emit("message", {
          userInfo: this.userInfo,
          roomId: this.roomId,
          text: copyText
        });
      }
    },
    pushTalk(text) {
      this.talkQueue.push(text);
      if (!this.talkTimer) this.popTalk();
    },
    popTalk() {
      if (this.talkQueue.length == 0) {
        clearTimeout(this.talkTimer);
        this.talkTimer = null;
        return;
      }

      var text = this.talkQueue.shift();
      let textEle = this.$refs.talkText.cloneNode();
      textEle.innerHTML = text;
      this.$refs.talkCont.appendChild(textEle);
      var textWidth = textEle.offsetWidth;
      console.log("textWidth", textWidth);

      Velocity(
        textEle,
        {
          left: "-100px"
        },
        {
          easing: "linear",
          duration: 4000,
          complete: ele => {
            // console.log(ele);
            this.$refs.talkCont.removeChild(textEle);
          }
        }
      );

      this.talkTimer = setTimeout(this.popTalk, textWidth * 8 + 3000);
    },

    copyUrl() {
      let url = window.location.href;
      this.$copyText(url).then(res => {
				// console.log("​copyUrl -> res", res)
        this.$vux.toast.show({
          text: '分享链接已复制到剪贴板',
          type: 'text',
          width: '20em',
          time: '2000',
          position: 'bottom'
        })
      }).catch(err => {
				// console.log("​copyUrl -> err", err)
      })
    }
  },
  mounted() {
    this.axios
      .get("/start", {
        params: {
          roomId: this.roomId
        }
      })
      .then(res => {
				// console.log("​mounted -> res", res);
        if (res.data) {
          this.start = true;
          const _this = this;
          this.$vux.confirm.show({
            title: "提示",
            content: "该房间已经开始游戏",
            showCancelButton: false,
            onConfirm() {
              _this.$router.replace("/");
            }
          });
        } else this.start = false;
      })
      .catch(err => {
				// console.log("​mounted -> err", err);
      });
    if (JSON.parse(sessionStorage.getItem("roomData"))) {
      this.roomData = JSON.parse(sessionStorage.getItem("roomData"));
      this.roomTitle = `目前房间有${this.roomData.players.length}人`;
      console.log("roomData2", this.roomData);
    } else {
      this.roomData = this.$route.params.roomData;
      console.log("roomData1", this.roomData);
      sessionStorage.setItem("roomData", JSON.stringify(this.roomData));
      this.roomTitle = `目前房间有${this.roomData.players.length}人`;
    }
    if (sessionStorage.getItem("sitindex")) {
      this.sitindex = sessionStorage.getItem("sitindex");
      console.log("sitindex:", typeof this.sitindex);
    }
  },

  watch: {
    "roomData.players.length": function(val, oldVal) {//监听当前房间人数实现动画
      if (val < 2) {
        let el = this.$refs.seatOutput;
        Velocity(
          el,
          {
            top: "0px"
          },
          {
            duration: 500,
            delay: 500
          }
        );
      }
    }
  },

  beforeRouteLeave(to, from, next) {
    //导航守卫
    if (to.name == "Home") {
      if (this.sitindex != "null") {
        this.roomData.seats[this.sitindex].sitted = false;
        this.roomData.seats[this.sitindex].userInfo = {};
        this.roomData.sittedNum -= 1;
        this.sitindex = "null";
        sessionStorage.setItem("roomData", JSON.stringify(this.roomData));
        sessionStorage.setItem("sitindex", this.sitindex);
      }
      this.$socket.emit("leave", {
        roomId: this.roomId,
        userInfo: this.userInfo
      });
    }
    // console.log('to', to);
    // console.log('from', from);
    next();
  }
};
</script>

<style scoped src='../styles/room.css'>
</style>
