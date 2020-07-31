<template>
  <div class="edit-panel" v-if="selectedItem">
    <div class="edit-header">
      <span class="title">{{ title }}</span>
      <div class="close-wrapper" @click="close">
        <i class="el-icon-close"></i>
      </div>
    </div>
    <div class="main">
      <div class="content">
        <!--类型-->
        <div class="switch-btn-wrapper" v-if="availableKinds.length > 0">
          <span class="switch-btn" v-for="item in availableKinds" :key="item.key"
                :class="{'active': kind === item.key}" @click="kind = item.key">
            {{ item.name }}
          </span>
        </div>
        <!--长度-->
        <edit-item v-model="length" v-if="lengthAvailable" :name="lengthName"
                   :min="minLength" :max="maxLength" :configurable="lengthConfigurable"></edit-item>
        <!--墙厚-->
        <edit-item v-model="thickness" v-if="selectedType === 'wall'" name="墙厚"
                   :min="100" :max="400"></edit-item>
        <!--高度-->
        <edit-item v-model="height" v-if="heightAvailable" :name="heightName"
                   :min="minHeight" :max="maxHeight"></edit-item>
        <!--窗台高度-->
        <edit-item v-model="sillHeight" v-if="selectedType === 'window'" name="窗台高度"
                   :min="0" :max="house.height - height"></edit-item>
        <!--飘窗深度-->
        <edit-item v-model="bayDepth" v-if="bayDepthAvailable" name="飘窗深度"
                   :min="0" :max="2000"></edit-item>
        <!--x长度-->
        <edit-item v-model="xSize" v-if="selectedType === 'cubic-column'" name="长度"
                   :min="100" :max="2000"></edit-item>
        <!--y宽度-->
        <edit-item v-model="ySize" v-if="selectedType === 'cubic-column'" name="宽度"
                   :min="100" :max="2000"></edit-item>
      </div>
    </div>
  </div>
</template>

<script>
import { RoomType, WallType, DoorType, WindowType, CubicColumnType } from '../model/kinds'
import C from '../constants'
import _ from 'lodash'
import EditPanelNumberItem from './EditPanelNumberItem'

