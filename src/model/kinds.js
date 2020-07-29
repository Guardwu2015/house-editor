export default class KindFactory {
  constructor (kinds) {
    this.kinds = kinds
  }

  get kinds () {
    return this._kinds
  }

  set kinds (val) {
    this._kinds = val
    this._names = {}
    for (const inst of this._kinds) {
      this._names[inst.key] = inst.name
    }
  }

  getName (key) {
    return this._names[key]
  }
}

export const RoomType = new KindFactory([
  {
    key: 'LIVING_ROOM',
    name: '起居室'
  },
  {
    key: 'KITCHEN',
    name: '厨房'
  },
  {
    key: 'BATHROOM',
    name: '卫生间'
  },
  // { key: 'BEDROOM_MASTER', name: '主卧' },
  {
    key: 'BEDROOM',
    name: '卧室'
  },
  // { key: 'CHILD_ROOM', name: '儿童房' },
  // { key: 'ELDER_ROOM', name: '老人房' },
  // { key: 'STUDY', name: '书房' },
  {
    key: 'BALCONY',
    name: '阳台'
  },
  {
    key: 'KITCHEN_BALCONY',
    name: '生活阳台'
  },
  {
    key: 'STOREROOM',
    name: '储藏间'
  }
  // { key: 'CLOAKROOM', name: '衣帽间' },
  // { key: 'OTHER', name: '其他' }
  // { key: 'UNDETERMINED', name: '未命名' }
])

export const WallType = new KindFactory([
  {
    key: 'NON_BEARING',
    name: '普通墙'
  },
  {
    key: 'BEARING',
    name: '承重墙'
  },
  {
    key: 'SOFT',
    name: '矮墙'
  }
])

export const DoorType = new KindFactory([
  {
    key: 'SINGLE',
    name: '单开门'
  },
  {
    key: 'EQUAL_DOUBLE',
    name: '双开门'
  },
  {
    key: 'SLIDING',
    name: '推拉门'
  },
  {
    key: 'OPENING',
    name: '门洞'
  }
])

export const WindowType = new KindFactory([
  {
    key: 'COMMON',
    name: '普通窗'
  },
  {
    key: 'FRENCH',
    name: '落地窗'
  },
  {
    key: 'RAILING',
    name: '栏杆'
  }
])

export const CubicColumnType = new KindFactory([
  {
    key: 'PILLAR',
    name: '柱子'
  },
  {
    key: 'FLUE',
    name: '烟道'
  },
  {
    key: 'WATER',
    name: '水电位'
  }
])
