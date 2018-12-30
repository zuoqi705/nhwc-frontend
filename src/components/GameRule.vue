<template>
  <div>
    <div id="gameTitle">
      <div class="flex1">游戏规则</div>
      <x-button mini type="primary" @click.native="$router.push('/')">返回</x-button>
    </div>

    <div id="ruleText">
      每一局中每名玩家有<span class="starText">3</span>次绘画机会，每一轮的起始剩余时间为<span class="starText">80s</span>
      ，并在开始时给出要猜的词的第一个提示，当剩余时间为<span class="starText">60s</span>时给出第二个提示；<br><br>
      当有第一个玩家猜对了词后，剩余时间调整为<span class="starText">30s</span>；<br><br>
      每猜对一人，本轮中画的玩家加<span class="starText">1</span>分，其中第一名猜对的玩家加<span class="starText">3</span>分
      剩余猜对的加<span class="starText">2</span>分，对局结束后分数最高的人胜出。


    </div>
  </div>
</template>

<script>
  export default {

  }

</script>

<style scoped>
 #ruleText {
   color: #606266;
   padding: 16px;
   font-size: 16px;
   margin-top: 12px;
   letter-spacing: 1.2px;
 }

 .starText {
   color: #409eff;
   background: #ecf8ff;
   padding: 0px 6px;
   border-radius: 2px;
   margin: 0 1px;
 }
</style>
