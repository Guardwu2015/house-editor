import px from '../utils/pixi-wrapper'
import C from '../utils/constants'
import Vector from './vector'
import u from './utils'

export default class Window extends Vector {
  constructor ({
    p1,
    p2,
    kind = 'COMMON',
    openDirection = 'WHATEVER',
    height = 1500,
    sillHeight = 1200,
    bayDepth = 0
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
    this.bayDepth = bayDepth
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
    this.displayCursor = false
    // 标记是否需要更新
    this.dirty = true
    // 唯一标示
    this.uuid = ''
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
      return C.WIN_COLOR_SELECTED
    } else if (this.flags.hovering) {
      return C.WIN_COLOR_HOVERING
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
      sillHeight: this.sillHeight,
      bayDepth: this.bayDepth
    }
  }

  get wallThickness () {
    if (!this.wall) {
      return C.WIN_THICKNESS_DEFAULT
    } else {
      return this.wall.thickness
    }
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
      case 'COMMON':
        this.drawCommon()
        break
      case 'FRENCH':
        this.drawFrench()
        break
      case 'BAY_ONLY':
        this.drawBayOnly()
        break
      case 'RAILING':
        this.drawRailing()
        break
    }
    if (this.displayCursor) {
      this.sprite.cursor = 'move'
    } else {
      this.sprite.cursor = null
    }
    this.dirty = false
  }

  drawBay (scale = C.DEFAULT_SCALE) {
    if (this.bayDepth === 0 || this.sillHeight === 0 || this.wall == null) {
      return
    }
    const sprite = this.sprite

    const center = this.center()
    let wall = this.wall
    if (u.approximately(u.mod(this.polarAngle() - wall.polarAngle(), 360), 180)) {
      wall = wall.stretch({
        p1Padding: wall.p1LeftPadding,
        p2Padding: wall.p2RightPadding
      }).reverse()
    } else {
      wall = wall.stretch({
        p1Padding: wall.p1RightPadding,
        p2Padding: wall.p2LeftPadding
      })
    }
    wall = wall.verticalOffset(-this.wall.thickness / 2 - this.bayDepth / 2)

    sprite.lineStyle(Math.abs(this.bayDepth), C.WINDOW_BAY_COLOR, Math.min(1.0, 0.2 + this.sillHeight / 2000))
    sprite.moveTo(wall.p1.x - center.x, wall.p1.y - center.y)
    sprite.lineTo(wall.p2.x - center.x, wall.p2.y - center.y)
  }

  drawFrench (scale = C.DEFAULT_SCALE) {
    const sprite = this.sprite
    sprite.clear()

    const center = this.center()
    const vector = this.vector()
    // let vectorLength = vector.length()
    vector.p1.x -= center.x
    vector.p1.y -= center.y
    vector.p2.x -= center.x
    vector.p2.y -= center.y

    // 窗占据的墙
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
    sprite.lineStyle(wallThickness / 8, C.WINDOW_LINE_COLOR, C.WINDOW_LINE_ALPHA)
    sprite.beginFill(this.displayColor || C.WINDOW_BG_COLOR)
    sprite.drawPolygon(path)
    sprite.endFill()
    sprite.moveTo(pointer1.x, pointer1.y)
    sprite.lineTo(pointer4.x, pointer4.y)

    sprite.moveTo(vector.p1.x, vector.p1.y)
    sprite.lineTo(vector.p2.x, vector.p2.y)

    sprite.position.set(center.x, center.y)
  }

  drawCommon (scale = C.DEFAULT_SCALE) {
    const sprite = this.sprite
    sprite.clear()

    const center = this.center()
    const vector = this.vector()
    // let vectorLength = vector.length()
    vector.p1.x -= center.x
    vector.p1.y -= center.y
    vector.p2.x -= center.x
    vector.p2.y -= center.y

    // 窗占据的墙
    const wallThickness = this.wallThickness
    const h = wallThickness / 2
    const pointer11 = vector.getP1VerticalOffsetPoint(-h)
    const pointer12 = vector.getP2VerticalOffsetPoint(-h)
    const pointer13 = vector.getP2VerticalOffsetPoint(h)
    const pointer14 = vector.getP1VerticalOffsetPoint(h)

    const pp1 = {
      x: (pointer11.x + pointer12.x) / 2,
      y: (pointer11.y + pointer12.y) / 2
    }
    const pp2 = {
      x: (pointer13.x + pointer14.x) / 2,
      y: (pointer13.y + pointer14.y) / 2
    }

    const path = [
      pointer11.x, pointer11.y, pointer12.x, pointer12.y,
      pointer13.x, pointer13.y, pointer14.x, pointer14.y
    ]
    sprite.lineStyle(wallThickness / 8, C.WINDOW_LINE_COLOR, C.WINDOW_LINE_ALPHA)
    sprite.beginFill(this.displayColor || C.WINDOW_BG_COLOR)
    sprite.drawPolygon(path)
    sprite.endFill()
    sprite.moveTo(pointer11.x, pointer11.y)
    sprite.lineTo(pointer14.x, pointer14.y)

    sprite.moveTo(vector.p1.x, vector.p1.y)
    sprite.lineTo(vector.p2.x, vector.p2.y)

    sprite.moveTo(pp1.x, pp1.y)
    sprite.lineTo(pp2.x, pp2.y)

    this.drawBay(scale)

    sprite.position.set(center.x, center.y)
  }

  drawBayOnly (scale = C.DEFAULT_SCALE) {
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

    // let vector1 = vector

    const v11 = vector.stretch({
      p1Padding: vectorLength / 10,
      p2Padding: vectorLength / 10
    }).verticalOffset(wallThickness / 2)
    const v12 = vector.stretch({
      p1Padding: vectorLength / 10,
      p2Padding: vectorLength / 10
    }).verticalOffset(4 * wallThickness)
    const path1 = [
      v11.p1.x, v11.p1.y, v11.p2.x, v11.p2.y,
      v12.p2.x, v12.p2.y, v12.p1.x, v12.p1.y
    ]

    sprite.clear()
    sprite.beginFill(C.WINDOW_BG_COLOR)
    sprite.lineStyle(C.WINDOW_LINE_WIDTH * 10, C.WINDOW_LINE_COLOR, C.WINDOW_LINE_ALPHA)
    sprite.drawPolygon(path1)
    sprite.endFill()
    sprite.lineStyle(C.WINDOW_LINE_WIDTH * 12, C.WINDOW_LINE_COLOR, C.WINDOW_LINE_ALPHA)
    sprite.moveTo(v11.p1.x, v11.p1.y)
    sprite.lineTo(v12.p1.x, v12.p1.y)

    const v21 = vector.stretch({
      p1Padding: vectorLength / 20,
      p2Padding: vectorLength / 20
    }).verticalOffset(wallThickness / 2)
    const v22 = vector.stretch({
      p1Padding: vectorLength / 20,
      p2Padding: vectorLength / 20
    }).verticalOffset(3.6 * wallThickness)
    const path2 = [
      v21.p1.x, v21.p1.y, v21.p2.x, v21.p2.y,
      v22.p2.x, v22.p2.y, v22.p1.x, v22.p1.y
    ]

    sprite.beginFill(C.WINDOW_BG_COLOR)
    sprite.lineStyle(C.WINDOW_LINE_WIDTH * 10, C.WINDOW_LINE_COLOR, C.WINDOW_LINE_ALPHA)
    sprite.drawPolygon(path2)
    sprite.endFill()
    sprite.lineStyle(C.WINDOW_LINE_WIDTH * 12, C.WINDOW_LINE_COLOR, C.WINDOW_LINE_ALPHA)
    sprite.moveTo(v21.p1.x, v21.p1.y)
    sprite.lineTo(v22.p1.x, v22.p1.y)

    const v31 = vector.verticalOffset(-wallThickness / 2)
    const v32 = vector.verticalOffset(3.6 * wallThickness)
    const path3 = [
      v31.p1.x, v31.p1.y, v31.p2.x, v31.p2.y,
      v32.p2.x, v32.p2.y, v32.p1.x, v32.p1.y
    ]

    sprite.beginFill(this.displayColor || C.WINDOW_COLOR)
    sprite.lineStyle(C.WINDOW_LINE_WIDTH * 10, C.WINDOW_LINE_COLOR, C.WINDOW_LINE_ALPHA)
    sprite.drawPolygon(path3)
    sprite.endFill()
    sprite.lineStyle(C.WINDOW_LINE_WIDTH * 12, C.WINDOW_LINE_COLOR, C.WINDOW_LINE_ALPHA)
    sprite.moveTo(v31.p1.x, v31.p1.y)
    sprite.lineTo(v32.p1.x, v32.p1.y)

    this.drawBay(scale)

    sprite.position.set(center.x, center.y)
  }

  drawRailing (scale = C.DEFAULT_SCALE) {
    const sprite = this.sprite
    sprite.clear()

    const center = this.center()
    const vector = this.vector()
    // let vectorLength = vector.length()
    vector.p1.x -= center.x
    vector.p1.y -= center.y
    vector.p2.x -= center.x
    vector.p2.y -= center.y

    // 窗占据的墙
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
    sprite.lineStyle(wallThickness / 8, C.WINDOW_LINE_COLOR, C.WINDOW_LINE_ALPHA)
    sprite.beginFill(this.displayColor || C.WINDOW_BG_COLOR)
    sprite.drawPolygon(path)
    sprite.endFill()
    sprite.moveTo(pointer1.x, pointer1.y)
    sprite.lineTo(pointer4.x, pointer4.y)

    sprite.position.set(center.x, center.y)
  }
}
