import _ from 'lodash'

import C from '../utils/constants'
import u from './utils'
import {
  clone,
  equals
} from '../utils/object'

import { hasOwnProperty } from '../utils/util'

export default class Vector {
  static LINE_COINCIDE = Symbol('The two lines are coincided')

  constructor ({
    p1,
    p2,
    thickness = 0
  }) {
    this.p1 = {
      x: p1.x,
      y: p1.y
    }
    this.p2 = {
      x: p2.x,
      y: p2.y
    }
    this.thickness = thickness
  }

  copy (updates) {
    const data = this.result()
    if (updates) {
      for (const key of Object.keys(updates)) {
        if (hasOwnProperty(data, key)) {
          data[key] = updates[key]
        }
      }
    }
    return new this.constructor(data)
  }

  result () {
    return {
      p1: this.p1,
      p2: this.p2,
      thickness: this.thickness
    }
  }

  vector () {
    return new Vector({
      p1: clone(this.p1),
      p2: clone(this.p2)
    })
  }

  dx () {
    return this.p2.x - this.p1.x
  }

  dy () {
    return this.p2.y - this.p1.y
  }

  length () {
    const dx = this.dx()
    const dy = this.dy()
    return Math.sqrt(dx * dx + dy * dy)
  }

  center () {
    return {
      x: (this.p1.x + this.p2.x) / 2,
      y: (this.p1.y + this.p2.y) / 2
    }
  }

  isPoint () {
    const e = C.EPSILON
    return _.inRange(this.dx(), -e, e) && _.inRange(this.dy(), -e, e)
  }

  assertNotPoint (errMsg) {
    if (this.isPoint()) {
      throw errMsg
    }
  }

  polarAngle () {
    const e = C.EPSILON
    const dx = this.dx()
    const dy = this.dy()
    if (_.inRange(dx, -e, e)) {
      if (_.inRange(dy, -e, e)) {
        this.assertNotPoint('Direction unknown: the length of vector is too small')
      }
      // 图像坐标系，dy>0时是向下的
      return dy > 0 ? 270 : 90
    } else if (_.inRange(dy, -e, e)) {
      return dx > 0 ? 0 : 180
    }
    let angle = Math.atan(dy / dx) / Math.PI * 180
    if (dx < 0) {
      angle += 180
    }
    // 图像坐标系，角度需要镜像
    return u.mod(-angle, 360)
  }

  reverse (constructor = null) {
    if (constructor == null) {
      constructor = this.constructor
    }
    const obj = this.result()
    const tmp = obj.p1
    obj.p1 = obj.p2
    obj.p2 = tmp
    return new constructor(obj)
  }

  reverseInPlace () {
    const tmp = this.p1
    this.p1 = this.p2
    this.p2 = tmp
    return this
  }

  rotate () {
    return this.reverseInPlace()
  }

  reverseIfToward (vector) {
    if (u.approximately(u.mod(this.polarAngle() - vector.polarAngle(), 360), 180, C.EPSILON)) {
      return this.reverse()
    } else {
      return this
    }
  }

  lineDistTo (other) {
    if (hasOwnProperty(other, 'x')) {
      // other is a point
      if (this.isPoint()) {
        return u.pointDist(this.center(), other)
      }
      return Math.abs(
        (this.p2.y - this.p1.y) * other.x - (this.p2.x - this.p1.x) * other.y +
        this.p2.x * this.p1.y - this.p2.y * this.p1.x
      ) / this.length()
    } else {
      const intersection = this.lineIntersect(other)
      if (!intersection) {
        if (this.isPoint()) {
          return other.lineDistTo(this.center())
        }
        return this.lineDistTo(other.p1)
      } else {
        return 0
      }
    }
  }

