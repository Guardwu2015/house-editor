import _ from 'lodash'

import px from '../utils/pixi-wrapper'
import C from '../utils/constants'
import Wall from './wall'
import Door from './door'
import u from './util'
import Vector from './vector'
import Window from './window'
import CubicColumn from './cubic-column'
import Room from './room'
import SpritePool from '../utils/sprite-pool'
import { hasOwnProperty } from '../utils/util'

import {
  delay
} from '../utils/delay'

export default class House {
  constructor (houseEditor) {
    this.he = houseEditor
    this.walls = []
    this.windows = []
    this.doors = []
    this.cubicColumns = []
    this.rooms = []
    this.rotation = 0
    this.name = '我的户型'
    this.height = 2900

    this.pool = new SpritePool(px.Graphics)
    this.textPool = new SpritePool(px.Text)

    // dirty状态下需要重新计算rooms
    this.dirty = false

    // 当前用于标注的元素，必须是Vector
    this.markingElement = null
  }

  initialize () {
    this.markingElement = null
  }

  resetStatus ({
    displayCursor = false
  } = {}) {
    for (const wall of this.walls) {
      wall.displayCursor = displayCursor
      wall.setAllFlags(false)
    }
    for (const door of this.doors) {
      door.displayCursor = displayCursor
      door.setAllFlags(false)
    }
    for (const window of this.windows) {
      window.displayCursor = displayCursor
      window.setAllFlags(false)
    }
    for (const cubicColumn of this.cubicColumns) {
      cubicColumn.displayCursor = displayCursor
      cubicColumn.setAllFlags(false)
    }
    for (const room of this.rooms) {
      room.setAllFlags(false)
    }
  }

  get scale () {
    return this.he.scale
  }

  updateScale (s) {
    if (s < 0.01 || s > 100 || Number.isNaN(s)) {
      return
    }
    for (const obj of this.walls) {
      obj.p1.x *= s
      obj.p1.y *= s
      obj.p2.x *= s
      obj.p2.y *= s
    }
    for (const obj of this.doors) {
      obj.p1.x *= s
      obj.p1.y *= s
      obj.p2.x *= s
      obj.p2.y *= s
    }
    for (const obj of this.windows) {
      obj.p1.x *= s
      obj.p1.y *= s
      obj.p2.x *= s
      obj.p2.y *= s
    }
    for (const obj of this.cubicColumns) {
      obj.x *= s
      obj.y *= s
      obj.xSize *= s
      obj.ySize *= s
    }
    this.moveCenter(this.he.viewport.center)
  }

  moveCenter ({
    x,
    y
  }) {
    const allX = this.walls.map(wall => wall.p1.x).concat(this.walls.map(wall => wall.p2.x))
    const allY = this.walls.map(wall => wall.p1.y).concat(this.walls.map(wall => wall.p2.y))
    let deltaX = 0
    let deltaY = 0
    if (allX.length > 0) {
      deltaX = -(Math.max(...allX) + Math.min(...allX)) / 2
      deltaY = -(Math.max(...allY) + Math.min(...allY)) / 2
    }
    deltaX += x
    deltaY += y
    for (const obj of this.walls) {
      obj.p1.x += deltaX
      obj.p1.y += deltaY
      obj.p2.x += deltaX
      obj.p2.y += deltaY
    }
    for (const obj of this.doors) {
      obj.p1.x += deltaX
      obj.p1.y += deltaY
      obj.p2.x += deltaX
      obj.p2.y += deltaY
    }
    for (const obj of this.windows) {
      obj.p1.x += deltaX
      obj.p1.y += deltaY
      obj.p2.x += deltaX
      obj.p2.y += deltaY
    }
    for (const obj of this.cubicColumns) {
      obj.x += deltaX
      obj.y += deltaY
    }
  }

