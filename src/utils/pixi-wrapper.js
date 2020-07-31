import * as PIXI from 'pixi.js'
import { Viewport } from 'pixi-viewport'

PIXI.utils.skipHello()

export default {
  Application: PIXI.Application,
  Text: PIXI.Text,
  Graphics: PIXI.Graphics,
  Container: PIXI.Container,
  ParticleContainer: PIXI.ParticleContainer,
  loader: PIXI.Loader,
  Texture: PIXI.Texture,
  Sprite: PIXI.Sprite,

  // 插件
  Viewport
}