export default {
  name: 'EditPanel',
  props: {
    selected: {
      type: Object
    },
    house: {
      type: Object
    }
  },
  components: {
    'edit-item': EditPanelNumberItem
  },
  data () {
    return {
      RoomType, WallType, DoorType, WindowType, CubicColumnType
    }
  },
  computed: {
    selectedItem () {
      return this.selected.item
    },
    selectedType () {
      return this.selected.type
    },
    title () {
      switch (this.selectedType) {
        case 'wall':
          return '墙'
        case 'door':
          return '门'
        case 'window':
          return '窗'
        case 'cubic-column':
          return CubicColumnType.getName(this.kind)
        case 'room':
          return '房间'
        default:
          return '属性设置'
      }
    },
    availableKinds () {
      switch (this.selectedType) {
        case 'wall':
          return WallType.kinds
        case 'door':
          return DoorType.kinds
        case 'window':
          return WindowType.kinds
        case 'cubic-column':
          // 结构部件不允许修改类型
          return []
        case 'room':
          return [{ key: null, name: '未设置' }].concat(RoomType.kinds)
        default:
          return []
      }
    },
    kind: {
      get () {
        return this.selectedItem && this.selectedItem.kind
      },
      set (newVal) {
        const item = this.selectedItem
        if (!item) {
          return
        }
        item.kind = newVal
        this.updateSprite()
      }
    },
    walls () {
      return this.house.walls
    },
    doors () {
      return this.house.doors
    },
    windows () {
      return this.house.windows
    },
    remainPaddings () {
      return this.house.getVectorRemainPaddings(this.selectedItem)
    },
    length: {
      get () {
        return this.selectedItem && this.selectedItem.length()
      },
      set (newLength) {
        if (!this.selectedItem) {
          return
        }
        if (newLength < this.minLength) {
          this.length = this.minLength
          return
        } else if (newLength > this.maxLength) {
          this.length = this.maxLength
          return
        }
        const diff = (newLength - this.length)
        const remainPaddings = this.remainPaddings
        const p1Padding = Math.min(diff / 2, remainPaddings.p1)
        const p2Padding = diff - p1Padding
        const v = this.selectedItem.stretch({ p1Padding, p2Padding })
        Object.assign(this.selectedItem, { p1: v.p1, p2: v.p2 })
        this.updateSprite()
      }
    },
    minLength () {
      if (this.selectedType === 'wall') {
        return 100
      }
      return C.VECTOR_MINIMUM_LENGTH
    },
    maxLength () {
      if (this.selectedType === 'wall') {
        return 50000
      }
      const remainPaddings = this.remainPaddings
      return this.length + remainPaddings.p1 + remainPaddings.p2
    },
    lengthAvailable () {
      return _.includes(['wall', 'door', 'window'], this.selectedType)
    },
    lengthName () {
      return '长度'
    },
    lengthConfigurable () {
      return _.includes(['door', 'window'], this.selectedType)
    },
    thickness: {
      get () {
        return this.selectedItem && this.selectedItem.thickness
      },
      set (newVal) {
        const item = this.selectedItem
        if (!item) {
          return
        }
        item.thickness = newVal
        this.updateSprite()
        if (this.selectedType === 'wall') {
          for (const wd of this.windows.concat(this.doors)) {
            if (wd.wall === item) {
              this.updateSprite(wd)
            }
          }
        }
      }
    },
    height: {
      get () {
        if (this.selectedType === 'wall') {
          return this.house.height
        } else {
          return this.selectedItem && this.selectedItem.height
        }
      },
      set (newVal) {
        if (this.selectedType === 'wall') {
          this.house.height = newVal
        } else {
          this.selectedItem.height = newVal
        }
      }
    },
    minHeight () {
      switch (this.selectedType) {
        case 'wall':
          return 2000
        case 'door':
        case 'window':
          return 100
        default:
          return 100
      }
    },
    maxHeight () {
      switch (this.selectedType) {
        case 'wall':
          return 4000
        case 'door':
        case 'window':
          return this.house.height - this.sillHeight
        default:
          return this.house.height
      }
    },
    heightAvailable () {
      return _.includes(['wall', 'door', 'window'], this.selectedType)
    },
    heightName () {
      switch (this.selectedType) {
        case 'wall':
          return '墙高'
        case 'door':
          return '门高'
        case 'window':
          return '窗高'
        default:
          return '高度'
      }
    },
    sillHeight: {
      get () {
        return this.selectedItem && this.selectedItem.sillHeight
      },
      set (newVal) {
        this.selectedItem.sillHeight = newVal
      }
    },
    bayDepth: {
      get () {
        return this.selectedItem && this.selectedItem.bayDepth
      },
      set (newVal) {
        this.selectedItem.bayDepth = newVal
        this.selectedItem.dirty = true
        this.selectedItem.updateSprite()
      }
    },
    bayDepthAvailable () {
      return this.selectedItem && _.includes(['COMMON', 'BAY_ONLY'], this.kind)
    },
    xSize: {
      get () {
        return this.selectedItem && this.selectedItem.xSize
      },
      set (newValue) {
        this.selectedItem.dirty = true
        this.selectedItem.xSize = newValue
        this.selectedItem.updateSprite()
      }
    },
    ySize: {
      get () {
        return this.selectedItem && this.selectedItem.ySize
      },
      set (newValue) {
        this.selectedItem.dirty = true
        this.selectedItem.ySize = newValue
        this.selectedItem.updateSprite()
      }
    },
    zSize: {
      get () {
        return (this.selectedItem && this.selectedItem.zSize) || 0
      },
      set (newValue) {
        this.selectedItem.dirty = true
        this.selectedItem.zSize = newValue
        this.selectedItem.updateSprite()
      }
    }
  },
  methods: {
    updateSprite (item = null) {
      if (item == null) {
        item = this.selectedItem
      }
      item.dirty = true
      item.updateSprite(this.house.scale)
    },
    close () {
      this.$emit('panel-close')
    }
  }
}
</script>

<style lang="scss" scoped>
  * {
    box-sizing: border-box;
  }

  .edit-panel {
    $size-top: 48px;
    $size-left: 266px;
    position: absolute;
    top: $size-top;
    bottom: 0;
    left: 0;
    width: $size-left;
    background-color: #fff;
    z-index: 20;
    .edit-header {
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 34px;
      padding: 0 0 0 10px;
      border-bottom: 1px solid #eee;
      .title {
        font-size: 15px;
        color: #949494;
      }
      .close-wrapper {
        position: absolute;
        right: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 50px;
        height: 50px;
        cursor: pointer;
        i {
          font-size: 16px;
          font-weight: bold;
          color: #949494;
        }
      }
    }

    .main {
      width: 100%;
      padding: 10px 12px;
      .main-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 15px;
        width: 100%;
        height: 50px;

        .left {
          display: flex;
          justify-content: space-between;
          align-items: center;

          .icon {
            display: block;
            width: 6px;
            height: 20px;
            background-color: #3d82f7;

            &.icon-bg-color {
              background-color: #666
            }
          }

          .title {
            margin-left: 5px;
          }
        }

        .right {
          cursor: pointer;
        }
      }

      .switch-btn-wrapper {
        align-items: center;
        width: 100%;
        .switch-btn {
          display: inline-block;
          margin-right: 5px;
          width: 74px;
          height: 38px;
          line-height: 38px;
          font-size: 14px;
          border-radius: 2px;
          text-align: center;
          border: 1px solid #eee;
          color: #949494;

          &:hover {
            color: #978dfe;
            border: 1px solid #978dfe;
          }

          &.active {
            color: #fff;
            background-color: #978dfe;
          }
          &:last-child {
            margin-right: 0;
          }
        }
      }
    }
  }
</style>