  loadData (data) {
    if (!data) {
      return
    }
    const walls = u.simplifyWalls(data.walls || [])
    const doors = data.doors || []
    const windows = data.windows || []
    const cubicColumns = data.cubicColumns || []
    const allX = walls.map(wall => wall.p1.x).concat(walls.map(wall => wall.p2.x))
    const allY = walls.map(wall => wall.p1.y).concat(walls.map(wall => wall.p2.y))
    let deltaX = 0
    let deltaY = 0
    if (allX.length > 0) {
      deltaX = -(Math.max(...allX) + Math.min(...allX)) / 2
      deltaY = -(Math.max(...allY) + Math.min(...allY)) / 2
    }
    deltaX += this.he.viewport.center.x
    deltaY += this.he.viewport.center.y
    for (const obj of walls) {
      obj.p1.x += deltaX
      obj.p1.y += deltaY
      obj.p2.x += deltaX
      obj.p2.y += deltaY
      this.addWall(new Wall(obj))
    }
    this.updateWallPaddings()
    for (const obj of doors) {
      obj.p1.x += deltaX
      obj.p1.y += deltaY
      obj.p2.x += deltaX
      obj.p2.y += deltaY
      this.addDoor(new Door(obj))
    }
    for (const obj of windows) {
      obj.p1.x += deltaX
      obj.p1.y += deltaY
      obj.p2.x += deltaX
      obj.p2.y += deltaY
      this.addWindow(new Window(obj))
    }
    for (const obj of cubicColumns) {
      obj.x += deltaX
      obj.y += deltaY
      this.addCubicColumn(new CubicColumn(obj))
    }
    // TODO: load other properties
    this.he.containers.room.removeChildren()
    this.he.containers.wall.removeChildren()
    this.he.containers.door.removeChildren()
    this.he.containers.window.removeChildren()
    this.he.containers.cubicColumn.removeChildren()
    this.updateSprites()

    if (data.labels) {
      this.updateRooms()
      for (const lb of data.labels) {
        if (lb.key !== 'RoomType') {
          continue
        }
        for (const room of this.rooms) {
          if (room.containsPoint({
            x: lb.position.x + deltaX,
            y: lb.position.y + deltaY
          })) {
            if (!room.kind) {
              room.kind = lb.value
              room.updateSprite(this.scale)
              break
            }
          }
        }
      }
    }
  }

  result () {
    return {
      version: 2,
      coordination: 'image',
      walls: _.map(this.walls, inst => inst.result()),
      windows: _.map(this.windows, inst => inst.result()),
      doors: _.map(this.doors, inst => inst.result()),
      cubicColumns: _.map(this.cubicColumns, inst => inst.result()),
      rotation: this.rotation,
      labels: this.labels,
      meta: {
        name: this.name,
        height: this.height
      }
    }
  }

  get vectors () {
    return [...this.walls, ...this.doors, ...this.windows, ...this.cubicColumns]
  }

  get points () {
    const records = {}
    for (const v of this.vectors) {
      let p = [v.p1.x, v.p1.y]
      records[p.toString()] = v.p1
      p = [v.p2.x, v.p2.y]
      records[p.toString()] = v.p2
    }
    for (const cc of this.cubicColumns) {
      const p = [cc.x, cc.y]
      records[p.toString()] = {
        x: cc.x,
        y: cc.y
      }
    }
    return Object.values(records)
  }

  get alignmentContainer () {
    return this.he.containers.alignment
  }

  get roomContainer () {
    return this.he.containers.room
  }

