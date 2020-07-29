import CubicColumn from '../model/cubic-column'
import C from '../utils/constants'

export default class DrawCubicColumnMode {
  constructor (houseEditor, kind) {
    // HouseEditor component 对象
    this.he = houseEditor
    // 当前绘制的构件的属性
    this.kind = kind
    this.z = null
    this.xSize = this.ySize = {
      PILLAR: 800,
      FLUE: 800,
      BEAM: 1600,
      WATER: 800
    }[this.kind] || 800
    this.zSize = null
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
    return this.he.containers.cubicColumn
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
        p = {
          x: this.drawing.x,
          y: this.drawing.y
        }
      } else {
        return
      }
    }
    const pt = this.house.getAlignedCubic(p, this.xSize, this.ySize)
    const data = {
      x: pt.x,
      y: pt.y,
      z: this.z,
      xSize: this.xSize,
      ySize: this.ySize,
      zSize: this.zSize,
      rotation: pt.rotation,
      kind: this.kind
    }
    if (!this.drawing) {
      this.drawing = new CubicColumn(data)
      this.drawing.updateSprite(this.scale)
      this.drawing.addSprite(this.container)
    } else {
      Object.assign(this.drawing, data)
      this.drawing.dirty = true
      this.drawing.updateSprite(this.scale)
    }
  }

  onClicked (e) {
    const pt = e.world
    this.updateDrawingPoint(pt)
    if (this.drawing) {
      this.house.addCubicColumn(this.drawing)
      this.drawing = null
    }
  }

  onWheel (e) {
    if (e.wheel.dy !== 0) {
      this.xSize -= Math.round(e.wheel.dy / 10)
      this.ySize -= Math.round(e.wheel.dy / 10)
      if (this.xSize < C.CUBIC_MINIMUM_SIZE) {
        this.xSize = this.ySize = C.CUBIC_MINIMUM_SIZE
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

  //   onKeydownR (e) {
  //     console.log('onKeydownR')
  //     this.rotateDoor()
  //     this.updateDrawingPoint()
  //   }
}
