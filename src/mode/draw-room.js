import Wall from '../model/wall'
import u from '../model/util'

export default class DrawWallMode {
  constructor (houseEditor, kind) {
    // HouseEditor component 对象
    this.he = houseEditor
    // 当前绘制的墙体属性
    this.kind = kind
    this.thickness = 240
    // 当前绘制
    this.drawings = []
    // this.ps = []
    // this.length = 4
    this.startP = null
    // this.isDraw = false
  }

  initialize () {
    this.drawing = []
    this.house.resetStatus({
      displayCursor: false
    })
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
    p = this.house.getAlignedPoint(p)
    if (!this.startP) {
      this.startP = p
      for (let i = 0; i < 4; i++) {
        const wall = new Wall({
          p1: p,
          p2: p,
          thickness: this.thickness,
          kind: 'DRAWING'
        })
        wall.updateSprite(this.scale)
        wall.updateMarkingSprite(this.scale)
        wall.addSprite(this.container)
        this.drawings.push(wall)
      }
    } else {
      const points = [
        {
          p1: this.startP,
          p2: {
            x: p.x,
            y: this.startP.y
          }
        },
        {
          p1: {
            x: p.x,
            y: this.startP.y
          },
          p2: p
        },
        {
          p1: p,
          p2: {
            x: this.startP.x,
            y: p.y
          }
        },
        {
          p1: {
            x: this.startP.x,
            y: p.y
          },
          p2: this.startP
        }
      ]
      for (let i = 0; i < 4; i++) {
        Object.assign(this.drawings[i], points[i])
        this.drawings[i].dirty = true
      }
    }
    return p
  }

  onClicked (e) {
    const pt = e.world
    const datas = []
    if (this.startP) {
      const endP = this.updateDrawingPoint(pt)
      if (!u.approximately(this.startP.x, endP.x) && !u.approximately(this.startP.y, endP.y)) {
        for (let i = 0; i < 4; i++) {
          datas.push({
            p1: this.drawings[i].p1,
            p2: this.drawings[i].p2,
            thickness: this.drawings[i].thickness,
            kind: this.drawings[i].kind
          })
          this.drawings[i].kind = this.kind
          this.drawings[i].dirty = true
          this.drawings[i].removeSprite(this.container)
          this.house.addWall(this.drawings[i])
          this.house.updateSprites()
        }
        window.localStorage.setItem('seehome' + Date.now(), JSON.stringify(datas))
      }
      this.drawings = []
      this.startP = null
    } else {
      this.updateDrawingPoint(pt)
    }
  }

  onPointermove (e) {
    const pt = this.he.viewport.toWorld(e.data.global)
    let realPt = null
    if (this.startP) {
      realPt = this.updateDrawingPoint(pt)
      for (let i = 0; i < 4; i++) {
        this.drawings[i].updateSprite(this.scale)
        this.drawings[i].updateMarkingSprite(this.scale)
      }
    } else {
      realPt = this.house.getAlignedPoint(pt)
    }
    this.house.updateAlignments(realPt)
  }

  onRightclick (e) {
    if (this.startP) {
      this.startP = null
      for (let i = 0; i < 4; i++) {
        this.drawings[i].removeSprite(this.container)
      }
      this.drawings = []
    }
    this.he.setMode('view')
  }
}