  addWall (wall) {
    const intersections = []
    for (let i = 0; i < this.walls.length; ++i) {
      const w = this.walls[i]
      let intersection = w.intersect(wall)
      if (intersection) {
        if (hasOwnProperty(intersection, 'x')) {
          if (u.pointApproximately(w.p1, intersection) || u.pointApproximately(w.p2, intersection)) {
            // 在w的端点，无需更新w
          } else {
            const newWall = new Wall({
              p1: intersection,
              p2: w.p2,
              thickness: w.thickness,
              kind: w.kind
            })
            w.p2 = {
              x: intersection.x,
              y: intersection.y
            }
            if (w.length() >= 125) {
              w.dirty = true
            } else {
              w.removeSprite(this.he.containers.wall)
              this.walls.splice(i, 1)
              i -= 1
            }
            if (newWall.length() >= 125) {
              this.walls.splice(i + 1, 0, newWall)
              i += 1
            }
          }
          if (u.pointApproximately(wall.p1, intersection) || u.pointApproximately(wall.p2, intersection)) {
            // 在wall的端点，无需处理
          } else {
            intersections.push([intersection, u.pointDist(wall.p1, intersection)])
          }
        } else {
          // 有一段重叠
          intersection = intersection.reverseIfToward(w)
          if (u.pointApproximately(w.p1, intersection.p1)) {
            if (u.pointApproximately(w.p2, intersection.p2)) {
              // 当前绘制的墙完全包含某段已存在的墙，无论已存在墙的类型，一律拆除
              w.removeSprite(this.he.containers.wall)
              this.walls.splice(i, 1)
              i -= 1
              intersection = intersection.reverseIfToward(wall)
              if (!u.pointApproximately(wall.p1, intersection.p1)) {
                intersections.push([intersection.p1, u.pointDist(wall.p1, intersection.p1)])
              }
              if (!u.pointApproximately(wall.p2, intersection.p2)) {
                intersections.push([intersection.p2, u.pointDist(wall.p1, intersection.p2)])
              }
            } else {
              if (wall.kind === w.kind && wall.thickness >= w.thickness) {
                // 在老墙上拆掉重叠的线段
                w.p1 = {
                  x: intersection.p2.x,
                  y: intersection.p2.y
                }
                w.dirty = true
              } else {
                // 当前绘制的墙进行拆解
                intersection = intersection.reverseIfToward(wall)
                if (u.pointApproximately(wall.p1, intersection.p1)) {
                  wall.p1 = {
                    x: intersection.p2.x,
                    y: intersection.p2.y
                  }
                } else {
                  wall.p2 = {
                    x: intersection.p1.x,
                    y: intersection.p1.y
                  }
                }
              }
            }
          } else if (u.pointApproximately(w.p2, intersection.p2)) {
            if (wall.kind === w.kind && wall.thickness >= w.thickness) {
              // 在老墙上拆掉重叠的线段
              w.p2 = {
                x: intersection.p1.x,
                y: intersection.p1.y
              }
              w.dirty = true
            } else {
              // 当前绘制的墙进行拆解
              intersection = intersection.reverseIfToward(wall)
              if (u.pointApproximately(wall.p1, intersection.p1)) {
                wall.p1 = {
                  x: intersection.p2.x,
                  y: intersection.p2.y
                }
              } else {
                wall.p2 = {
                  x: intersection.p1.x,
                  y: intersection.p1.y
                }
              }
            }
          } else {
            // 当前绘制的墙完全在已存在的某段墙内
            return
          }
        }
      }
    }
    intersections.sort((a, b) => a[1] - b[1])
    let lastPt = wall.p1
    for (const [pt] of intersections) {
      if (wall.contains(pt) && u.pointDist(lastPt, pt) > C.MM_EPSILON) {
        const newWall = new Wall({
          p1: lastPt,
          p2: pt,
          thickness: wall.thickness,
          kind: wall.kind
        })
        if (newWall.length() >= 125 || lastPt !== wall.p1) {
          this.walls.push(newWall)
        }
        lastPt = pt
      }
    }
    const pt = wall.p2
    if (u.pointDist(lastPt, pt) > C.MM_EPSILON) {
      const newWall = new Wall({
        p1: lastPt,
        p2: pt,
        thickness: wall.thickness,
        kind: wall.kind
      })
      if (newWall.length() >= 700 || (newWall.length() >= 125 && u.approximately(u.mod(newWall.polarAngle(), 90), [0, 90]))) {
        this.walls.push(newWall)
      }
      this.dirty = true
    }
  }

  addDoor (door) {
    if (door.length() < 125) {
      return
    }
    const pt = this.getAlignedVector(door.center(), door.length())
    door.moveTo(pt)
    for (const wall of this.walls) {
      if (wall.contains(door)) {
        door.wall = wall
        break
      }
    }
    const uuid = 'seehome' + Date.now()
    door.uuid = uuid
    this.doors.push(door)
  }

  addWindow (window) {
    if (window.length() < 125) {
      return
    }
    const pt = this.getAlignedVector(window.center(), window.length())
    window.moveTo(pt)
    for (const wall of this.walls) {
      if (wall.contains(window)) {
        window.wall = wall
        break
      }
    }
    const uuid = 'seehome' + Date.now()
    window.uuid = uuid
    this.windows.push(window)
  }

  addCubicColumn (cubicColumn) {
    const uuid = 'seehome' + Date.now()
    cubicColumn.uuid = uuid
    this.cubicColumns.push(cubicColumn)
  }

