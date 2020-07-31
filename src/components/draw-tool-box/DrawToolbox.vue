<template>
  <div class='draw-wrapper'>
    <div class='draw-header' @click="isOpened = !isOpened">
      <div class='left' :class="{selected: isOpened}">
        <i :class="{'el-icon-caret-bottom': isOpened, 'el-icon-caret-right': !isOpened}"></i>
        <span class='title'>{{ title }}</span>
      </div>
    </div>
    <div class='items-wrapper' v-show="isOpened">
      <slot name="box-items"></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DrawToolbox',
  props: {
    open: {
      type: Boolean,
      default: false
    },
    title: String
  },
  data () {
    return {
      isOpened: this.open
    }
  }
}
</script>

<style lang="scss" scoped>
  $border-bottom: 1px solid #eee;
  .draw-wrapper {
    width: 240px;
    border-bottom: $border-bottom;
    &:last-child {
      border: none;
    }
    .draw-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 46px;
      cursor: pointer;
      .left {
        $default-color: #949494;
        $selected-color: #978dfe;
        display: flex;
        color: $default-color;
        &.selected {
          color: $selected-color;
        }
        .title {
          display: block;
          margin-left: 6px;
          height: 20px;
          line-height: 20px;
          font-size: 15px;
          font-weight: lighter;
        }
      }
    }
    .items-wrapper {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      flex-wrap: wrap;
      margin: 0 auto;
      width: 240px;
    }
  }
</style>
