<template>
    <div id="ca_wrapper" class='wrapper' v-show="show">
        <h1>墙体透明度</h1>
        <div class='input-wrapper'>
            <span class='num'>0</span>
            <input id="ca" type="range" min="0.01" max="100" ref='input' v-model.number='alpha1'>
            <span class="num">100</span>
        </div>
    </div>
</template>

<script>
export default {
  name: 'changeWallAlpha',
  props: {
    caShow: Boolean,
    wallAlpha: Number
  },
  data () {
    return {

    }
  },
  computed: {
    show () {
      return this.caShow
    },
    alpha1: {
      get () {
        return this.wallAlpha * 100 || 80
      },
      set (newVal) {
        this.$emit('changeWallsAlpha', newVal / 100)
      }
    }
  },
  methods: {
    changeAlpha () {
    }
  },
  created () {
  }
}
</script>

<style lang="scss" scoped>
   .wrapper {
       $font-size: 14px;
       $font-weight: normal;
       $color: #949494;
       display: flex;
       flex-direction: column;
       align-items: center;
       position: absolute;
       left: calc(50% - 50px);
       top: 105px;
       width: 256px;
       height: 56px;
       z-index: 1000;
       background: #fff;

       h1 {
           margin: 6px 0 0;
           font-size: $font-size;
           font-weight: $font-weight;
           color: $color;
       }
       .input-wrapper {
           display: flex;
           justify-content: space-between;
           align-items: center;
           margin-top: 8px;
           span.num {
               display: block;
               font-size: $font-size;
               font-weight: $font-weight;
               color: $color;
           }

           input {
                display: block;
                width: 140px;
                height: 2px;
                margin: 0 14px;
                background-color: #d2d2d2;
                outline: none;
                -webkit-appearance: none;
                &::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    background-color: #ffc200;
                    cursor: pointer;
                }
            }
       }
    }
</style>
