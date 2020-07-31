<template>
    <div class='wrapper mask' v-show='show'>
        <div class='main'>
            <h1>选择绘制方式</h1>
            <div class='group'>
                <div class='group-item' @click="manualClick">
                    <div class='item-icon draw-icon'></div>
                    <span class='item-name'>手动自由绘制</span>
                    <div class='desc-wrapper'>
                        <span class='item-desc'>手动绘制</span>
                        <span class='item-desc'>自由户型</span>
                    </div>
                </div>
                <div class='group-item copy-item' @click="importClick">
                    <div class='item-icon copy-icon'></div>
                      <label class="item-name">导入临摹图</label>
                      <input type="file" ref="fileInput" style="position:absolute; clip:rect(0 0 0 0);"
                         accept="image/png, image/jpeg, image/gif, image/jpg" @change='unloadImg'>
                    <div class='desc-wrapper'>
                        <span class='item-desc'>支持临摹</span>
                        <span class='item-desc'>自动识别</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
  name: 'chooseDrawWay',
  props: {
    uploaded: Boolean,
    chooseDw: Boolean
  },
  data () {
    return {
      manualClicked: false
    }
  },
  computed: {
    show () {
      return !this.chooseDw && !this.manualClicked && !this.uploaded
    }
  },
  methods: {
    manualClick () {
      this.manualClicked = true
    },
    importClick () {
      this.$refs.fileInput.click()
    },
    unloadImg (e) {
      if (!e) {
        return
      }
      this.$emit('unloadImg', e)
    }
  },
  mounted () {
  }
}
</script>

<style lang="scss" scoped>
   .wrapper {
       display: flex;
       justify-content: center;
       align-items: center;
       position: absolute;
       top: 0;
       left: 0;
       width: 100%;
       height: 100%;
       &.mask {
           background-color: rgba(0, 0, 0, 0.3);
       }
       .main {
           display: flex;
           flex-direction: column;
           justify-content: flex-start;
           align-items: center;
           width: 1024px;
           height: 548px;
           padding-top: 62px;
           border-radius: 4px;
           background-color: #fff;
           h1 {
               font-size: 24px;
               font-weight: lighter;
               text-align: center;
               color: #232132;
           }
           .group {
               display: flex;
               margin-top: 60px;
               .group-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    cursor: pointer;
                    &.copy-item {
                        margin-left: 268px;
                    }
                   .item-icon {
                       width: 136px;
                       height: 114px;
                       &.draw-icon {
                           background-image: url('../assets/icon_ShouDongZiYouHuiZhi0.png');
                           background-size: cover;
                           &:hover, &.active {
                               background-image: url('../assets/icon_ShouDongZiYouHuiZhi2.png');
                               background-size: cover;
                           }
                       }
                       &.copy-icon {
                           background-image: url('../assets/icon_DaoRuLinMoTu0.png');
                           background-size: cover;
                           &:hover, &.active {
                                background-image: url('../assets/icon_DaoRuLinMoTu2.png');
                                background-size: cover;
                           }
                       }
                   }
                   .item-name {
                       display: block;
                       margin-top: 32px;
                       font-size: 24px;
                       color: #232132;
                   }
                   .desc-wrapper {
                       display: flex;
                       flex-direction: column;
                       justify-content: flex-start;
                       align-items: center;
                       margin-top: 10px;
                       width: 100%;
                       .item-desc {
                           font-size: 15px;
                           font-weight: lighter;
                           color: #949494;
                       }
                   }
                }
            }

        }
    }
</style>
