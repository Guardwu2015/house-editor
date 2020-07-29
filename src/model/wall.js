import px from '../utils/pixi-wrapper'
import C from '../utils/constants'
import Vector from './vector'
import u from './utils'

export default class Wall extends Vector {
  constructor ({
    p1,
    p2,
    thickness = 0,
    kind = 'NON_BEARING',
    alpha = 1
  }) {
    super({
      p1,
      p2,
      thickness
    })
    this.alpha = alpha
    this.kind = kind
    // 精灵
    this.sprite = null
    this.markingSprite = null
    // 避免重复创建精灵造成的内存泄漏问题
    this.alternativeSprites = [
      Wall.createAlternativeSprite(), Wall.createAlternativeSprite(), Wall.createAlternativeSprite()
    ]
    // 以下变量的Left和Right是以 p1->p2 方向为参照
    this.p1RightPadding = 0
    this.p1LeftPadding = 0
    // 以下变量的Left和Right是以 p2->p1 方向为参照
    this.p2RightPadding = 0
    this.p2LeftPadding = 0
    // 当前状态
    this.displayCursor = false
    this.flags = {
      hovering: false,
      selected: false
    }
    this.uuid = '' // 唯一标示
    // 标记是否需要更新
    this.dirty = true
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
      return C.WALL_COLOR_SELECTED
    } else if (this.flags.hovering) {
      return C.WALL_COLOR_HOVERING
    } else if (this.p1LeftPadding === null || this.p1RightPadding === null || this.p2LeftPadding === null || this.p2RightPadding === null) {
      return C.WALL_COLOR_WARNING
    } else {
      return null
    }
  }

  setPadding (name, newValue) {
    const keyName = `${name}Padding`
    if (this[keyName] !== newValue) {
      this.dirty = true
      this[keyName] = newValue
    }
  }

  setPaddings (pointName, leftValue, rightValue) {
    this.setPadding(`${pointName}Left`, leftValue)
    this.setPadding(`${pointName}Right`, rightValue)
  }

  result () {
    return {
      p1: this.p1,
      p2: this.p2,
      thickness: this.thickness,
      kind: this.kind
    }
  }

  addSprite (container) {
    if (this.sprite) {
      container.addChild(this.sprite)
    }
    if (this.markingSprite) {
      container.addChild(this.markingSprite)
    }
  }

  removeSprite (container) {
    if (this.sprite) {
      container.removeChild(this.sprite)
    }
    if (this.markingSprite) {
      container.removeChild(this.markingSprite)
    }
  }

  static createAlternativeSprite () {
    const sprite = new px.Container()
    const lineDraw = new px.Graphics()
    const textDraw = new px.Text('', C.MARKING_TEXT_STYLE)
    sprite.addChild(lineDraw)
    sprite.addChild(textDraw)
    return sprite
  }

  getMarkingByVector (vec, scale, sprite) {
    // 必须保证vec和this是同方向的
    const lineDraw = sprite.children[0]
    const textDraw = sprite.children[1]
    lineDraw.position.set(0, 0)
    textDraw.anchor.set(0.5, 0.5)
    if (!vec.isPoint()) {
      const polarAngle = vec.polarAngle()
      const center = vec.center()
      const vector = vec.vector()
      vector.p1.x -= center.x
      vector.p1.y -= center.y
      vector.p2.x -= center.x
      vector.p2.y -= center.y
      // 绘制标注，包括线、数字两部分
      const markingVector = vector.verticalOffset(this.thickness / 2)
      const markingVector2 = vector.verticalOffset(this.thickness / 2 + C.MARKING_HEIGHT / scale)
      lineDraw.clear()
      lineDraw.lineStyle(C.MARKING_LINE_THICKNESS / scale, C.MARKING_COLOR)
      lineDraw.moveTo(markingVector.p1.x, markingVector.p1.y)
      lineDraw.lineTo(markingVector2.p1.x, markingVector2.p1.y)
      lineDraw.lineTo(markingVector2.p2.x, markingVector2.p2.y)
      lineDraw.lineTo(markingVector.p2.x, markingVector.p2.y)
      const textAnchor = markingVector2.verticalOffset(C.MARKING_FONT_SIZE / scale / 2).center()
      textDraw.style.fontSize = C.MARKING_FONT_SIZE / scale
      textDraw.position.set(textAnchor.x, textAnchor.y)
      textDraw.text = '' + Math.round(vec.length())
      textDraw.rotation = -Math.PI * (u.mod(polarAngle + 90, 180) - 90) / 180
      sprite.position.set(center.x, center.y)
    }
    return sprite
  }

  updateMarkingSprite (scale = C.DEFAULT_SCALE, markingElement = null) {
    if (!this.markingSprite) {
      this.markingSprite = new px.Container()
    }
    if (markingElement) {
      if (markingElement.wall != null) {
        if (markingElement.wall !== this) {
          markingElement = null
        }
      } else {
        if (!this.contains(markingElement)) {
          markingElement = null
        }
      }
    }

    this.markingSprite.removeChildren()
    if (markingElement) {
      markingElement = markingElement.reverseIfToward(this)
      let v = new Vector({
        p1: this.p1,
        p2: markingElement.p1
      })
      if (v.length() > C.MM_EPSILON) {
        this.markingSprite.addChild(this.getMarkingByVector(v, scale, this.alternativeSprites[0]))
      }
      if (markingElement.length() > C.MM_EPSILON) {
        this.markingSprite.addChild(this.getMarkingByVector(markingElement, scale, this.alternativeSprites[1]))
      }
      v = new Vector({
        p1: markingElement.p2,
        p2: this.p2
      })
      if (v.length() > C.MM_EPSILON) {
        this.markingSprite.addChild(this.getMarkingByVector(v, scale, this.alternativeSprites[2]))
      }
    } else {
      if (this.length() > C.MM_EPSILON) {
        this.markingSprite.addChild(this.getMarkingByVector(this, scale, this.alternativeSprites[0]))
      }
    }
  }

  updateSprite (scale = C.DEFAULT_SCALE) {
    if (!this.dirty) {
      return
    }
    if (!this.sprite) {
      this.sprite = new px.Graphics()
      this.sprite.interactive = true
      this.markingSprite = new px.Container()
    }
    const s = this.sprite
    if (!this.isPoint()) {
      const polarAngle = this.polarAngle()
      const center = this.center()
      const vector = this.vector()
      vector.p1.x -= center.x
      vector.p1.y -= center.y
      vector.p2.x -= center.x
      vector.p2.y -= center.y
      const leftVector = vector.verticalOffset(this.thickness / 2).stretch({
        p1Padding: this.p1LeftPadding || 0,
        p2Padding: this.p2RightPadding || 0
      })
      const rightVector = vector.verticalOffset(-this.thickness / 2).stretch({
        p1Padding: this.p1RightPadding || 0,
        p2Padding: this.p2LeftPadding || 0
      })
      const path = [
        leftVector.p1.x, leftVector.p1.y,
        leftVector.p2.x, leftVector.p2.y,
        vector.p2.x, vector.p2.y,
        rightVector.p2.x, rightVector.p2.y,
        rightVector.p1.x, rightVector.p1.y,
        vector.p1.x, vector.p1.y,
        leftVector.p1.x, leftVector.p1.y
      ]
      s.clear()
      s.lineStyle(1 / scale, C.WALL_LINE_COLOR, C.WALL_LINE_ALPHA)
      s.beginFill(this.displayColor || C[`WALL_COLOR__${this.kind}`], this.alpha || 1)
      s.drawPolygon(path)
      s.endFill()
      s.position.set(center.x, center.y)
      if (this.displayCursor) {
        // 设置Hover状态下的鼠标指针提示
        let polarDist = polarAngle
        let direction = 's'
        for (const [pa, direc] of [
          [45, 'se'],
          [90, 'e'],
          [135, 'ne'],
          [180, 'n'],
          [225, 'nw'],
          [270, 'w'],
          [315, 'sw'],
          [360, 's']
        ]) {
          const d = Math.abs(polarAngle - pa)
          if (d < polarDist) {
            direction = direc
            polarDist = d
          } else {
            break
          }
        }
        s.cursor = direction + '-resize'
      } else {
        s.cursor = null
      }
    } else {
      s.clear()
      s.cursor = null
    }
    this.dirty = false
  }
}
