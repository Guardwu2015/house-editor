import px from '../utils/pixi-wrapper'
import C from '../utils/constants'
import Vector from './vector'
import u from './util'

export default class Door extends Vector {
  constructor ({
    p1,
    p2,
    kind = 'SINGLE',
    openDirection = 'CLOCKWISE',
    height = 2000,
    sillHeight = 0
  }) {
    super({
      p1,
      p2
    })
    this.kind = kind
    this.openDirection = openDirection
    // 一些仅供设置的属性
    this.height = height
    this.sillHeight = sillHeight
    // 所在的墙
    this.wall = null
    // 精灵
    this.sprite = null
    // 当前状态
    this.displayCursor = false
    this.flags = {
      hovering: false,
      selected: false
    }
    // 标记是否需要更新
    this.dirty = true
    this.uuid = '' // 唯一标示
  }

  setFlag (name, value) {
    if (this.flags[name] !== value) {
      this.flags[name] = value
      this.dirty = true
    }
  }

  setAllFlags (value) {
    for (const key of Object.keys(this.flags)) {
      this.flags[key] = value
    }
    this.dirty = true
  }

  get displayColor () {
    if (this.flags.selected) {
      return C.DOOR_COLOR_SELECTED
    } else if (this.flags.hovering) {
      return C.DOOR_COLOR_HOVERING
    } else {
      return null
    }
  }

  result () {
    return {
      p1: this.p1,
      p2: this.p2,
      kind: this.kind,
      openDirection: this.openDirection,
      height: this.height,
      sillHeight: this.sillHeight
    }
  }

  get wallThickness () {
    if (!this.wall) {
      return C.DOOR_THICKNESS_DEFAULT
    } else {
      return this.wall.thickness
    }
  }

  rotate () {
    switch (this.kind) {
      case 'SINGLE':
      case 'UNEQUAL_DOUBLE':
        if (this.openDirection === 'CLOCKWISE') {
          this.reverseInPlace()
          this.openDirection = 'ANTI_CLOCKWISE'
        } else {
          this.openDirection = 'CLOCKWISE'
        }
        break
      case 'EQUAL_DOUBLE':
        if (this.openDirection === 'CLOCKWISE') {
          this.openDirection = 'ANTI_CLOCKWISE'
        } else {
          this.openDirection = 'CLOCKWISE'
        }
        break
      default:
        this.reverseInPlace()
    }
    this.dirty = true
  }

  moveTo (v) {
    if (!v) {
      return
    }
    let vec = new Vector(v)
    vec = vec.reverseIfToward(this)
    this.p1 = vec.p1
    this.p2 = vec.p2
    this.wall = v.wall
    this.dirty = true
  }

  addSprite (container) {
    if (this.sprite) {
      container.addChild(this.sprite)
    }
  }

  removeSprite (container) {
    if (this.sprite) {
      container.removeChild(this.sprite)
    }
  }

  updateSprite () {
    if (!this.dirty) {
      return
    }
    if (!this.sprite) {
      this.sprite = new px.Graphics()
      this.sprite.interactive = true
    }
    switch (this.kind) {
      case 'SINGLE':
        this.drawSingle()
        break
      case 'EQUAL_DOUBLE':
        this.drawDouble()
        break
      case 'SLIDING':
        this.drawSliding()
        break
      case 'OPENING':
        this.drawOpening()
        break
    }
    if (this.displayCursor) {
      this.sprite.cursor = 'move'
    } else {
      this.sprite.cursor = null
    }
    this.dirty = false
  }

