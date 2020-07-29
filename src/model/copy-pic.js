import px from '../utils/pixi-wrapper'
import C from '../utils/constants'

export default class CopyPic {
  constructor ({
    worldWidth,
    rotation = 0,
    alpha = 1,
    data
  }) {
    this.sprite = null
    this.texture = null
    this.x = 0
    this.y = 0
    this.worldWidth = worldWidth
    this.rotation = rotation
    this.alpha = alpha
    this.dirty = true
    this.data = data
  }

  get scale () {
    return this.worldWidth / Math.max(1, this.texture.width)
  }

  rotate () {
    this.rotation += Math.PI / 2
  }

  antiRotate () {
    this.rotation -= Math.PI / 2
  }

  enlarge () {
    this.scale += 10
    if (this.scale > 100) {
      this.scale = 100
    }
  }

  shrink () {
    this.scale--
    if (this.scale < 10) {
      this.scale = 10
    }
  }

  addAlpha () {
    this.alpha += 0.1
    if (this.alpha > 1) {
      this.alpha = 1
    }
  }

  subAlpha () {
    this.alpha -= 0.1
    if (this.alpha < 0.5) {
      this.alpha = 0.5
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
      this.texture = px.Texture.fromImage(this.data)
      this.sprite = new px.Sprite(this.texture)
      this.sprite.interactive = true
      this.sprite.cursor = null
      this.sprite.anchor.x = this.sprite.anchor.y = 0.5
      this.texture.on('update', () => {
        this.drawPic()
      })
    } else {
      this.drawPic()
    }
  }

  drawPic () {
    this.sprite.x = this.sprite.y = C.DEFAULT_WORLD_SIZE / 2
    this.sprite.scale.x = this.sprite.scale.y = this.scale
    this.sprite.rotation = this.rotation
    this.sprite.alpha = this.alpha
  }
}
