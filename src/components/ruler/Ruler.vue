<template>
  <div class="scale-ruler" v-show="show">
    <div class="scale-ruler-wrapper" ref='wrapper' :style="transformStyle">
      <div class="scale-ruler-auxiliary-line" :class="{hidden: !displayAuxLine}" ref='aux_line'></div>
      <div class="scale-ruler" v-drag:start="syncDragStatus" v-drag:end="syncDragStatus" v-drag="onRulerMove"></div>
      <div class="anchors-wrapper">
        <div class="anchor anchor-start" v-drag:start="syncDragStatus" v-drag:end="syncDragStatus"
            v-drag="onStartMove"></div>
        <div class="anchor anchor-end" v-drag:start="syncDragStatus" v-drag:end="syncDragStatus"
            v-drag="onEndMove"></div>
      </div>
      <div class="line-segment-wrapper">
        <div class="line-segment"></div>
        <div class="line-segment-head line-segment-head-start">
          <div class="black-dot"></div>
        </div>
        <div class="line-segment-head line-segment-head-end">
          <div class="black-dot"></div>
        </div>
      </div>
      <div class="input-wrapper" :style="{transform: `rotate(${-rotation}deg)`}">
        <input maxlength="7" v-model.number="realWidth" ref='inputs' autofocus>
        <span class="unit-text">mm</span>
      </div>
    </div>
    <div class="scale-ruler-operations">
      <div class="scale-ruler-operation-button primary" @click="confirmClick">确认尺寸</div>
      <div class="scale-ruler-operation-button" @click="cancelClick">取消</div>
    </div>
    <div class="scale-ruler-message">
      <p class="message">为保证精确绘制，拖动标尺量出一段墙，并输入真实尺寸。</p>
      <p class="message">若户型图四周有数据标注，可直接量出某段标注，更加精确。</p>
    </div>
  </div>
</template>

<script>
import { DragDirective } from '../../../plugins/drag'

export default {
  name: 'ruler',
  directives: { drag: DragDirective },
  props: {
    show: Boolean
  },
  data () {
    return {
      mousedown: false,
      start: { x: 0, y: 0 },
      end: { x: 0, y: 0 },
      dragStatus: {
        start: { x: 0, y: 0 },
        end: { x: 0, y: 0 }
      },
      isMoving: false,
      width: 0,
      realWidth: null,
      scaleRulerWrapper: null,
      auxLine: null
    }
  },
  computed: {
    rotation () {
      let result = ((Math.asin((this.end.y - this.start.y) / this.length) / Math.PI) * 180) || 0
      if (this.start.x > this.end.x) {
        result = 180 - result
      }
      return result
    },
    center () {
      return { x: (this.start.x + this.end.x) / 2, y: (this.start.y + this.end.y) / 2 }
    },
    length () {
      return Math.sqrt((this.end.x - this.start.x) * (this.end.x - this.start.x) + (this.end.y - this.start.y) * (this.end.y - this.start.y))
    },
    displayAuxLine () {
      return this.isMoving && (this.start.x === this.end.x || this.start.y === this.end.y)
    },
    transformStyle () {
      const center = this.center
      return {
        transform: `translate(-50%, -50%) translateX(${center.x}px) translateY(${center.y}px) rotate(${this.rotation}deg) scale(1, 1)`,
        width: this.length + 'px'
      }
    }
  },
  methods: {
    cancelClick () {
      this.$emit('cancel')
    },
    confirmClick () {
      if (!this.realWidth || this.realWidth <= 0) {
        this.$message.error('请输入大于零的值')
        return
      }
      // this.$message.success(`结果：屏幕尺寸${this.length}，对应真实尺寸${this.realWidth}`)
      this.$emit('confirm', { screen: this.length, world: this.realWidth })
    },
    syncDragStatus (e) {
      this.dragStatus.start.x = this.start.x
      this.dragStatus.start.y = this.start.y
      this.dragStatus.end.x = this.end.x
      this.dragStatus.end.y = this.end.y
      this.isMoving = false
    },
    onRulerMove (e) {
      this.start.x = this.dragStatus.start.x + e.movementX
      this.start.y = this.dragStatus.start.y + e.movementY
      this.end.x = this.dragStatus.end.x + e.movementX
      this.end.y = this.dragStatus.end.y + e.movementY
      this.isMoving = false
    },
    onStartMove (e) {
      this.isMoving = true
      this.start.x = this.dragStatus.start.x + e.movementX
      this.start.y = this.dragStatus.start.y + e.movementY
      const threshold = this.length * 0.1
      if (Math.abs(this.start.x - this.end.x) < threshold) {
        this.start.x = this.end.x
      } else if (Math.abs(this.start.y - this.end.y) < threshold) {
        this.start.y = this.end.y
      }
    },
    onEndMove (e) {
      this.isMoving = true
      this.end.x = this.dragStatus.end.x + e.movementX
      this.end.y = this.dragStatus.end.y + e.movementY
      const threshold = this.length * 0.1
      if (Math.abs(this.start.x - this.end.x) < threshold) {
        this.end.x = this.start.x
      } else if (Math.abs(this.start.y - this.end.y) < threshold) {
        this.end.y = this.start.y
      }
    }
  },
  watch: {
    show (newVal, oldVal) {
      if (newVal) {
        const bodyHeight = window.screen.availHeight
        const bodyWidth = window.screen.availWidth
        this.start = {
          x: bodyWidth / 2 - 50,
          y: bodyHeight / 2
        }
        this.end = {
          x: bodyWidth / 2 + 50,
          y: bodyHeight / 2
        }
      }
    }
  },
  mounted () {
  }
}
</script>