  drawSingle (scale = C.DEFAULT_SCALE) {
    const sprite = this.sprite
    sprite.clear()

    const center = this.center()
    const vector = this.vector()
    const vectorLength = vector.length()
    vector.p1.x -= center.x
    vector.p1.y -= center.y
    vector.p2.x -= center.x
    vector.p2.y -= center.y

    // 门扇弧
    const startAngle = -vector.polarAngle()
    let endAngle, antiClockwise
    switch (this.openDirection) {
      case 'CLOCKWISE':
        endAngle = startAngle + 90
        antiClockwise = false
        break
      case 'ANTI_CLOCKWISE':
        endAngle = startAngle - 90
        antiClockwise = true
        break
    }
    if (endAngle !== undefined) {
      sprite.lineStyle(C.DOOR_ARC_WIDTH / scale, C.DOOR_ARC_COLOR, C.DOOR_ARC_ALPHA)
      sprite.beginFill(this.displayColor || C.DOOR_COLOR_NORMAL, C.DOOR_COLOR_ALPHA)
      sprite.moveTo(vector.p1.x, vector.p1.y)
      sprite.arc(vector.p1.x, vector.p1.y, vectorLength, u.angleToRadian(startAngle), u.angleToRadian(endAngle), antiClockwise)
      sprite.endFill()
    }

    // 门占据的墙
    const wallThickness = this.wallThickness
    sprite.lineStyle(wallThickness, this.displayColor || C.DOOR_RECT_COLOR, C.DOOR_RECT_ALPHA)
    sprite.moveTo(vector.p1.x, vector.p1.y)
    sprite.lineTo(vector.p2.x, vector.p2.y)

    // 门扇本体
    let doorLeafPt
    switch (this.openDirection) {
      case 'CLOCKWISE':
        doorLeafPt = vector.getP1VerticalOffsetPoint(-vectorLength)
        break
      case 'ANTI_CLOCKWISE':
        doorLeafPt = vector.getP1VerticalOffsetPoint(vectorLength)
        break
    }
    if (doorLeafPt !== undefined) {
      sprite.lineStyle(C.DOOR_LINE_WIDTH / scale, C.DOOR_LINE_COLOR, C.DOOR_LINE_ALPHA)
      sprite.moveTo(vector.p1.x, vector.p1.y)
      sprite.lineTo(doorLeafPt.x, doorLeafPt.y)
    }

    sprite.position.set(center.x, center.y)
  }

  drawDouble (scale = C.DEFAULT_SCALE) {
    const sprite = this.sprite
    sprite.clear()

    const center = this.center()
    const vector = this.vector()
    const vectorLength = vector.length()
    vector.p1.x -= center.x
    vector.p1.y -= center.y
    vector.p2.x -= center.x
    vector.p2.y -= center.y

    // 门扇弧
    const startAngle = -vector.polarAngle()
    let endAngle, antiClockwise
    switch (this.openDirection) {
      case 'CLOCKWISE':
        endAngle = startAngle + 90
        antiClockwise = false
        break
      case 'ANTI_CLOCKWISE':
        endAngle = startAngle - 90
        antiClockwise = true
        break
    }
    if (endAngle !== undefined) {
      sprite.lineStyle(C.DOOR_ARC_WIDTH / scale, C.DOOR_ARC_COLOR, C.DOOR_ARC_ALPHA)
      sprite.beginFill(this.displayColor || C.DOOR_COLOR_NORMAL, C.DOOR_COLOR_ALPHA)
      sprite.moveTo(vector.p1.x, vector.p1.y)
      sprite.arc(vector.p1.x, vector.p1.y, vectorLength / 2, u.angleToRadian(startAngle), u.angleToRadian(endAngle), antiClockwise)

      sprite.moveTo(vector.p2.x, vector.p2.y)
      if (!antiClockwise) {
        sprite.arc(vector.p2.x, vector.p2.y, vectorLength / 2, u.angleToRadian(startAngle + 90), u.angleToRadian(endAngle + 90), antiClockwise)
      } else {
        sprite.arc(vector.p2.x, vector.p2.y, vectorLength / 2, u.angleToRadian(startAngle + 180), u.angleToRadian(endAngle), !antiClockwise)
      }
      sprite.endFill()
    }

    // 门占据的墙
    const wallThickness = this.wallThickness
    sprite.lineStyle(wallThickness, this.displayColor || C.DOOR_RECT_COLOR, C.DOOR_RECT_ALPHA)
    sprite.moveTo(vector.p1.x, vector.p1.y)
    sprite.lineTo(vector.p2.x, vector.p2.y)

    // 门扇本体
    let doorLeafPt1
    let doorLeafPt2
    switch (this.openDirection) {
      case 'CLOCKWISE':
        doorLeafPt1 = vector.getP1VerticalOffsetPoint(-vectorLength / 2)
        doorLeafPt2 = vector.getP2VerticalOffsetPoint(-vectorLength / 2)
        break
      case 'ANTI_CLOCKWISE':
        doorLeafPt1 = vector.getP1VerticalOffsetPoint(vectorLength / 2)
        doorLeafPt2 = vector.getP2VerticalOffsetPoint(vectorLength / 2)
        break
    }
    if (doorLeafPt1 !== undefined && doorLeafPt2 !== undefined) {
      sprite.lineStyle(C.DOOR_LINE_WIDTH / scale, C.DOOR_LINE_COLOR, C.DOOR_LINE_ALPHA)
      sprite.moveTo(vector.p1.x, vector.p1.y)
      sprite.lineTo(doorLeafPt1.x, doorLeafPt1.y)

      sprite.moveTo(vector.p2.x, vector.p2.y)
      sprite.lineTo(doorLeafPt2.x, doorLeafPt2.y)
    }

    sprite.position.set(center.x, center.y)
  }