  getProjectedPoint (pt) {
    const e = C.MM_EPSILON
    const e2 = new this.constructor({
      p1: this.p1,
      p2: pt
    })
    const lenLineE2 = e2.length()
    if (_.inRange(lenLineE2, -e, e)) {
      return clone(this.p1)
    }
    const e1 = this
    const lenLineE1 = e1.length()
    this.assertNotPoint('Projected point unknown: require a vector with real length')
    const projLenOfLine = (e1.dx() * e2.dx() + e1.dy() * e2.dy()) / lenLineE1
    return {
      x: this.p1.x + (projLenOfLine * e1.dx()) / lenLineE1,
      y: this.p1.y + (projLenOfLine * e1.dy()) / lenLineE1
    }
  }

  distTo (other) {
    if (hasOwnProperty(other, 'x')) {
      // other is a point
      if (this.isPoint()) {
        return u.pointDist(this.center(), other)
      }
      if (equals(other, this.p1) || equals(other, this.p2)) {
        return 0
      }
      const projection = this.getProjectedPoint(other)
      if (u.inRange(projection.x, this.p1.x, this.p2.x) && u.inRange(projection.y, this.p1.y, this.p2.y)) {
        return this.lineDistTo(other)
      } else {
        return Math.min(u.pointDist(other, this.p1), u.pointDist(other, this.p2))
      }
    } else {
      const intersection = this.intersect(other)
      if (!intersection) {
        if (this.isPoint()) {
          return other.distTo(this.center())
        }
        return Math.min(this.distTo(other.p1), this.distTo(other.p2))
      } else {
        return 0
      }
    }
  }

  lineContains (item) {
    const e = C.MM_EPSILON
    if (hasOwnProperty(item, 'x')) {
      return this.lineDistTo(item) < e
    } else {
      return this.lineContains(item.p1) && this.lineContains(item.p2)
    }
  }

  contains (item) {
    const e = C.MM_EPSILON
    if (hasOwnProperty(item, 'x')) {
      return this.distTo(item) < e
    } else {
      return this.contains(item.p1) && this.contains(item.p2)
    }
  }

  verticalOffset (offset) {
    // 整条线段向垂直方向平移一段距离，平移方向为向量方向逆时针旋转90度方向（图像坐标系）
    return this.copy({
      p1: this.getP1VerticalOffsetPoint(offset),
      p2: this.reverse().getP1VerticalOffsetPoint(-offset)
    })
  }

  getP1VerticalOffsetPoint (offset) {
    // p1向垂直方向平移一段距离，平移方向为向量方向逆时针旋转90度方向（图像坐标系）
    this.assertNotPoint('Vertical offset error: the vector should have a length')
    const dx = this.dx()
    const dy = this.dy()
    const d = Math.sqrt(dx * dx + dy * dy)
    return {
      x: this.p1.x + offset / d * dy,
      y: this.p1.y - offset / d * dx
    }
  }

  getP2VerticalOffsetPoint (offset) {
    // p2向垂直方向平移一段距离，平移方向为向量方向逆时针旋转90度方向（图像坐标系）
    this.assertNotPoint('Vertical offset error: the vector should have a length')
    const dx = this.dx()
    const dy = this.dy()
    const d = Math.sqrt(dx * dx + dy * dy)
    return {
      x: this.p2.x + offset / d * dy,
      y: this.p2.y - offset / d * dx
    }
  }

  getPointVerticalOffsetPoint (point, offset) {
    // 点point向垂直方向平移一段距离，平移方向为向量方向逆时针旋转90度方向（图像坐标系）
    this.assertNotPoint('Vertical offset error: the vector should have a length')
    const dx = this.dx()
    const dy = this.dy()
    const d = Math.sqrt(dx * dx + dy * dy)
    return {
      x: point.x + offset / d * dy,
      y: point.y - offset / d * dx
    }
  }