  updateRooms () {
    const pointWalls = {}
    for (const wall of this.walls) {
      if (wall.isPoint()) {
        continue
      }
      const p1 = [u.round(wall.p1.x, C.EPSILON), u.round(wall.p1.y, C.EPSILON)].toString()
      const p2 = [u.round(wall.p2.x, C.EPSILON), u.round(wall.p2.y, C.EPSILON)].toString()
      if (!hasOwnProperty(pointWalls, p1)) {
        pointWalls[p1] = []
      }
      if (!hasOwnProperty(pointWalls, p2)) {
        pointWalls[p2] = []
      }
      pointWalls[p1].push(wall)
      pointWalls[p2].push(wall.reverse())
    }
    // BFS
    const rooms = []
    while (1) {
      // 寻找一个起始点：x坐标最大。若存在多个，则取其中y坐标最小的
      let startPoint = null
      for (const pt of Object.keys(pointWalls)) {
        if (pointWalls[pt].length > 0) {
          if (startPoint == null) {
            startPoint = pt
          } else if (parseFloat(pt.split(',')[0]) > parseFloat(startPoint.split(',')[0])) {
            startPoint = pt
          } else if ((parseFloat(pt.split(',')[0]) === parseFloat(startPoint.split(',')[0])) &&
            (parseFloat(pt.split(',')[1]) < parseFloat(startPoint.split(',')[1]))) {
            startPoint = pt
          }
        }
      }
      if (startPoint == null) {
        break
      }
      let contraryPolarAngle = 180
      const walls = []
      let currentPoint = startPoint
      while (hasOwnProperty(pointWalls, currentPoint) && pointWalls[currentPoint].length > 0) {
        let minAngleDelta = null
        let nextWall = null
        let bestIndex = null
        pointWalls[currentPoint].forEach((wallVector, i) => {
          let polarAngle = u.mod(wallVector.polarAngle() - contraryPolarAngle, 360)
          if (u.approximately(polarAngle, 0)) {
            polarAngle = 360
          }
          if (minAngleDelta == null || minAngleDelta > polarAngle) {
            minAngleDelta = polarAngle
            nextWall = wallVector
            bestIndex = i
          }
        })
        walls.push(nextWall)
        pointWalls[currentPoint].splice(bestIndex, 1)
        currentPoint = [u.round(nextWall.p2.x, C.EPSILON), u.round(nextWall.p2.y, C.EPSILON)].toString()
        contraryPolarAngle = u.mod(nextWall.polarAngle() - 180, 360)
        if (currentPoint === startPoint) {
          // 检测出环
          break
        }
      }
      if (u.pointApproximately(walls[0].p1, walls[walls.length - 1].p2) && u.isPointsClockwise(walls.map(w => w.p1))) {
        rooms.push(new Room(walls))
      }
    }
    this.roomContainer.removeChildren()
    for (const room of this.rooms) {
      this.pool.revoke(room.sprite)
      this.he.containers.marking.removeChild(room.textSprite)
      this.textPool.revoke(room.textSprite)
    }
    const labels = this.labels
    for (const lb of labels) {
      if (lb.key !== 'RoomType') {
        continue
      }
      for (const room of rooms) {
        if (room.containsPoint(lb.position)) {
          if (!room.kind) {
            room.kind = lb.value
            break
          }
        }
      }
    }
    this.rooms = rooms
    for (const room of this.rooms) {
      room.sprite = this.pool.acquire()
      const ts = room.textSprite = this.textPool.acquire()
      ts.style = C.ROOM_LABEL_TEXT_STYLE
      ts.anchor.set(0.5, 0.5)
      room.updateSprite(this.scale)
      this.roomContainer.addChild(room.sprite)
      this.he.containers.marking.addChild(room.textSprite)
    }
  }

  get labels () {
    const result = []
    for (const room of this.rooms) {
      if (room.kind) {
        result.push({
          position: room.visCenter,
          key: 'RoomType',
          value: room.kind
        })
      }
    }
    return result
  }

  area () {
    let x = 0
    for (const room of this.rooms) {
      x += room.area()
    }
    return x
  }

