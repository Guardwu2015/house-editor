import C from '../utils/constants'
import {
  RoomType
} from './kinds'

export default class Room {
  constructor (walls) {
    this.walls = walls
    this.sprite = null
    this.textSprite = null
    this.flags = {
      hovering: false,
      selected: false
    }
    this.dirty = true
    this.kind = null
  }

  setAllFlags (value) {
    for (const key of Object.keys(this.flags)) {
      this.flags[key] = value
    }
    this.dirty = true
  }

  get displayColor () {
    if (this.flags.selected) {
      return C.ROOM_COLOR_SELECTED
    } else if (this.flags.hovering) {
      return C.ROOM_COLOR_HOVERING
    } else {
      return null
    }
  }

  setFlag (name, value) {
    if (this.flags[name] !== value) {
      this.flags[name] = value
      this.dirty = true
    }
  }

  area () {
    let result = 0
    for (const wall of this.walls) {
      const w = wall.stretch({
        p1Padding: wall.p1RightPadding,
        p2Padding: wall.p2LeftPadding
      }).verticalOffset(-wall.thickness / 2)
      result += (w.p1.y + w.p2.y) * (w.p2.x - w.p1.x)
    }
    // 在图像坐标系中，顺时针的环会得到负的result，所以需要取相反数
    return -result / 2
  }

  get visCenter () {
    let x = 0
    let y = 0
    let totalLength = 0
    for (const wall of this.walls) {
      const dx = wall.p2.x - wall.p1.x
      const dy = wall.p2.y - wall.p1.y
      const wallLength = dx * dx + dy * dy
      x += (wall.p1.x + wall.p2.x) / 2 * wallLength
      y += (wall.p1.y + wall.p2.y) / 2 * wallLength
      totalLength += wallLength
    }
    return {
      x: x / Math.max(1, totalLength),
      y: y / Math.max(1, totalLength)
    }
  }

  containsPoint ({
    x,
    y
  }) {
    let inside = false
    for (const wall of this.walls) {
      if (((wall.p2.y > y) !== (wall.p1.y > y)) && (x < (wall.p1.x - wall.p2.x) * (y - wall.p2.y) / (wall.p1.y - wall.p2.y) + wall.p2.x)) {
        inside = !inside
      }
    }
    return inside
  }

  updateSprite (scale = C.DEFAULT_SCALE) {
    const s = this.sprite
    if (s == null) {
      return
    }
    if (!this.dirty) {
      return
    }
    s.clear()
    const path = []
    for (const wall of this.walls) {
      const w = wall.stretch({
        p1Padding: wall.p1RightPadding,
        p2Padding: wall.p2LeftPadding
      }).verticalOffset(-wall.thickness / 2)
      path.push(w.p1.x, w.p1.y, w.p2.x, w.p2.y)
    }
    s.beginFill(this.displayColor || C.ROOM_COLOR_DEFAULT)
    s.drawPolygon(path)
    s.endFill()
    s.position.set(0, 0)
    if (!this.kind) {
      this.textSprite.text = ''
    } else {
      this.textSprite.style.fontSize = C.ROOM_LABEL_FONT_SIZE / scale
      this.textSprite.text = RoomType.getName(this.kind)
      const c = this.visCenter
      this.textSprite.position.set(c.x, c.y)
    }
    this.dirty = false
  }
}
