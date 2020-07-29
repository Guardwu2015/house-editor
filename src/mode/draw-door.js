import Door from '../model/door'
import C from '../utils/constants'
export default class DrawDoorMode {
  constructor (houseEditor, kind) {
    // HouseEditor component 对象
    this.he = houseEditor
    // 当前绘制的门的属性
    this.kind = kind
    switch (this.kind) {
      case 'SINGLE':
      case 'EQUAL_DOUBLE':
      case 'UNEQUAL_DOUBLE':
        this.openDirection = 'CLOCKWISE'
        break
      default:
        this.openDirection = 'WHATEVER'
    }
    this.height = 2000
    this.sillHeight = 0
    this.doorLength = {
      SINGLE: 700,
      EQUAL_DOUBLE: 1600,
      UNEQUAL_DOUBLE: 1200,
      SLIDING: 1600
    }[this.kind] || 700
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
    return this.he.containers.door
  }

  get house () {
    return this.he.house
  }

  get scale () {
    return this.he.scale
  }

  rotateDoor () {
    switch (this.kind) {
      case 'SINGLE':
      case 'UNEQUAL_DOUBLE':
        if (this.openDirection === 'CLOCKWISE') {
          this.p1Nearing = {
            p1: 'p2',
            p2: 'p1'
          }[this.p1Nearing]
          this.openDirection = 'ANTI_CLOCKWISE'
        } else {
          this.openDirection = 'CLOCKWISE'
        }
        break
      case 'EQUAL_DOUBLE':
      case 'SLIDING':
      case 'OPENING':
        if (this.openDirection === 'CLOCKWISE') {
          this.openDirection = 'ANTI_CLOCKWISE'
        } else {
          this.openDirection = 'CLOCKWISE'
        }
        this.p1Nearing = 'p1'
        break
      default:
        this.p1Nearing = {
          p1: 'p2',
          p2: 'p1'
        }[this.p1Nearing]
    }
  }

  updateDrawingPoint (p = null) {
    if (!p) {
      if (this.drawing) {
        p = this.drawing.center()
      } else {
        return
      }
    }
    const v = this.house.getAlignedVector(p, this.doorLength)
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
      this.drawing = new Door({
        p1: v.p1,
        p2: v.p2,
        kind: this.kind,
        openDirection: this.openDirection,
        height: this.height,
        sillHeight: this.sillHeight
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
      this.house.addDoor(this.drawing)
      this.drawing = null
    }
  }

  onWheel (e) {
    if (e.wheel.dy !== 0) {
      this.doorLength -= Math.round(e.wheel.dy / 10)
      if (this.doorLength < C.VECTOR_MINIMUM_LENGTH) {
        this.doorLength = C.VECTOR_MINIMUM_LENGTH
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

  onKeydownR (e) {
    this.rotateDoor()
    this.updateDrawingPoint()
  }

  onDestroy () {
    if (this.drawing) {
      this.drawing.removeSprite(this.container)
      this.drawing = null
    }
  }
}