  updateWallPaddings () {
    const pointWalls = {}
    for (const wall of this.walls) {
      if (wall.isPoint()) {
        continue
      }
      const p1 = [u.round(wall.p1.x, C.EPSILON), u.round(wall.p1.y, C.EPSILON)].toString()
      const p2 = [u.round(wall.p2.x, C.EPSILON), u.round(wall.p2.y, C.EPSILON)].toString()
      if (!hasOwnProperty(pointWalls, p1)) {
        pointWalls[p1] = []
      }
      if (!hasOwnProperty(pointWalls, p2)) {
        pointWalls[p2] = []
      }
      pointWalls[p1].push([wall.polarAngle(), wall, 'p1'])
      pointWalls[p2].push([u.mod(wall.polarAngle() + 180, 360), wall, 'p2'])
    }
    for (const pt of Object.keys(pointWalls)) {
      const walls = pointWalls[pt]
      const count = walls.length
      if (count < 2) {
        for (const wall of walls) {
          wall[1].setPaddings(wall[2], null, null)
        }
        continue
      }
      walls.sort((a, b) => a[0] - b[0])
      for (let i = 0; i < count; i += 2) {
        const lastI = i === 0 ? count - 1 : i - 1
        const nextI = i === count - 1 ? 0 : i + 1
        const lastWall = walls[lastI]
        const nextWall = walls[nextI]
        const wall = walls[i]
        const [lastPadding, iPadding] = Vector.getPaddings(lastWall[1], wall[1], lastWall[0] - wall[0] + 180)
        lastWall[1].setPadding(lastWall[2] + 'Left', -lastPadding)
        wall[1].setPadding(wall[2] + 'Right', -iPadding)
        const [iPadding2, nextPadding] = Vector.getPaddings(wall[1], nextWall[1], wall[0] - nextWall[0] + 180)
        wall[1].setPadding(wall[2] + 'Left', -iPadding2)
        nextWall[1].setPadding(nextWall[2] + 'Right', -nextPadding)
      }
    }
  }

  updateSprites (force = false) {
    delay('house:updateSprites', () => {
      this.updateWallPaddings()
      for (const wall of this.walls) {
        if (force) {
          wall.dirty = true
        }
        const addSprite = !wall.sprite
        wall.updateSprite(this.scale)
        wall.updateMarkingSprite(this.scale, this.markingElement)
        if (addSprite) {
          wall.addSprite(this.he.containers.wall)
        }
      }
      for (const door of this.doors) {
        if (force) {
          door.dirty = true
        }
        const addSprite = !door.sprite
        door.updateSprite(this.scale)
        if (addSprite) {
          door.addSprite(this.he.containers.door)
        }
      }

      for (const window of this.windows) {
        if (force) {
          window.dirty = true
        }
        const addSprite = !window.sprite
        window.updateSprite(this.scale)
        if (addSprite) {
          window.addSprite(this.he.containers.window)
        }
      }

      for (const cubicColumn of this.cubicColumns) {
        if (force) {
          cubicColumn.dirty = true
        }
        const addSprite = !cubicColumn.sprite
        cubicColumn.updateSprite(this.scale)
        if (addSprite) {
          cubicColumn.addSprite(this.he.containers.cubicColumn)
        }
      }

      if (force || this.dirty) {
        this.updateRooms()
        this.dirty = false
      } else {
        for (const room of this.rooms) {
          room.updateSprite(this.scale)
        }
      }
    })
  }

  updateMarkings () {
    delay('house:updateMarking', () => {
      for (const wall of this.walls) {
        wall.updateMarkingSprite(this.scale, this.markingElement)
      }
    })
  }

  getVectorRemainPaddings (vec) {
    // 根据提供的线段，返回其两端点能伸展的长度
    if (!vec) {
      return {
        p1: 0,
        p2: 0
      }
    }
    let relatedWall = null
    if (vec.wall) {
      relatedWall = vec.wall
      if (!relatedWall.contains(vec)) {
        relatedWall = null
      }
    }
    if (!relatedWall) {
      return {
        p1: 0,
        p2: 0
      }
    }
    let mainWall = relatedWall.stretch({
      p1Padding: -Math.max(Math.abs(relatedWall.p1LeftPadding), Math.abs(relatedWall.p1RightPadding)),
      p2Padding: -Math.max(Math.abs(relatedWall.p2LeftPadding), Math.abs(relatedWall.p2RightPadding))
    })
    for (const v of this.doors.concat(this.windows)) {
      if (v === vec) {
        continue
      }
      if (v.wall !== relatedWall) {
        continue
      }
      const realVec = v.reverseIfToward(mainWall)
      const v1 = new Vector({
        p1: mainWall.p1,
        p2: realVec.p1
      })
      if (v1.contains(vec.p1)) {
        mainWall = v1
      } else {
        mainWall = new Vector({
          p1: realVec.p2,
          p2: mainWall.p2
        })
      }
    }
    vec = vec.reverseIfToward(mainWall)
    return {
      p1: u.pointDist(vec.p1, mainWall.p1),
      p2: u.pointDist(vec.p2, mainWall.p2)
    }
  }

