<template>
  <div class='wrapper mask' v-show="show">
    <div class='main'>
      <h1>导入提示</h1>
      <span class='prompt'>导入新的临摹图，会清空当前的方案</span>
      <div class='group'>
        <div class='group-item' @click='cancelClick'>
          取消
        </div>
        <div class='group-item confirm-item' @click='confirmClick'>
          <label class="import-copy">确认导入</label>
          <input type="file" ref="fileInput" style="position:absolute; clip:rect(0 0 0 0);"
                 accept="image/png, image/jpeg, image/gif, image/jpg" @change='uploadImg'>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'chooseDrawWay',
  props: {
    ipShow: Boolean
  },
  data () {
    return {
      hide: false
    }
  },
  computed: {
    show () {
      return this.ipShow
    }
  },
  methods: {
    cancelClick () {
      this.$emit('changeIpShow')
    },
    confirmClick () {
      this.$refs.fileInput.click()
    },
    uploadImg (e) {
      if (!e) {
        return
      }
      this.$emit('uploadImg', e)
      this.hide = true
      this.$emit('houseClear')
    }
  }
}
</script>

<style lang="scss" scoped>
  .wrapper {
    display: flex;
    justify-content: center;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1000;
    &.mask {
      background-color: rgba(0, 0, 0, 0.3);
    }
    .main {
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: center;
      width: 590px;
      height: 328px;
      margin-top: 90px;
      padding-top: 62px;
      border-radius: 4px;
      background-color: #fff;
      h1 {
        font-size: 24px;
        text-align: center;
        color: #232132;
      }
      .prompt {
        font-size: 18px;
        color: #949494;
      }
      .group {
        display: flex;
        justify-content: center;
        align-items: center;
        margin-top: 58px;
        .group-item {
          width: 172px;
          height: 48px;
          line-height: 48px;
          font-size: 18px;
          border-radius: 4px;
          text-align: center;
          color: #949494;
          background-color: #fec12d;
          cursor: pointer;
          &.confirm-item {
            margin-left: 70px;
            color: #fff;
          }
        }
      }

    }
  }
</style>