  drawSliding (scale = C.DEFAULT_SCALE) {
    const sprite = this.sprite
    sprite.clear()

    const center = this.center()
    const vector = this.vector()
    const vectorLength = vector.length()
    vector.p1.x -= center.x
    vector.p1.y -= center.y
    vector.p2.x -= center.x
    vector.p2.y -= center.y

    // 门占据的墙
    const wallThickness = this.wallThickness
    const h = wallThickness / 2
    const pointer1 = vector.getP1VerticalOffsetPoint(-h)
    const pointer2 = vector.getP2VerticalOffsetPoint(-h)
    const pointer3 = vector.getP2VerticalOffsetPoint(h)
    const pointer4 = vector.getP1VerticalOffsetPoint(h)
    const path = [
      pointer1.x, pointer1.y, pointer2.x, pointer2.y,
      pointer3.x, pointer3.y, pointer4.x, pointer4.y
    ]
    sprite.beginFill(this.displayColor || C.DOOR_BG_COLOR)
    sprite.drawPolygon(path)
    sprite.endFill()

    const v1 = vector.stretch({
      p1Padding: -vectorLength / 10,
      p2Padding: -vectorLength / 3
    }).verticalOffset(wallThickness / 8)
    const v2 = vector.stretch({
      p1Padding: -vectorLength / 3,
      p2Padding: -vectorLength / 8
    }).verticalOffset(-wallThickness / 8)
    sprite.lineStyle(wallThickness / 4, C.DOOR_LINE_COLOR, C.DOOR_LINE_ALPHA)
    sprite.moveTo(v1.p1.x, v1.p1.y)
    sprite.lineTo(v1.p2.x, v1.p2.y)

    sprite.moveTo(v2.p1.x, v2.p1.y)
    sprite.lineTo(v2.p2.x, v2.p2.y)

    sprite.position.set(center.x, center.y)
  }

  drawOpening (scale = C.DEFAULT_SCALE) {
    const sprite = this.sprite
    sprite.clear()

    const center = this.center()
    const vector = this.vector()
    vector.p1.x -= center.x
    vector.p1.y -= center.y
    vector.p2.x -= center.x
    vector.p2.y -= center.y

    // 门占据的墙
    const wallThickness = this.wallThickness
    const h = wallThickness / 2
    const pointer1 = vector.getP1VerticalOffsetPoint(-h)
    const pointer2 = vector.getP2VerticalOffsetPoint(-h)
    const pointer3 = vector.getP2VerticalOffsetPoint(h)
    const pointer4 = vector.getP1VerticalOffsetPoint(h)
    const path = [
      pointer1.x, pointer1.y, pointer2.x, pointer2.y,
      pointer3.x, pointer3.y, pointer4.x, pointer4.y,
      pointer1.x, pointer1.y
    ]
    sprite.lineStyle(1 / scale, C.DOOR_LINE_COLOR, C.DOOR_LINE_ALPHA)
    sprite.beginFill(this.displayColor || C.DOOR_BG_COLOR)
    sprite.drawPolygon(path)
    sprite.endFill()

    sprite.position.set(center.x, center.y)
  }
}
