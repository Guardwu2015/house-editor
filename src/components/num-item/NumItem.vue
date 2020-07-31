<template>
    <div class='wrapper'>
        <div class='container'>
            <div class='sub-wrapper' v-show="this.value > this.min" @click="subClick">
                <i class="el-icon-caret-left"></i>
            </div>
            <input max="max" min="min" class="value" v-model="num" ref="height">
            <div class='sub-wrapper' v-show="this.value < this.max" @click="addClick">
                <i class="el-icon-caret-right"></i>
            </div>
        </div>
    </div>
</template>

<script>
// import C from '../constants'
export default {
  name: 'numItem',
  props: {
    value: Number,
    min: Number,
    max: Number
  },
  data () {
    return {
    }
  },
  computed: {
    num: {
      get () {
        return this.value
      },
      set (newVal) {
        this.value = newVal
      }
    }
  },
  methods: {
    subClick () {
      this.$emit('sub')
    },
    addClick () {
      this.$emit('add')
    }
  },
  mounted () {
  }
}
</script>

<style lang="scss" scoped>
    * {
        box-sizing: border-box;
    }
    .wrapper {
        .container {
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 80px;
            border: 1px solid olive;
            .add-wrapper,
            .sub-wrapper {
                display: none;
                cursor: pointer;
            }
            .sub-wrapper {

            }
            &:hover {
                .add-wrapper,
                .sub-wrapper {
                    display: block;
                    cursor: pointer;
                }
            }
            input {
                width: 40px;
                outline: none;
            }
        }
    }
</style>
