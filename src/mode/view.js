export default class ViewMode {
  constructor (houseEditor, kind) {
    // HouseEditor component 对象
    this.he = houseEditor
    this.dragging = null
  }

  initialize () {
    this.dragging = null
    this.house.resetStatus({
      displayCursor: true
    })
  }

  cursor () {
    return this.dragging ? 'grabbing' : 'grab'
  }

  get house () {
    return this.he.house
  }

  onPointerdown (e) {
    const pt = e.data.global
    // const rd = this.he.$refs.rd
    // rd.style.transform = `translate(${pt.x + 45}px, ${pt.y - 90}px)`
    const selected = this.he.selected
    selected.type = null
    selected.item = null
    for (const cubicColumn of this.house.cubicColumns) {
      cubicColumn.setFlag('selected', false)
      if (!selected.item && cubicColumn.sprite && cubicColumn.sprite.containsPoint(pt)) {
        selected.type = 'cubic-column'
        selected.item = cubicColumn
        cubicColumn.setFlag('selected', true)
      }
    }
    for (const door of this.house.doors) {
      door.setFlag('selected', false)
      if (!selected.item && door.sprite && door.sprite.containsPoint(pt)) {
        selected.type = 'door'
        selected.item = door
        door.setFlag('selected', true)
      }
    }

    for (const window of this.house.windows) {
      window.setFlag('selected', false)
      if (!selected.item && window.sprite && window.sprite.containsPoint(pt)) {
        selected.type = 'window'
        selected.item = window
        window.setFlag('selected', true)
      }
    }

    for (const wall of this.house.walls) {
      wall.setFlag('selected', false)
      if (!selected.item && wall.sprite && wall.sprite.containsPoint(pt)) {
        selected.type = 'wall'
        selected.item = wall
        wall.setFlag('selected', true)
      }
    }

    for (const room of this.house.rooms) {
      room.setFlag('selected', false)
      if (!selected.item && room.sprite && room.sprite.containsPoint(pt)) {
        selected.type = 'room'
        selected.item = room
        room.setFlag('selected', true)
      }
    }

    if (selected.type) {
      console.log('Select', selected.item)
      this.dragging = {
        x: pt.x,
        y: pt.y
      }
      if (selected.type === 'room') {
        this.house.markingElement = null
      } else {
        this.house.markingElement = selected.item
      }
      this.house.updateMarkings()
      this.he.setViewportFixed()
    }

    this.house.updateSprites()
  }

  onDragEnd (e) {
    if (this.dragging) {
      this.dragging = null
      this.he.cancelFixViewport()
    }
  }

  onClicked (e) {
    if (this.dragging) {
      this.dragging = null
      this.he.cancelFixViewport()
    }
  }

  onPointerup (e) {
    if (this.dragging) {
      this.dragging = null
      this.he.cancelFixViewport()
    }
  }

  onPointermove (e) {
    if (this.dragging) {
      if (Math.abs(e.data.global.x - this.dragging.x) + Math.abs(e.data.global.y - this.dragging.y) < 2) {
        return
      }
      const selectedItem = this.he.selected.item
      if (selectedItem && selectedItem.moveTo) {
        let pt = this.he.viewport.toWorld(e.data.global)
        switch (this.he.selected.type) {
          case 'door':
          case 'window':
            pt = this.house.getAlignedVector(pt, selectedItem.length(), selectedItem)
            break
          case 'cubic-column':
            pt = this.house.getAlignedCubic(pt, selectedItem.xSize, selectedItem.ySize)
            break
        }
        selectedItem.moveTo(pt)
        selectedItem.updateSprite()
        this.house.updateMarkings()
      }
    } else {
      const pt = e.data.global
      let flag = false
      for (const cubicColumn of this.house.cubicColumns) {
        cubicColumn.setFlag('hovering', false)
        if (!flag && cubicColumn.sprite && cubicColumn.sprite.containsPoint(pt)) {
          cubicColumn.setFlag('hovering', true)
          flag = true
        }
      }
      for (const windoor of this.house.doors.concat(this.house.windows)) {
        windoor.setFlag('hovering', false)
        if (!flag && windoor.sprite && windoor.sprite.containsPoint(pt)) {
          windoor.setFlag('hovering', true)
          flag = true
        }
      }
      for (const wall of this.house.walls) {
        wall.setFlag('hovering', false)
        if (!flag && wall.sprite && wall.sprite.containsPoint(pt)) {
          wall.setFlag('hovering', true)
          flag = true
        }
      }
      for (const room of this.house.rooms) {
        room.setFlag('hovering', false)
        if (!flag && room.sprite && room.sprite.containsPoint(pt)) {
          room.setFlag('hovering', true)
          flag = true
        }
      }

      this.house.updateSprites()
    }
  }

  onKeydownDelete (e) {
    this.he.deleteClick()
  }
}
