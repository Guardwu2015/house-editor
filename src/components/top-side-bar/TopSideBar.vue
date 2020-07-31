<template>
    <div class="wrapper">
      <div class='left'>
        <span class='completed' @click='completedClick'>完成</span>
        <slot></slot>
      </div>
      <div class='right'>
        <span class='feedback' :class="{'active': feedback}" @click='feedbackClick'>客服反馈</span>
        <span class='help-center' :class="{'active': helpCenter}" @click='helpCenterClick'>帮助中心</span>
      </div>
    </div>
</template>

<script>
export default {
  name: 'topSideBar',
  data () {
    return {
      feedback: false,
      helpCenter: false
    }
  },
  computed: {
  },
  methods: {
    completedClick () {
      this.$emit('completedClick')
    },
    feedbackClick () {
      this.feedback = !this.feedback
    },
    helpCenterClick () {
      this.helpCenter = !this.helpCenter
    }
  }
}
</script>

<style lang="scss" scoped>
    .wrapper {
        position: absolute;
        $size-top: 48px;
        $border-bottom: 1px solid #eee;

        display: flex;
        justify-content: space-between;
        align-items: center;
        top: 0;
        left: 0;
        right: 0;
        height: $size-top;
        background-color: #fff;
        border-bottom: $border-bottom;

        .left {
            display: flex;
            align-items: center;
            font-weight: lighter;
            .completed {
                display: block;
                width: 88px;
                height: 100%;
                line-height: $size-top;
                font-size: 15px;
                text-align: center;
                color: #fff;
                background-color: #fec12d;
                cursor: pointer;
            }

            input {
                margin-left: 14px;
                padding: 8px 10px;
                width: 168px;
                height: 32px;
                border-radius: 2px;
                border: 1px solid #eee;
                outline: none;
            }
        }

        .right {
            display: flex;
            justify-content: space-between;
            align-items: center;
            height: 100%;
            font-size: 15px;
            padding-right: 30px;
            font-weight: lighter;
            color: #232323;
            .feedback {
                margin-right: 54px;
                cursor: pointer;
                &.active {
                color: #8972ff;
                }
            }

            .help-center {
                &.active {
                color: #8972ff;
                cursor: pointer;
                }
            }
        }
    }
</style>
