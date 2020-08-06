<template>
    <div class='house-editor' ref='houseEditor'>
      <div class='sidebar-left' ref='hideLeft' v-show="kitsShow">
        <div class='left-main'>
          <h3 class='house-design'>户型设计</h3>
          <draw-toolbox title="墙" :open="true">
            <template slot="box-items">
              <img-button :value="mode" @change="setMode" set-value="draw-wall:non-bearing" class-name="wall" text="画墙"/>
              <img-button :value="mode" @change="setMode" set-value="draw-wall:room" class-name="room" text="画房间"/>
              <el-input v-if="mode && mode.startsWith('draw-wall:')"
                        size="mini" type="number" v-model.number="handler.thickness" :min="10" :max="500"></el-input>
            </template>
          </draw-toolbox>
          <draw-toolbox title="门">
            <template slot="box-items">
              <img-button :value="mode" @change="setMode" set-value="draw-door:single" class-name="single" text="单开门"/>
              <img-button :value="mode" @change="setMode" set-value="draw-door:equal-double" class-name="double"
                          text="双开门"/>
              <img-button :value="mode" @change="setMode" set-value="draw-door:sliding" class-name="sliding" text="推拉门"/>
              <img-button :value="mode" @change="setMode" set-value="draw-door:opening" class-name="opening" text="门洞"/>
            </template>
          </draw-toolbox>
          <draw-toolbox title="窗">
            <template slot="box-items">
              <img-button :value="mode" @change="setMode" set-value="draw-window:common" class-name="window" text="窗"/>
              <img-button :value="mode" @change="setMode" set-value="draw-window:french" class-name="french" text="落地窗"/>
              <img-button :value="mode" @change="setMode" set-value="draw-window:railing" class-name="railing" text="栏杆"/>
            </template>
          </draw-toolbox>
          <draw-toolbox title="结构部件">
            <template slot="box-items">
              <img-button :value="mode" @change="setMode" set-value="draw-cubiccolumn:pillar" class-name="pillar"
                          text="柱"/>
              <img-button :value="mode" @change="setMode" set-value="draw-cubiccolumn:flue" class-name="flue" text="烟道"/>
              <img-button :value="mode" @change="setMode" set-value="draw-cubiccolumn:water-point"
                          class-name="water-point" text="水电位"/>
            </template>
          </draw-toolbox>
        </div>
        <div class='hide-left-btn'></div>
      </div>
      <top-side-bar @completedClick="completedClick" />
    </div>
</template>

<script>
/* eslint-disable no-prototype-builtins */
import _ from 'lodash'
import { clone } from '@/utils/object'
import px from '@/utils/pixi-wrapper'
import C from '@/utils/constants'
import House from '@/model/house'

// mode
import ViewMode from '@/mode/view'
import DrawWallMode from '@/mode/draw-wall'
import DrawDoorMode from '@/mode/draw-door'
import DrawWinMode from '@/mode/draw-window'
import DrawRoom from '@/mode/draw-room'
import DrawCubicColumn from '@/mode/draw-cubic-column'

import TopSideBar from '@/components/top-side-bar'
import DrawToolbox from '@/components/draw-tool-box'
import ImgButton from '@/components/img-button'
export default {
  name: 'house-editor',
  components: {
    TopSideBar,
    DrawToolbox,
    ImgButton
  },
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
        view: new ViewMode(this),
        'draw-wall:non-bearing': new DrawWallMode(this, 'NON_BEARING'),
        'draw-wall:room': new DrawRoom(this, 'NON_BEARING'),

        'draw-door:single': new DrawDoorMode(this, 'SINGLE'),
        'draw-door:equal-double': new DrawDoorMode(this, 'EQUAL_DOUBLE'),
        'draw-door:sliding': new DrawDoorMode(this, 'SLIDING'),
        'draw-door:opening': new DrawDoorMode(this, 'OPENING'),

        'draw-window:common': new DrawWinMode(this, 'COMMON'),
        'draw-window:french': new DrawWinMode(this, 'FRENCH'),
        'draw-window:bay-only': new DrawWinMode(this, 'BAY_ONLY'),
        'draw-window:railing': new DrawWinMode(this, 'RAILING'),

        'draw-cubiccolumn:pillar': new DrawCubicColumn(this, 'PILLAR'),
        'draw-cubiccolumn:flue': new DrawCubicColumn(this, 'FLUE'),
        'draw-cubiccolumn:beam': new DrawCubicColumn(this, 'BEAM'),
        'draw-cubiccolumn:water-point': new DrawCubicColumn(this, 'WATER')
      },
      kitsShow: true,
      selected: {
        type: null,
        item: null
      }
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

      this.setMode('view')

      this.app.view.addEventListener('contextmenu', e => e.preventDefault())
      this.$refs.houseEditor.appendChild(this.app.view)

      this.viewport.moveCenter(
        this.viewport.worldWidth / 2,
        this.viewport.worldHeight / 2
      )

      window.addEventListener('keydown', this.keyboardEventHandler)

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
    setViewportFixed () {
      this.viewportFixedData.x = this.viewport.x
      this.viewportFixedData.y = this.viewport.y
      this.viewportFixedData.scale = this.viewport.scale.x
    },
    cancelFixViewport () {
      this.viewportFixedData.x = null
      this.viewportFixedData.y = null
      this.viewportFixedData.scale = null
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
    setMode (name) {
      if (this.modeHandlers.hasOwnProperty(name)) {
        this.cancelFixViewport()
        if (this.handler && this.handler.onDestroy) {
          this.handler.onDestroy()
        }
        this.mode = name
        this.house.initialize()
        this.handler.initialize()
        this.syncModeStatus()
        this.house.updateSprites(true)
        this.house.updateAlignments()
      } else {
        console.error('Mode not found:', name)
      }
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
    },
    completedClick () {
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
