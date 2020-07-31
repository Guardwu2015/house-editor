<template>
  <div class="change-item">
    <span class="name">{{ name }}</span>
    <input v-model.number="val" type="range" :min="min" :max="max" v-if="configurable">
    <input type="range" :value="val" :min="min" :max="max" disabled v-else>
    <div class="right">
      <input class="value" type="text" v-model.lazy.number="val" v-if="configurable">
      <input class="value" type="text" :value="Math.floor(val)" disabled v-else>
      <span class="unit">mm</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EditPanelNumberItem',
  model: {
    prop: 'value', event: 'change'
  },
  props: {
    name: { type: String },
    value: { type: Number },
    min: { type: Number },
    max: { type: Number },
    configurable: { type: Boolean, default: true }
  },
  computed: {
    val: {
      get () {
        return this.value
      },
      set (newVal) {
        if (newVal < this.min) {
          newVal = this.min
        } else if (newVal > this.max) {
          newVal = this.max
        }
        this.$emit('change', newVal)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  .change-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 5px 0;

    &:first-child {
      margin-top: 10px;
    }

    .name {
      font-size: 14px;
      color: #949494;
    }

    input {
      display: block;
      width: 122px;
      height: 2px;
      margin-left: 6px;
      background-color: #eee;
      outline: none;
      -webkit-appearance: none;

      &::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background-color: #978dfe;
        cursor: pointer;
      }
    }

    .right {
      display: flex;
      .value, .unit {
        display: block;
        width: 35px;
        line-height: 20px;
        font-size: 12px;
        border-radius: 2px;
        text-align: center;
        color: #949494;
        background-color: #fff;
        border: 1px solid #eee;
      }
      .value {
        height: 20px;
      }
      .unit {
        height: 22px;
        font-size: 13px;
        background-color: #eee;
        border-left: none;
      }
    }
  }
</style>
