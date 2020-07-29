export default {
  DEFAULT_WIDTH: 800,
  DEFAULT_ASPECT_RATIO: 16.0 / 9,
  DEFAULT_WORLD_SIZE: 100000,
  DEFAULT_SCALE: 0.05,
  SCALE_MIN_WIDTH: 10000,
  SCALE_MAX_WIDTH: 80000,
  SHOW_THRESHOLD: 43000,

  EPSILON: 1e-5,
  MM_EPSILON: 1,

  WORLD_BG_COLOR: 0xf2f2f2,
  WORLD_BG_ALPHA: 0.8,

  AXIS_COLOR: 0xe2e2e2,
  AXIS_COLOR_BLACK: 0xc2c2c2,
  AXIS_THICKNESS: 1,
  AXIS_ALPHA: 0.8,
  AXIS_STEP: 500,

  ALIGNMENT_COLOR: 0x00ff00,
  ALIGNMENT_SCREEN_THRESHOLD: 10,
  ALIGNMENT_POINT_RADIUS: 5,
  ALIGNMENT_LINE_THICKNESS: 1,
  ALIGNMENT_ALPHA: 1,

  MARKING_COLOR: 0x000000,
  MARKING_ALPHA: 0.7,
  MARKING_TEXT_STYLE: {
    fontFamily: 'Arial',
    fontWeight: 'normal',
    fill: 0x000000,
    align: 'center'
  },
  MARKING_FONT_SIZE: 14,
  MARKING_HEIGHT: 3,
  MARKING_LINE_THICKNESS: 1,

  ROOM_LABEL_FONT_SIZE: 20,
  ROOM_LABEL_TEXT_STYLE: {
    fontFamily: 'Arial',
    fontWeight: 'normal',
    fill: 0x000000,
    align: 'center'
  },

  ROOM_COLOR_SELECTED: 0xffd34a,
  ROOM_COLOR_HOVERING: 0xffd34a,
  ROOM_COLOR_DEFAULT: 0xffffff,

  WALL_COLOR_HOVERING: 0xffd34a,
  WALL_COLOR_WARNING: 0xee2200,
  WALL_COLOR_SELECTED: 0xffd34a,
  DOOR_COLOR_HOVERING: 0xffd34a,
  DOOR_COLOR_SELECTED: 0xffd34a,
  WIN_COLOR_HOVERING: 0xffd34a,
  WIN_COLOR_SELECTED: 0xffd34a,
  CUBIC_COLOR_HOVERING: 0xffd34a,
  CUBIC_COLOR_SELECTED: 0xffd34a,

  WALL_COLOR__NON_BEARING: 0xacacac,
  WALL_COLOR__BEARING: 0x3c3c3c,
  WALL_COLOR__SOFT: 0xececec,
  WALL_COLOR__DRAWING: 0x978dfe,
  WALL_LINE_COLOR: 0x000000,
  WALL_LINE_ALPHA: 1,

  VECTOR_MINIMUM_LENGTH: 300,
  CUBIC_MINIMUM_SIZE: 300,

  DOOR_THICKNESS_DEFAULT: 200,
  DOOR_COLOR_NORMAL: 0x4f4f4f,
  DOOR_COLOR_ALPHA: 0.8,
  // 门扇圆弧
  DOOR_ARC_WIDTH: 1,
  DOOR_ARC_COLOR: 0x4f4f4f,
  DOOR_ARC_ALPHA: 1,
  // 门扇本体
  DOOR_LINE_COLOR: 0x000000,
  DOOR_LINE_WIDTH: 2,
  DOOR_LINE_ALPHA: 1,
  // 门占据的墙
  DOOR_RECT_COLOR: 0xffffff,
  DOOR_RECT_ALPHA: 0.9,
  DOOR_BG_COLOR: 0xffffff,

  // 窗
  WIN_THICKNESS_DEFAULT: 200,
  WINDOW_COLOR: 0xcccccc,
  WINDOW_ALPHA: 0.8,
  WINDOW_BG_COLOR: 0xffffff,
  WINDOW_BG_ALPHA: 1,
  WINDOW_BAY_COLOR: 0x666666,
  WINDOW_LINE_COLOR: 0x000000,
  WINDOW_LINE_WIDTH: 2,
  WINDOW_LINE_ALPHA: 1,

  // 结构部件
  CUBIC_BG_PILLAR: 0x333333,
  CUBIC_BG_FLUE: 0xffffff,
  CUBIC_BG_FLUE_INNER: 0xffffff,
  CUBIC_BG_WATER: 0xffffff,
  CUBIC_BG_ALPHA: 1,
  CUBIC_THICKNESS_FLUE: 50,
  CUBIC_LINE_WIDTH: 1,
  CUBIC_LINE_COLOR: 0x000000,
  CUBIC_LINE_ALPHA: 1
}
