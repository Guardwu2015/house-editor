import Wall from '../model/wall'
export default class DrawWallMode {
  constructor (houseEditor, kind) {
    // HouseEditor component 对象
    this.he = houseEditor
    // 当前绘制的墙体属性
    this.kind = kind
    this.thickness = 240
    // 当前绘制
    this.drawing = null
  }

  initialize () {
    this.drawing = null
    this.house.resetStatus({
      displayCursor: false
    })
  }

  onDestroy () {
    if (this.drawing) {
      this.drawing.removeSprite(this.container)
      this.drawing = null
    }
  }

  cursor () {
    return 'crosshair'
  }

  get container () {
    return this.he.containers.wall
  }

  get house () {
    return this.he.house
  }

  get scale () {
    return this.he.scale
  }

  updateDrawingPoint (p) {
    if (!this.drawing) {
      const pt = this.house.getAlignedPoint(p)
      this.drawing = new Wall({
        p1: pt,
        p2: pt,
        thickness: this.thickness,
        kind: 'DRAWING'
      })
      this.drawing.updateSprite(this.scale)
      this.drawing.updateMarkingSprite(this.scale)
      this.drawing.addSprite(this.container)
    } else {
      this.drawing.p2 = this.house.getAlignedPoint(p, this.drawing.p1)
      this.drawing.dirty = true
    }
  }

  onClicked (e) {
    let pt = e.world
    if (this.drawing) {
      this.updateDrawingPoint(pt)
      if (!this.drawing.isPoint()) {
        pt = this.drawing.p2
        let flagStopDrawing = false
        for (const p of this.house.points) {
          if (pt.x === p.x && pt.y === p.y) {
            flagStopDrawing = true
            break
          }
        }
        this.drawing.kind = this.kind
        this.drawing.dirty = true
        this.drawing.removeSprite(this.container)
        this.house.addWall(this.drawing)
        this.house.updateSprites()
        this.drawing = null
        if (flagStopDrawing) {
          return
        }
      } else {
        return
      }
    }
    this.updateDrawingPoint(pt)
  }

  onPointermove (e) {
    const pt = this.he.viewport.toWorld(e.data.global)
    if (this.drawing) {
      this.updateDrawingPoint(pt)
      this.drawing.updateSprite(this.scale)
      this.drawing.updateMarkingSprite(this.scale)
      this.house.updateAlignments(this.drawing.p2)
    } else {
      const realPt = this.he.house.getAlignedPoint(pt)
      this.house.updateAlignments(realPt)
    }
  }

  onRightclick (e) {
    if (this.drawing) {
      if (this.drawing.sprite) {
        this.drawing.removeSprite(this.container)
      }
      this.drawing = null
    } else {
      this.he.setMode('view')
    }
  }

  onKeydownSpace (e) {
    if (!this.drawing || this.drawing.isPoint()) {
      return
    }
    let expectLength = prompt('请输入长度', this.drawing.length().toString())
    if (expectLength != null) {
      expectLength = parseInt(expectLength)
    }
    if (expectLength == null || Number.isNaN(expectLength) || expectLength <= 0) {
      return
    }
    const newPt = this.drawing.stretch({
      p2Padding: expectLength - this.drawing.length()
    }).p2
    this.drawing.p2 = newPt
    this.drawing.kind = this.kind
    this.drawing.dirty = true
    this.drawing.removeSprite(this.container)
    this.house.addWall(this.drawing)
    this.house.updateSprites()
    this.drawing = null
    this.updateDrawingPoint(newPt)
  }
}