<style lang="scss" scoped>
  .scale-ruler {
    .scale-ruler-wrapper {
      position: fixed;
      top: 0;
      left: 0;
      height: 20px;
      .scale-ruler-auxiliary-line {
        background: #5ce8ff;
        height: 1px;
        left: 50%;
        position: absolute;
        top: 50%;
        transform: translateX(-50%);
        width: 10000px;
        z-index: 1;
        &.hidden {
          opacity: 0;
        }
      }
      .scale-ruler {
        background: url('../assets/ruler.png') repeat-x;
        background-size: 20px;
        border-left: 1px solid #fa0;
        border-right: 1px solid #fa0;
        box-sizing: border-box;
        cursor: move;
        height: 20px;
        left: 0;
        position: absolute;
        top: 0;
        width: 100%;
      }
      .anchors-wrapper {
        .anchor {
          position: absolute;
          top: 4px;
          height: 12px;
          width: 12px;
          border: 1px solid #666;
          border-radius: 50%;
          box-sizing: border-box;
          background: #fff;
          cursor: move;
          &.anchor-start {
            left: -6px;
          }
          &.anchor-end {
            right: -6px;
          }
        }
      }
      .line-segment-wrapper {
        pointer-events: none;
        .line-segment {
          background: #1b1b1c;
          border: 1px solid #fff;
          box-sizing: border-box;
          height: 3px;
          left: 0;
          position: absolute;
          top: 59px;
          width: 100%;
        }
        .line-segment-head {
          background: #1b1b1c;
          border: 1px solid #fff;
          box-sizing: border-box;
          height: 17px;
          position: absolute;
          top: 52px;
          width: 3px;
          .black-dot {
            background: #1b1b1c;
            height: 1px;
            position: absolute;
            top: 7px;
            width: 3px;
          }
          &.line-segment-head-start {
            left: -1px;
            .black-dot {
              left: 0;
            }
          }
          &.line-segment-head-end {
            right: -1px;
            .black-dot {
              right: 0;
            }
          }
        }
      }
      .input-wrapper {
        background: #fff;
        border: 1px solid #f5f5f5;
        border-radius: 2px;
        box-sizing: border-box;
        height: 24px;
        left: 50%;
        margin-left: -46px;
        position: absolute;
        top: 48px;
        width: 96px;
        input {
          border: 0;
          box-sizing: border-box;
          color: #666;
          height: 22px;
          padding: 0 4px;
          text-align: right;
          width: 62px;
          outline: none;
          // border: 1px solid olive;
        }
        .unit-text {
          border-left: 1px solid #f5f5f5;
          box-sizing: border-box;
          color: #666;
          display: block;
          float: right;
          height: 22px;
          width: 28px;
        }
      }
    }
    .scale-ruler-operations {
      display: flex;
      justify-content: center;
      align-items: center;
      bottom: 74px;
      height: 48px;
      position: fixed;
      text-align: center;
      width: 100%;
      .scale-ruler-operation-button {
        $height: 30px;
        width: 100px;
        height: $height;
        line-height: $height;
        margin-left: 30px;
        padding: 0;
        font-size: 16px;
        border-radius: 4px;
        color: #fff;
        &.primary {
          background-color: #fec12d;
        }
        background-color: #232323;
        cursor: pointer;
      }
    }
    .scale-ruler-message {
      position: fixed;
      top: 100px;
      left: calc(50% - 165px);
      width: 562px;
      height: 90px;
      padding: 25px 0;
      border-radius: 4px;
      font-size: 16px;
      font-weight: 400;
      text-align: center;
      background: #fff;
      color: #828ba5;
      box-sizing: border-box;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(62, 129, 247, .2);
      .message {
        margin: 0;
        font-size: 14px;
        color: #949494;
      }
    }
  }
</style>
