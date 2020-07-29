import px from '../utils/pixi-wrapper'
import C from '../utils/onstants'
// import Vector from './vector'
// import u from './utils'

export default class CubicColumn {
  constructor ({
    x,
    y,
    z = null,
    xSize,
    ySize,
    zSize = null,
    rotation = 0,
    kind = 'PILLAR'
  }) {
    this.x = x
    this.y = y
    this.z = z
    this.xSize = xSize
    this.ySize = ySize
    this.zSize = zSize
    this.rotation = rotation
    this.kind = kind
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
    // 唯一标示
    this.uuid = ''
  }

  result () {
    return {
      x: this.x,
      y: this.y,
      z: this.z,
      xSize: this.xSize,
      ySize: this.ySize,
      zSize: this.zSize,
      rotation: this.rotation,
      kind: this.kind
    }
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

  moveTo (c) {
    if (!c) {
      return
    }
    this.x = c.x
    this.y = c.y
    this.rotation = c.rotation
    this.dirty = true
  }

  get displayColor () {
    if (this.flags.selected) {
      return C.CUBIC_COLOR_SELECTED
    } else if (this.flags.hovering) {
      return C.CUBIC_COLOR_HOVERING
    } else {
      return null
    }
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
      // this.sprite.anchor.set(0.5, 0.5)
      this.sprite.interactive = true
    }

    switch (this.kind) {
      case 'PILLAR':
        this.drawPillar()
        break
      case 'FLUE':
        this.drawFlue()
        break
      case 'WATER':
        this.drawWater()
        break
    }
    if (this.displayCursor) {
      this.sprite.cursor = 'move'
    } else {
      this.sprite.cursor = null
    }
    this.dirty = false
  }

  drawPillar (scale = C.DEFAULT_SCALE) {
    const sprite = this.sprite
    sprite.clear()

    const path = [
      -this.xSize / 2, -this.ySize / 2,
      this.xSize / 2, -this.ySize / 2,
      this.xSize / 2, this.ySize / 2,
      -this.xSize / 2, this.ySize / 2,
      -this.xSize / 2, -this.ySize / 2
    ]

    sprite.lineStyle(C.CUBIC_LINE_WIDTH / scale, C.CUBIC_LINE_COLOR, C.CUBIC_LINE_ALPHA)
    sprite.beginFill(this.displayColor || C.CUBIC_BG_PILLAR)
    sprite.drawPolygon(path)
    sprite.endFill()

    sprite.rotation = Math.PI * this.rotation / 180
    sprite.position.set(this.x, this.y)
  }

  drawFlue (scale = C.DEFAULT_SCALE) {
    const sprite = this.sprite
    sprite.clear()

    const outerPath = [
      -this.xSize / 2, -this.ySize / 2,
      this.xSize / 2, -this.ySize / 2,
      this.xSize / 2, this.ySize / 2,
      -this.xSize / 2, this.ySize / 2,
      -this.xSize / 2, -this.ySize / 2
    ]
    const innerPath = [
      -this.xSize / 2 + C.CUBIC_THICKNESS_FLUE, -this.ySize / 2 + C.CUBIC_THICKNESS_FLUE,
      this.xSize / 2 - C.CUBIC_THICKNESS_FLUE, -this.ySize / 2 + C.CUBIC_THICKNESS_FLUE,
      this.xSize / 2 - C.CUBIC_THICKNESS_FLUE, this.ySize / 2 - C.CUBIC_THICKNESS_FLUE,
      -this.xSize / 2 + C.CUBIC_THICKNESS_FLUE, this.ySize / 2 - C.CUBIC_THICKNESS_FLUE,
      -this.xSize / 2 + C.CUBIC_THICKNESS_FLUE, -this.ySize / 2 + C.CUBIC_THICKNESS_FLUE
    ]

    const pointer = {
      x: this.xSize / 4 - C.CUBIC_THICKNESS_FLUE / 2,
      y: -this.ySize / 4 + C.CUBIC_THICKNESS_FLUE / 2
    }

    sprite.lineStyle(C.CUBIC_LINE_WIDTH / scale, C.CUBIC_LINE_COLOR, C.CUBIC_LINE_ALPHA)

    sprite.beginFill(C.CUBIC_BG_FLUE)
    sprite.drawPolygon(outerPath)
    sprite.endFill()

    sprite.beginFill(this.displayColor || C.CUBIC_BG_FLUE_INNER)
    sprite.drawPolygon(innerPath)
    sprite.endFill()

    sprite.moveTo(innerPath[0], innerPath[1])
    sprite.lineTo(pointer.x, pointer.y)
    sprite.lineTo(innerPath[4], innerPath[5])

    sprite.rotation = Math.PI * this.rotation / 180
    sprite.position.set(this.x, this.y)
  }

  drawWater (scale = C.DEFAULT_SCALE) {
    const sprite = this.sprite
    sprite.clear()

    const path = [
      -this.xSize / 2, -this.ySize / 2,
      this.xSize / 2, -this.ySize / 2,
      this.xSize / 2, this.ySize / 2,
      -this.xSize / 2, this.ySize / 2,
      -this.xSize / 2, -this.ySize / 2
    ]

    sprite.lineStyle(C.CUBIC_LINE_WIDTH / scale, C.CUBIC_LINE_COLOR, C.CUBIC_LINE_ALPHA)

    sprite.beginFill(this.displayColor || C.CUBIC_BG_WATER)
    sprite.drawPolygon(path)
    sprite.endFill()

    sprite.rotation = Math.PI * this.rotation / 180
    sprite.position.set(this.x, this.y)
  }
}
