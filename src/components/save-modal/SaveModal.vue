<template>
  <div class="mask" v-show='show'>
      <div class='wrapper'>
        <span class='title'>操作保存提示</span>
        <div class='main'>
          <span class='warn'>如果不保存，您操作的内容会丢失</span>
          <div class='btn-wrapper'>
            <span class='exit' @click='exitClick'>直接退出</span>
            <span class='cancel' @click='cancelClick'>取消</span>
            <span class='save' @click='saveClick'>保存</span>
          </div>
        </div>
        <div class='close-wrapper' @click='closeClick'>
          <i class='el-icon-close'></i>
        </div>
      </div>
  </div>
</template>

<script>
export default {
  name: 'saveModal',
  props: {
    saveShow: {
      type: Boolean
    }
  },
  data () {
    return {
      close: false
    }
  },
  computed: {
    show () {
      return this.saveShow && !this.close
    }
  },
  methods: {
    exitClick () {
      this.$emit('exit')
      this.close = true
      setTimeout(() => {
        this.close = false
      }, 500)
    },
    cancelClick () {
      this.$emit('resetSaveModal')
      this.close = true
      setTimeout(() => {
        this.close = false
      }, 500)
    },
    saveClick () {
      this.$emit('saveConfirm')
      this.close = true
      setTimeout(() => {
        this.close = false
      }, 500)
    },
    closeClick () {
      this.$emit('resetSaveModal')
      this.close = true
      setTimeout(() => {
        this.close = false
      }, 500)
    }
  }
}
</script>

<style lang="scss" scoped>
  * {
    box-sizing: border-box;
  }
  .mask {
    display: flex;
    justify-content: center;
    align-items: center;
    position:absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    background-color: rgba(0, 0, 0, .2);
    .wrapper {
      position: relative;
      width: 464px;
      height: 280px;
      border-radius: 2px;
      border: 2px solid #8972ff;
      background-color: #fff;
      .title {
        display: block;
        width: 100%;
        height: 56px;
        line-height: 56px;
        text-align: center;
        font-size: 18px;
        color: #fff;
        background-color: #8972ff;
      }
      .main {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        height: 224px;
        padding: 60px 0 30px;
        .warn {
          display: block;
          width: 100%;
          text-align: center;
          font-size: 15px;
          color: #6e6e6e;
        }
        .btn-wrapper {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          .exit,
          .cancel,
          .save {
            width: 100px;
            height: 44px;
            padding-left: 4px;
            line-height: 44px;
            border-radius: 4px;
            font-size: 14px;
            letter-spacing: 10px;
            text-align: center;
            background-color: #eee;
            cursor: pointer;
          }
          .exit {
            letter-spacing: 5px;
            color: #6e6e6e;
          }
          .cancel {
            margin-left: 20px;
            color: #6e6e6e;
          }
          .save {
            margin-left: 20px;
            color: #8972ff;
          }
        }
      }
      .close-wrapper {
        position: absolute;
        top: 20px;
        right: 16px;
        cursor: pointer;
        i {
          font-size: 20px;
          font-weight: bolder;
          color: #fff;
        }
      }
    }
  }
</style>