  getAlignedCubic ({
    x,
    y
  }, expectXSize, expectYSize) {
    // 根据提供的点和两个方向尺寸，返回优化后的结构部件中心点、旋转角度
    const alignThre = C.ALIGNMENT_SCREEN_THRESHOLD / this.scale
    const walls = this.walls
    let xPt = null
    let xPtDist = Infinity
    let relatedXWall = null
    for (const wall of walls) {
      const projection = wall.getProjectedPoint({
        x,
        y
      })
      if (!wall.contains(projection)) {
        continue
      }
      const d = Math.abs(u.pointDist({
        x,
        y
      }, projection) - wall.thickness / 2 - expectXSize / 2)
      if (d < xPtDist) {
        xPt = projection
        xPtDist = d
        relatedXWall = wall
      }
    }
    if (xPtDist > alignThre) {
      return {
        x: x,
        y: y,
        rotation: 0
      }
    }
    let vec = new Vector({
      p1: {
        x,
        y
      },
      p2: xPt
    })
    let alignPt = vec.stretch({
      p1Padding: expectXSize / 2 + relatedXWall.thickness / 2 - vec.length()
    }).p1
    let yPt = null
    let yPtDist = Infinity
    let relatedYWall = null
    const xPolarAngle = relatedXWall.polarAngle()
    for (const wall of walls) {
      if (!u.approximately(u.mod(wall.polarAngle() - xPolarAngle, 180), 90)) {
        continue
      }
      const projection = wall.getProjectedPoint(alignPt)
      if (!wall.contains(projection)) {
        continue
      }
      const d = Math.abs(u.pointDist(alignPt, projection) - wall.thickness / 2 - expectYSize / 2)
      if (d < yPtDist) {
        yPt = projection
        yPtDist = d
        relatedYWall = wall
      }
    }
    if (yPtDist > alignThre) {
      return {
        x: alignPt.x,
        y: alignPt.y,
        rotation: u.mod(-xPolarAngle + 90, 360)
      }
    }
    vec = new Vector({
      p1: alignPt,
      p2: yPt
    })
    alignPt = vec.stretch({
      p1Padding: expectYSize / 2 + relatedYWall.thickness / 2 - vec.length()
    }).p1
    return {
      x: alignPt.x,
      y: alignPt.y,
      rotation: u.mod(-xPolarAngle + 90, 360)
    }
  }

  getAlignedVector ({
    x,
    y
  }, expectLength, ignoreVec = null, relatedWall = null) {
    // 根据提供的点和预期的线段长度，返回优化后线段的两个端点和它所在的墙
    // 不能与现有门窗出现重叠
    // 用于门窗的绘制
    const alignThre = C.ALIGNMENT_SCREEN_THRESHOLD / this.scale
    const walls = this.walls
    let pt = null
    let ptDist = Infinity
    if (relatedWall == null) {
      for (const wall of walls) {
        const projection = wall.getProjectedPoint({
          x,
          y
        })
        if (!wall.contains(projection)) {
          continue
        }
        const d = u.pointDist({
          x,
          y
        }, projection)
        if (d < ptDist) {
          pt = projection
          ptDist = d
          relatedWall = wall
        }
      }
    } else {
      pt = relatedWall.getProjectedPoint({
        x,
        y
      })
      ptDist = u.pointDist({
        x,
        y
      }, pt)
    }
    if (ptDist > alignThre) {
      x = Math.round(x)
      y = Math.round(y)
      return {
        p1: {
          x: x - expectLength / 2,
          y: y
        },
        p2: {
          x: x + expectLength / 2,
          y: y
        },
        wall: null
      }
    }
    let mainWall = relatedWall.stretch({
      p1Padding: -Math.max(Math.abs(relatedWall.p1LeftPadding), Math.abs(relatedWall.p1RightPadding)),
      p2Padding: -Math.max(Math.abs(relatedWall.p2LeftPadding), Math.abs(relatedWall.p2RightPadding))
    })
    if (mainWall.length() < C.VECTOR_MINIMUM_LENGTH || !mainWall.contains(pt)) {
      return null
    }
    for (const vec of this.doors.concat(this.windows)) {
      if (vec === ignoreVec) {
        continue
      }
      if (vec.contains(pt)) {
        return null
      }
      if (!mainWall.contains(vec)) {
        continue
      }
      const realVec = vec.reverseIfToward(mainWall)
      const v1 = new Vector({
        p1: mainWall.p1,
        p2: realVec.p1
      })
      if (v1.contains(pt)) {
        mainWall = v1
      } else {
        mainWall = new Vector({
          p1: realVec.p2,
          p2: mainWall.p2
        })
      }
    }
    const fixedFlag = {
      p1: false,
      p2: false
    }
    let result = new Vector({
      p1: mainWall.stretch({
        p1Padding: -(u.pointDist(pt, mainWall.p1) - expectLength / 2)
      }).p1,
      p2: mainWall.stretch({
        p2Padding: -(u.pointDist(pt, mainWall.p2) - expectLength / 2)
      }).p2
    })
    if (result.contains(mainWall.p1)) {
      const d = u.pointDist(result.p1, mainWall.p1)
      result = result.stretch({
        p2Padding: d
      })
      result.p1 = mainWall.p1
      fixedFlag.p1 = true
    }
    if (result.contains(mainWall.p2)) {
      if (fixedFlag.p1) {
        result.p2 = mainWall.p2
      } else {
        const d = u.pointDist(result.p2, mainWall.p2)
        result = result.stretch({
          p1Padding: d
        })
        result.p2 = mainWall.p2
        if (result.contains(mainWall.p1)) {
          result.p1 = mainWall.p1
          fixedFlag.p1 = true
        }
      }
      fixedFlag.p2 = true
    }
    if (result.length() < C.VECTOR_MINIMUM_LENGTH) {
      return null
    }
    return {
      p1: result.p1,
      p2: result.p2,
      wall: relatedWall
    }
  }

