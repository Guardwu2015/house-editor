<template>
    <div class='kits' v-show="isShow">
      <el-dropdown @command="handleCommand">
        <div id='import-copy'></div>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item command='import'>导入临摹图</el-dropdown-item>
          <el-dropdown-item v-if="selected.type === 'wall'" command="update-scale">举一反三</el-dropdown-item>
          <el-dropdown-item :disabled="disable" command='show'>{{showText}}临摹图</el-dropdown-item>
          <el-dropdown-item :disabled="disable"  command='change'>修改比例尺</el-dropdown-item>
          <el-dropdown-item :disabled="disable" command='alpha'>墙体透明度</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
      <el-dropdown @command="handleRotate">
        <div id='rotate' :class="{'active': rotate}" @click='triggerFlipping'></div>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item command='vertical'>垂直镜像</el-dropdown-item>
          <el-dropdown-item command='horizontal'>水平镜像</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
      <span class='undo' :class="{'active': undo}" @click='undoClick'></span>
      <span class='redo' :class="{'active': redo}" @click='redoClick'></span>
      <span class='clear' :class="{'active': clear}" @click='houseClear'></span>
    </div>
</template>

<script>
export default {
  name: 'kits',
  props: {
    show: Boolean,
    selected: Object,
    uploaded: Boolean
  },
  data () {
    return {
      rotate: false,
      undo: false,
      redo: false,
      clear: false,
      showText: '隐藏', // 用于点击时显示临摹图和隐藏临摹图切换
      showCopy: true,
      flag: false
    }
  },
  computed: {
    isShow () {
      return this.show
    },
    disable () {
      return !this.uploaded
    }
  },
  methods: {
    importClick () {
      console.log('导入临摹图')
    },
    triggerFlipping () { // 切换按钮颜色
      this.rotate = !this.rotate
    },
    undoClick () {
      this.undo = !this.undo
      this.$emit('undo')
    },
    redoClick () {
      this.redo = !this.redo
      this.$emit('redo')
    },
    houseClear () {
      this.clear = !this.clear
      this.$emit('houseClear')
    },
    handleCommand (command) {
      // this.$message('click on item ' + command)
      switch (command) {
        case 'update-scale':
          // eslint-disable-next-line no-case-declarations
          let expectLength = prompt('请输入长度', this.selected.item.length().toString())
          if (expectLength != null) {
            expectLength = parseInt(expectLength)
          }
          if (expectLength == null || Number.isNaN(expectLength) || expectLength <= 0) {
            break
          }
          this.$emit('update-scale', expectLength / this.selected.item.length())
          break
        case 'import':
          this.$emit('importPromptShow')
          break
        case 'alpha':
          this.$emit('changeAlphaShow')
          break
        case 'show':
          this.showCopy = !this.showCopy
          this.showText = this.showCopy ? '隐藏' : '显示'
          this.$emit('switchCopyShow', this.showCopy)
          break
        case 'change':
          this.$emit('triggerRulerShow')
          break
        default:
          break
      }
    },
    handleRotate (rotate) {
      switch (rotate) {
        case 'horizontal':
          this.$emit('horizontalFlipping')
          break
        case 'vertical':
          this.$emit('verticalFlipping')
          break
        default:
          this.$emit('verticalFlipping')
          break
      }
    }
  }
}
</script>

<style lang="scss" scoped>
    .kits {
        display: flex;
        justify-content: center;
        align-items: center;
        position: absolute;
        top: 48px;
        left: calc(50vw - 213px);
        width: 662px;
        height: 40px;
        background: rgba(255, 255, 255, 0.8);
        span {
            display: black;
            width: 28px;
            height: 28px;
            margin-right: 48px;
            cursor: pointer;
            &.undo {
                background: url("../assets/icon_Chexiao0.png");
                background-size: cover;
                &.active {
                background: url("../assets/icon_Chexiao2.png");
                background-size: cover;
                }
            }
            &.redo {
                background: url("../assets/icon_FanCheXiao0.png");
                background-size: cover;
                &.active {
                background: url("../assets/icon_FanCheXiao2.png");
                background-size: cover;
                }
            }
            &.clear {
                margin-right: 0;
                background: url("../assets/icon_QingKong0.png");
                background-size: cover;
                &.active {
                background: url("../assets/icon_QingKong2.png");
                background-size: cover;
                }
            }
        }
        #import-copy {
          display: block;
          width: 24px;
          height: 24px;
          margin-right: 48px;
          background: url("../assets/icon_DaoRuLinMoTu0.png");
          background-size: 100% 100%;
          &.active {
            background: url("../assets/icon_DaoRuLinMoTu2.png");
            background-size: 100% 100%;
          }
          cursor: pointer;
        }
        #rotate {
            width: 28px;
            height: 28px;
            margin-right: 48px;
            cursor: pointer;
            background: url("../assets/icon_FanZhuan0.png");
            background-size: contain;
            &.active {
            background: url("../assets/icon_FanZhuan2.png");
            background-size: contain;
            }
        }
  }
</style>
