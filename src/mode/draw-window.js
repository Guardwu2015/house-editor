import Window from '../model/window'
import C from '../utils/constants'

export default class DrawWinMode {
  constructor (houseEditor, kind) {
    // HouseEditor component 对象
    this.he = houseEditor
    // 当前绘制的门的属性
    this.kind = kind
    this.openDirection = 'WHATEVER'
    this.height = {
      COMMON: 1500,
      FRENCH: 2600,
      RAILING: 1500,
      BAY_ONLY: 0
    }[this.kind] || 1500
    this.sillHeight = {
      COMMON: 1200,
      FRENCH: 100,
      RAILING: 100,
      BAY_ONLY: 1200
    }[this.kind] || 1200
    this.bayDepth = 0
    this.winLength = {
      COMMON: 450,
      FRENCH: 450,
      RAILING: 1600,
      BAY_ONLY: 1600
    }[this.kind] || 450
    // 绘制时，门的p1点（门轴）靠近墙的哪个点
    this.p1Nearing = 'p1'
    // 当前绘制
    this.drawing = null
  }

  initialize () {
    this.drawing = null
    this.house.resetStatus({
      displayCursor: false
    })
    this.he.setViewportFixed()
  }

  cursor () {
    if (!this.drawing) {
      return 'not-allowed'
    }
    return 'default'
  }

  get container () {
    return this.he.containers.window
  }

  get house () {
    return this.he.house
  }

  get scale () {
    return this.he.scale
  }

  updateDrawingPoint (p = null) {
    if (!p) {
      if (this.drawing) {
        p = this.drawing.center()
      } else {
        return
      }
    }
    const v = this.house.getAlignedVector(p, this.winLength)
    if (!v) {
      if (this.drawing) {
        if (this.drawing.wall) {
          this.drawing.wall.updateMarkingSprite(this.scale)
        }
        this.drawing.removeSprite(this.container)
      }
      this.drawing = null
      return
    }
    if (this.p1Nearing === 'p2') {
      const t = v.p1
      v.p1 = v.p2
      v.p2 = t
    }
    if (!this.drawing) {
      this.drawing = new Window({
        p1: v.p1,
        p2: v.p2,
        kind: this.kind,
        openDirection: this.openDirection,
        height: this.height,
        sillHeight: this.sillHeight,
        bayDepth: this.bayDepth
      })
      this.drawing.wall = v.wall
      this.drawing.updateSprite(this.scale)
      this.drawing.addSprite(this.container)
    } else {
      this.drawing.p1 = v.p1
      this.drawing.p2 = v.p2
      if (this.drawing.wall && this.drawing.wall !== v.wall) {
        this.drawing.wall.updateMarkingSprite(this.scale)
      }
      this.drawing.wall = v.wall
      this.drawing.openDirection = this.openDirection
      this.drawing.height = this.height
      this.drawing.sillHeight = this.sillHeight
      this.drawing.bayDepth = this.bayDepth
      this.drawing.dirty = true
      this.drawing.updateSprite(this.scale)
    }
    if (this.drawing.wall) {
      this.drawing.wall.updateMarkingSprite(this.scale, this.drawing)
    }
  }

  onClicked (e) {
    const pt = e.world
    this.updateDrawingPoint(pt)
    if (this.drawing && this.drawing.wall) {
      this.house.addWindow(this.drawing)
      this.drawing = null
    }
  }

  onWheel (e) {
    if (e.wheel.dy !== 0) {
      this.winLength -= Math.round(e.wheel.dy / 10)
      if (this.winLength < C.VECTOR_MINIMUM_LENGTH) {
        this.winLength = C.VECTOR_MINIMUM_LENGTH
      }
      this.updateDrawingPoint()
    }
  }

  onPointermove (e) {
    const pt = this.he.viewport.toWorld(e.data.global)
    this.updateDrawingPoint(pt)
    if (this.drawing) {
      this.drawing.updateSprite(this.scale)
    }
    this.house.updateAlignments()
  }

  onRightclick (e) {
    if (this.drawing) {
      if (this.drawing.sprite) {
        this.drawing.removeSprite(this.container)
      }
      this.drawing = null
    }
    this.he.setMode('view')
  }

  onDestroy () {
    if (this.drawing) {
      this.drawing.removeSprite(this.container)
      this.drawing = null
    }
  }
}
