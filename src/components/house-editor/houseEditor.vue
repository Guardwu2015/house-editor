<template>
    <div class='house-editor' ref='houseEditor'>
      <div class='sidebar-left' ref='hideLeft' v-show="kitsShow">
        <div class='left-main'>
          <h3 class='house-design'>户型设计</h3>
        </div>
        <div class='hide-left-btn'></div>
      </div>
    </div>
</template>

<script>
import _ from 'lodash'
import { clone } from '@/utils/object'
import px from '@/utils/pixi-wrapper'
import C from '@/utils/constants'
import ViewMode from '@/mode/view'
import House from '@/model/house'
export default {
  name: 'house-editor',
  data () {
    return {
      containers: {
        axis: null,
        room: null,
        wall: null,
        window: null,
        door: null,
        cubicColumn: null,
        marking: null,
        alignment: null,
        copy: null // 临摹图容器
      },
      viewportFixedData: {
        x: null,
        y: null,
        scale: null
      },
      eventInfo: {
        kind: null,
        data: null
      },
      mode: 'view',
      modeHandlers: {
        view: new ViewMode(this)
      },
      kitsShow: true
    }
  },
  computed: {
    viewWidth () {
      return this.width || (this.$refs.houseEditor && this.$refs.houseEditor.clientWidth) || C.DEFAULT_WIDTH
    },
    viewHeight () {
      return this.height || (this.$refs.houseEditor.clientHeight) || this.viewWidth / C.DEFAULT_ASPECT_RATIO
    },
    realWorldSize () {
      return this.worldSize || C.DEFAULT_WORLD_SIZE
    },
    stage () {
      return this.app.stage
    },
    render () {
      return this.app.renderer
    },
    handler () {
      return this.modeHandlers[this.mode]
    }
  },
  watch: {
    data (newData) {
      this.house = new House(this)
      this.house.loadData(clone(newData))
    }
  },
  created () {
    this.house = new House(this)
  },
  mounted () {
    this.init()
  },
  methods: {
    init () {
      this.app = new px.Application({
        width: this.viewWidth,
        height: this.viewHeight,
        antialias: true,
        transparent: false,
        resolution: window.devicePixelRatio,
        backgroundColor: C.WORLD_BG_COLOR
      })
      this.app.renderer.autoResize = true
      this.app.ticker.add(this.onTicker)

      this.viewport = new px.Viewport({
        screenWidth: this.viewWidth,
        screenHeight: this.viewHeight,
        worldWidth: this.realWorldSize,
        worldHeight: this.realWorldSize
      })
      this.viewport.scale.set(C.DEFAULT_SCALE, C.DEFAULT_SCALE)

      // 初始化各种容器
      this.initContainers()

      // 绘制网格
      this.drawGrid()

      // this.setMode('view')

      this.app.view.addEventListener('contextmenu', e => e.preventDefault())
      this.$refs.houseEditor.appendChild(this.app.view)

      this.viewport.moveCenter(
        this.viewport.worldWidth / 2,
        this.viewport.worldHeight / 2
      )

      // window.addEventListener('keydown', this.keyboardEventHandler)

      document.addEventListener('click', (e) => {
        if (e.target.id !== 'ca' && e.target.id !== 'ca_wrapper') {
          this.caShow = false
        }
      })
    },
    initContainers () {
      this.containers.axis = new px.Container()
      this.containers.room = new px.Container()
      this.containers.wall = new px.Container()
      this.containers.door = new px.Container()
      this.containers.window = new px.Container()
      this.containers.cubicColumn = new px.Container()
      this.containers.marking = new px.Container()
      this.containers.alignment = new px.Container()
      this.containers.copy = new px.Container()
      // add children in order
      this.viewport.addChild(this.containers.axis)
      this.viewport.addChild(this.containers.room)
      this.viewport.addChild(this.containers.copy)
      this.viewport.addChild(this.containers.wall)
      this.viewport.addChild(this.containers.door)
      this.viewport.addChild(this.containers.window)
      this.viewport.addChild(this.containers.cubicColumn)
      this.viewport.addChild(this.containers.marking)
      this.viewport.addChild(this.containers.alignment)

      this.stage.addChild(this.viewport)
      this.viewport
        .drag()
        .wheel()
        .pinch()
        .decelerate()
        .bounce()
        .clampZoom({
          minWidth: C.SCALE_MIN_WIDTH,
          maxWidth: C.SCALE_MAX_WIDTH
        })

      this.bindViewportEvent('pointerdown')
      this.bindViewportEvent('pointermove')
      this.bindViewportEvent('pointerup')
      this.bindViewportEvent('rightclick')
      this.bindViewportEvent('drag-start')
      this.bindViewportEvent('drag-end')
      this.bindViewportEvent('clicked')
      this.bindViewportEvent('wheel')
    },
    bindViewportEvent (eventName) {
      const eventCallbackName = `on${_.upperFirst(_.camelCase(eventName))}`
      const self = this
      this.viewport.on(eventName, function () {
        let returnValue
        self.eventInfo.kind = eventName
        const e = arguments[0]
        if (e.world) {
          self.eventInfo.data = {
            screen: e.screen,
            world: e.world
          }
        } else if (e.data && e.data.global) {
          self.eventInfo.data = {
            screen: e.data.global,
            world: self.viewport.toWorld(e.data.global)
          }
        }
        if (self[eventCallbackName]) {
          self[eventCallbackName].apply(self, arguments)
        }
        if (self.handler) {
          if (self.handler[eventCallbackName]) {
            returnValue = self.handler[eventCallbackName].apply(
              self.handler,
              arguments
            )
            self.syncModeStatus()
          }
        }
        self.updateFixedViewport()
        return returnValue
      })
    },
    syncModeStatus () {
      this.viewport.cursor = this.handler.cursor()
    },
    updateFixedViewport () {
      if (this.viewportFixedData.x != null) {
        this.viewport.x = this.viewportFixedData.x
      }
      if (this.viewportFixedData.y != null) {
        this.viewport.y = this.viewportFixedData.y
      }
      if (this.viewportFixedData.scale != null) {
        this.viewport.scale.x = this.viewportFixedData.scale
        this.viewport.scale.y = this.viewportFixedData.scale
      }
    },
    drawGrid () {
      if (this.containers.axis) {
        let xAxis, yAxis
        if (this.containers.axis.children.length > 0) {
          [xAxis, yAxis] = this.containers.axis.children
          xAxis.clear()
          yAxis.clear()
        } else {
          xAxis = new px.Graphics()
          yAxis = new px.Graphics()
          this.containers.axis.addChild(xAxis)
          this.containers.axis.addChild(yAxis)
        }
        const step = C.AXIS_STEP
        const xSum = Math.floor(this.viewport.worldHeight / step)
        const ySum = Math.floor(this.viewport.worldWidth / step)
        for (let i = 0; i < xSum; i++) {
          let axisColor = C.AXIS_COLOR
          if (i % 10 === 0) {
            axisColor = C.AXIS_COLOR_BLACK
          }
          xAxis.lineStyle(C.AXIS_THICKNESS / this.viewport.scale.x, axisColor, C.AXIS_ALPHA)
          xAxis.moveTo(0, i * step)
          xAxis.lineTo(this.realWorldSize, i * step)
        }
        for (let i = 0; i < ySum; i++) {
          let axisColor = C.AXIS_COLOR
          if (i % 10 === 0) {
            axisColor = C.AXIS_COLOR_BLACK
          }
          yAxis.lineStyle(C.AXIS_THICKNESS / this.viewport.scale.y, axisColor, C.AXIS_ALPHA)
          yAxis.moveTo(i * step, 0)
          yAxis.lineTo(i * step, this.realWorldSize)
        }
      }
    },
    setMode (mode) {
    },
    keyboardEventHandler () {
      const e = arguments[0]
      if (e.defaultPrevented) {
        return
      }
      if (document.activeElement !== document.body) {
        // 确保当前没有选中的元素
        return
      }
      let key = null
      if (e.key !== undefined) {
        key = e.key
      } else if (e.keyCode !== undefined) {
        key = {
          37: 'ArrowLeft',
          38: 'ArrowUp',
          39: 'ArrowRight',
          40: 'ArrowDown'
        }[e.keyCode] || String.fromCharCode(e.keyCode)
      }
      if (!key) {
        return
      }
      if (key === ' ') {
        key = 'Space'
      }
      let handled = false
      const eventCallbackName = `on${_.upperFirst(e.type)}`
      const keyCallbackName = eventCallbackName + _.upperFirst(key)
      if (this[keyCallbackName]) {
        this[keyCallbackName].apply(this, arguments)
        handled = true
      } else if (this[eventCallbackName]) {
        this[eventCallbackName].apply(this, arguments)
        handled = true
      }

      if (this.handler) {
        if (this.handler[keyCallbackName]) {
          this.handler[keyCallbackName].apply(this.handler, arguments)
          handled = true
        } else if (this.handler[eventCallbackName]) {
          this.handler[eventCallbackName].apply(this.handler, arguments)
          handled = true
        }
      }
      if (handled) {
        e.preventDefault()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.house-editor {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    cursor: default;
    user-select: none;
    overflow: hidden;
    .sidebar-left {
      $size-top: 48px;
      $size-left: 270px;
      $border-bottom: 1px solid #eee;
      position: absolute;
      display: flex;
      align-items: center;
      top: 0;
      bottom: 0;
      left: 0;
      padding: 0;
      width: $size-left;
      margin-top: $size-top;
      border: $border-bottom;
      .left-main {
        width: 270px;
        height: 100%;
        padding: 0 14px;
        background-color: #fff;
      }
      .hide-left-btn {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 14px;
        height: 54px;
        border-top-right-radius: 2px;
        border-bottom-right-radius: 2px;
        background-color: #fff;
        cursor: pointer;
      }
    }
}
</style>
