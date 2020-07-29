import px from './pixi-wrapper'

export default class SpritePool {
  constructor (spriteConstructor = px.Sprite) {
    this.SpriteConstructor = spriteConstructor
    this.sprites = []
  }

  acquire () {
    if (this.sprites.length > 0) {
      return this.sprites.pop()
    }
    return new this.SpriteConstructor()
  }

  revoke (sprite) {
    if (sprite != null) {
      this.sprites.push(sprite)
    }
  }
}
