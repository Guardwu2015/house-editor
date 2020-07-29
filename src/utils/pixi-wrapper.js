import 'pixi.js'
import Viewport from 'pixi-viewport'

const px = global.PIXI

px.utils.skipHello()

export default {
  Application: px.Application,
  Text: px.Text,
  Graphics: px.Graphics,
  Container: px.Container,
  ParticleContainer: px.particles.ParticleContainer,
  loader: px.loader,
  Texture: px.Texture,
  Sprite: px.Sprite,

  // 插件
  Viewport
}
