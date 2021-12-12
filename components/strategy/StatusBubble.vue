<template>
  <div style="height: 12px; width: 30px">
    <div class="bubble" :class="{online: online}">
      <span class="bubble-outer-dot">
        <span class="bubble-inner-dot" />
      </span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StatusBubble',
  props: {
    online: {
      type: Boolean,
      required: true
    }
  }
}
</script>

<style lang="scss" scoped>
  .bubble {
    display: block;
    position: absolute;
    cursor: pointer;

    &:hover:after {
      background-color: red
    }

    &.online:hover:after {
      background-color: green;
    }

    &:after {
      content: "";
      background-color: red;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      position: absolute;
      display: block;
      top: 1px;
      left: 1px;
    }

    &.online:after {
      background-color: green;
    }

    &.online {
      .bubble-outer-dot {
        background-color: rgba(0, 128, 0, 0.4);
      }

      .bubble-inner-dot {
        background-color: rgba(0, 128, 0, 0.4);
        &:after {
          background-color: rgba(0, 128, 0, 0.4);
        }
      }
    }

    .bubble-outer-dot {
      margin: 1px;
      display: block;
      text-align: center;
      opacity: 1;
      background-color: rgba(255, 0, 0, 0.4);
      width: 12px;
      height: 12px;
      border-radius: 50%;
      -webkit-animation: bubble-pulse 1.5s linear infinite;
      -moz-animation: bubble-pulse 1.5s linear infinite;
      -o-animation: bubble-pulse 1.5s linear infinite;
      animation: bubble-pulse 1.5s linear infinite
    }

    .bubble-inner-dot {
      display: block;
      text-align: center;
      opacity: 1;
      background-color: rgba(255, 0, 0, 0.4);
      width: 12px;
      height: 12px;
      border-radius: 50%;
      -webkit-animation: bubble-pulse 1.5s linear infinite;
      -moz-animation: bubble-pulse 1.5s linear infinite;
      -o-animation: bubble-pulse 1.5s linear infinite;
      animation: bubble-pulse 1.5s linear infinite;

      &:after {
        content: "";
        display: block;
        text-align: center;
        opacity: 1;
        background-color: rgba(255, 0, 0, 0.4);
        width: 12px;
        height: 12px;
        border-radius: 50%;
        -webkit-animation: bubble-pulse 1.5s linear infinite;
        -moz-animation: bubble-pulse 1.5s linear infinite;
        -o-animation: bubble-pulse 1.5s linear infinite;
        animation: bubble-pulse 1.5s linear infinite
      }
    }
  }

  @-webkit-keyframes bubble-pulse {
    0% {
      transform: scale(1);
      opacity: .75
    }
    25% {
      transform: scale(1);
      opacity: .75
    }
    100% {
      transform: scale(2.5);
      opacity: 0
    }
  }

  @keyframes bubble-pulse {
    0% {
      transform: scale(1);
      opacity: .75
    }
    25% {
      transform: scale(1);
      opacity: .75
    }
    100% {
      transform: scale(2.5);
      opacity: 0
    }
  }

  @-moz-keyframes bubble-pulse {
    0% {
      transform: scale(1);
      opacity: .75
    }
    25% {
      transform: scale(1);
      opacity: .75
    }
    100% {
      transform: scale(2.5);
      opacity: 0
    }
  }

  @-o-keyframes bubble-pulse {
    0% {
      transform: scale(1);
      opacity: .75
    }
    25% {
      transform: scale(1);
      opacity: .75
    }
    100% {
      transform: scale(2.5);
      opacity: 0
    }
  }
</style>