  getAlignedPoint ({
    x,
    y
  }, lastPt = null) {
    // 根据提供的点进行吸附优化，返回优化后的点
    // 用于墙的绘制
    const alignThre = C.ALIGNMENT_SCREEN_THRESHOLD / this.scale
    const points = this.points
    if (lastPt != null) {
      points.push(lastPt)
    }
    // 吸附点
    let pt = null
    let ptDist = Infinity
    for (const p of points) {
      const d = u.pointDist(p, {
        x,
        y
      })
      if (d < ptDist) {
        pt = p
        ptDist = d
      }
    }
    if (ptDist <= alignThre) {
      return pt
    }
    // 吸附直线的交点
    const vectors = this.vectors
    const vectorCount = vectors.length
    for (let i = 0; i < vectorCount - 1; ++i) {
      for (let j = i + 1; j < vectorCount; ++j) {
        const vi = vectors[i]
        const vj = vectors[j]
        const intersection = vi.lineIntersect(vj)
        if (intersection && hasOwnProperty(intersection, 'x')) {
          const d = u.pointDist(intersection, {
            x,
            y
          })
          if (d < ptDist) {
            pt = intersection
            ptDist = d
          }
        }
      }
    }
    if (ptDist <= alignThre) {
      return pt
    }
    // 在xy轴上吸附点
    const pointCount = points.length
    for (let i = 0; i < pointCount - 1; ++i) {
      for (let j = i + 1; j < pointCount; ++j) {
        const pi = points[i]
        const pj = points[j]
        let p = {
          x: pi.x,
          y: pj.y
        }
        let d = u.pointDist(p, {
          x,
          y
        })
        if (d < ptDist) {
          pt = p
          ptDist = d
        }
        p = {
          x: pj.x,
          y: pi.y
        }
        d = u.pointDist(p, {
          x,
          y
        })
        if (d < ptDist) {
          pt = p
          ptDist = d
        }
      }
    }
    if (ptDist <= alignThre) {
      return pt
    }
    // 吸附直线
    for (const point of points) {
      let p = {
        x: point.x,
        y: Math.round(y)
      }
      let d = u.pointDist(p, {
        x,
        y
      })
      if (d < ptDist) {
        pt = p
        ptDist = d
      }
      p = {
        x: Math.round(x),
        y: point.y
      }
      d = u.pointDist(p, {
        x,
        y
      })
      if (d < ptDist) {
        pt = p
        ptDist = d
      }
    }
    if (ptDist <= alignThre) {
      return pt
    }
    for (const vec of vectors) {
      const projection = vec.getProjectedPoint({
        x,
        y
      })
      const d = u.pointDist({
        x,
        y
      }, projection)
      if (d < ptDist) {
        pt = projection
        ptDist = d
      }
    }
    if (ptDist <= alignThre) {
      return pt
    }
    if (lastPt == null) {
      return {
        x: Math.round(x),
        y: Math.round(y)
      }
    } else {
      // 与上一个顶点呈标准的几个角度
      const vec = new Vector({
        p1: lastPt,
        p2: {
          x,
          y
        }
      })
      const polarAngle = vec.polarAngle()
      const vecLength = Math.round(vec.length())
      let expectPolarAngle = 0
      let polarDist = polarAngle
      for (const pa of [45, 90, 135, 180, 225, 270, 315, 360]) {
        const d = Math.abs(pa - polarAngle)
        if (d < polarDist) {
          expectPolarAngle = pa
          polarDist = d
        } else {
          break
        }
      }
      if (polarDist < 5) {
        const sinTheta = Math.sin(expectPolarAngle * Math.PI / 180)
        const cosTheta = Math.cos(expectPolarAngle * Math.PI / 180)
        return {
          x: lastPt.x + vecLength * cosTheta,
          y: lastPt.y - vecLength * sinTheta
        }
      } else {
        return {
          x: Math.round(x),
          y: Math.round(y)
        }
      }
    }
  }