  lineIntersect (other) {
    // 两条直线的交点，返回null表示不相交，Vector.LINE_COINCIDE表示重合，其余情况返回交点坐标
    if (this.isPoint()) {
      return other.lineContains(this) ? this.center() : null
    }
    if (other.isPoint()) {
      return this.lineContains(other) ? other.center() : null
    }
    const dx12 = this.p1.x - this.p2.x
    const dx34 = other.p1.x - other.p2.x
    const dy12 = this.p1.y - this.p2.y
    const dy34 = other.p1.y - other.p2.y
    let d = dx12 * dy34 - dy12 * dx34
    const e = C.MM_EPSILON
    if (_.inRange(d, -e, e)) {
      d = this.lineDistTo(other.p1)
      return d < e ? Vector.LINE_COINCIDE : null
    }
    const xy12 = this.p1.x * this.p2.y - this.p1.y * this.p2.x
    const xy34 = other.p1.x * other.p2.y - other.p1.y * other.p2.x
    return {
      x: (xy12 * dx34 - dx12 * xy34) / d,
      y: (xy12 * dy34 - dy12 * xy34) / d
    }
  }

  _pointOrMyself () {
    if (this.isPoint()) {
      return this.center()
    } else {
      return this
    }
  }

  intersect (other) {
    // 两个向量的相交情况
    // 返回 Point 表示它们相交于点，Vector 表示它们有重合，None 表示它们无任何交点
    const intersection = this.lineIntersect(other)
    if (!intersection) {
      return null
    } else if (intersection === Vector.LINE_COINCIDE) {
      if (other.contains(this.p1)) {
        if (other.contains(this.p2)) {
          return new Vector({
            p1: clone(this.p1),
            p2: clone(this.p2)
          })
        } else {
          let p1 = this.p1
          let p2
          if (this.contains(other.p1)) {
            if (this.contains(other.p2)) {
              p1 = other.p1
              p2 = other.p2
            } else {
              p2 = other.p1
            }
          } else {
            p2 = other.p2
          }
          return new Vector({
            p1: clone(p1),
            p2: clone(p2)
          })._pointOrMyself()
        }
      } else if (other.contains(this.p2)) {
        let p1 = this.p2
        let p2
        if (this.contains(other.p1)) {
          if (this.contains(other.p2)) {
            p1 = other.p1
            p2 = other.p2
          } else {
            p2 = other.p1
          }
        } else {
          p2 = other.p2
        }
        return new Vector({
          p1: clone(p1),
          p2: clone(p2)
        })._pointOrMyself()
      } else {
        if (this.contains(other.p1)) {
          return new Vector({
            p1: clone(other.p1),
            p2: clone(other.p2)
          })._pointOrMyself()
        }
        return null
      }
    } else {
      if (this.contains(intersection) && other.contains(intersection)) {
        return intersection
      } else {
        return null
      }
    }
  }

  stretch ({
    p1Padding = 0,
    p2Padding = 0
  } = {}) {
    // 将向量向 p1 和 p2 方向分别延伸给定的长度，得到新向量
    this.assertNotPoint('stretch failed: the vector should have a length')
    const e = C.MM_EPSILON
    const inst = this.copy()
    let ratio
    if (p1Padding <= -e || p1Padding >= e) {
      ratio = p1Padding / this.length()
      inst.p1.x -= ratio * this.dx()
      inst.p1.y -= ratio * this.dy()
    }
    if (p2Padding <= -e || p2Padding >= e) {
      ratio = p2Padding / this.length()
      inst.p2.x += ratio * this.dx()
      inst.p2.y += ratio * this.dy()
    }
    return inst
  }

  static getPaddings (w0, w1, theta) {
    // 计算w0、w1交点处的padding
    if (theta == null) {
      theta = w0.polarAngle() - w1.polarAngle()
      if (equals(w0.p1, w1.p1) || equals(w0.p2, w1.p2)) {
        theta += 180
      } else if (equals(w0.p1, w1.p2) || equals(w0.p2, w1.p1)) {

      } else {
        theta = 0
      }
    }
    if (u.approximately(theta, [0, 180, 360], C.EPSILON)) {
      return [0, 0]
    }
    const sinTheta = Math.sin(Math.PI * theta / 180)
    const cosTheta = Math.cos(Math.PI * theta / 180)
    return [
      (w1.thickness - w0.thickness * cosTheta) / sinTheta / 2,
      (w0.thickness - w1.thickness * cosTheta) / sinTheta / 2
    ]
  }
}