  updateAlignments (pt = null) {
    // 根据提供的点找到所有与之相关的点和线段，并绘制对应的精灵
    for (const sprite of this.alignmentContainer.children) {
      this.pool.revoke(sprite)
    }
    this.alignmentContainer.removeChildren()
    if (!pt) {
      return
    }
    let xLine = false
    let yLine = false
    const lineSprites = []
    for (const p of this.points) {
      if (pt.x === p.x) {
        if (pt.y === p.y) {
          const sprite = this.pool.acquire()
          sprite.clear()
          sprite.beginFill(C.ALIGNMENT_COLOR)
          sprite.drawCircle(0, 0, C.ALIGNMENT_POINT_RADIUS / this.scale)
          sprite.endFill()
          sprite.x = p.x
          sprite.y = p.y
          this.alignmentContainer.addChild(sprite)
          return
        } else {
          if (!xLine) {
            xLine = true
            const sprite = this.pool.acquire()
            sprite.clear()
            sprite.lineStyle(C.ALIGNMENT_LINE_THICKNESS / this.scale, C.ALIGNMENT_COLOR, C.ALIGNMENT_ALPHA)
            sprite.moveTo(0, 0)
            sprite.lineTo(0, this.he.realWorldSize)
            sprite.x = pt.x
            sprite.y = 0
            lineSprites.push(sprite)
          }
        }
      } else if (pt.y === p.y) {
        if (!yLine) {
          yLine = true
          const sprite = this.pool.acquire()
          sprite.clear()
          sprite.lineStyle(C.ALIGNMENT_LINE_THICKNESS / this.scale, C.ALIGNMENT_COLOR, C.ALIGNMENT_ALPHA)
          sprite.moveTo(0, 0)
          sprite.lineTo(this.he.realWorldSize, 0)
          sprite.x = 0
          sprite.y = pt.y
          lineSprites.push(sprite)
        }
      }
    }
    for (const vec of this.vectors) {
      if (u.approximately(vec.polarAngle(), [0, 90, 180, 270, 360], C.EPSILON)) {
        continue
      }
      if (vec.lineContains(pt)) {
        const line = vec.stretch({
          p1Padding: this.he.realWorldSize,
          p2Padding: this.he.realWorldSize
        })
        const sprite = this.pool.acquire()
        sprite.clear()
        sprite.lineStyle(C.ALIGNMENT_LINE_THICKNESS / this.scale, C.ALIGNMENT_COLOR, C.ALIGNMENT_ALPHA)
        sprite.moveTo(line.p1.x, line.p1.y)
        sprite.lineTo(line.p2.x, line.p2.y)
        sprite.x = 0
        sprite.y = 0
        lineSprites.push(sprite)
      }
    }
    for (const sprite of lineSprites) {
      this.alignmentContainer.addChild(sprite)
    }
    if (lineSprites.length > 1) {
      const sprite = this.pool.acquire()
      sprite.clear()
      sprite.beginFill(C.ALIGNMENT_COLOR)
      sprite.drawCircle(0, 0, C.ALIGNMENT_POINT_RADIUS / this.scale)
      sprite.endFill()
      sprite.x = pt.x
      sprite.y = pt.y
      this.alignmentContainer.addChild(sprite)
    }
  }
}
