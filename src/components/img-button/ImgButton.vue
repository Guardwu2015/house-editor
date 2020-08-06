<template>
  <div class="img-btn-wrapper">
    <div class='img-wrapper' :class="{active: selected}">
      <div :class="imageClass" @click='btnClick'></div>
    </div>
    <span>{{text}}</span>
  </div>
</template>

<script>
export default {
  name: 'imgButton',
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    value: {
      type: String
    },
    setValue: {
      type: String
    },
    className: {
      type: String
    },
    text: {
      type: String
    }
  },
  computed: {
    selected () {
      return this.value === this.setValue
    },
    imageClass () {
      return `${this.className} ${this.selected ? 'active' : ''}`
    }
  },
  methods: {
    btnClick (e) {
      this.$emit('change', this.setValue)
    }
  }
}
</script>

<style lang="scss" scoped>
  * {
    box-sizing: border-box;
  }
  .img-btn-wrapper {
    display: flex;
    justify-content: space-between;
    flex-direction: column;
    align-items: center;
    width: 74px;
    height: 100px;
    margin-bottom: 12px;
    text-align: center;
    margin-left: 3px;
    margin-right: 3px;
    cursor: pointer;
    .img-wrapper {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 74px;
        height: 74px;
        border: 1px solid #eee;
        box-sizing: border-box;
        &:hover {
            border: 2px solid #978dfe;
        }
        &.active {
            border: 2px solid #978dfe;
        }
        div {
            width: 66px;
            height: 66px;
        }
        .wall {
            background: url('~@/assets/0icon_HuaQiang0.png');
            background-size: cover;
            &.active {
                background: url('~@/assets/0icon_HuaQiang2.png');
                background-size: cover;
            }
        }
        .room {
            background: url('~@/assets/0icon_HuaFangJian0.png');
            background-size: cover;
            &.active {
                background: url('~@/assets/0icon_HuaFangJian2.png');
                background-size: cover;
            }
        }
        .single {
            background: url('~@/assets/0icon_DanKaiMen0.png');
            background-size: cover;
            &.active {
                background: url('~@/assets/0icon_DanKaiMen2.png');
                background-size: cover;
            }
        }
        .double {
            background: url('~@/assets/0icon_ShuangKaiMen0.png');
            background-size: cover;
            &.active {
                background: url('~@/assets/0icon_ShuangKaiMen2.png');
                background-size: cover;
            }
        }
        .sliding {
            background: url('~@/assets/0icon_YiMen0.png');
            background-size: cover;
            &.active {
                background: url('~@/assets/0icon_YiMen2.png');
                background-size: cover;
            }
        }
        .opening {
            background: url('~@/assets/0icon_MenDong0.png');
            background-size: cover;
            &.active {
                background: url('~@/assets/0icon_MenDong2.png');
                background-size: cover;
            }
        }
        .window {
            background: url('~@/assets/0icon_PingKaiChuang0.png');
            background-size: cover;
            &.active {
                background: url('~@/assets/0icon_PingKaiChuang2.png');
                background-size: cover;
            }
        }
        .french {
            background: url('~@/assets/0icon_LuoDiChuang0.png');
            background-size: cover;
            &.active {
                background: url('~@/assets/0icon_LuoDiChuang2.png');
                background-size: cover;
            }
        }
        .railing {
            background: url('~@/assets/0icon_LanGan0.png');
            background-size: cover;
            &.active {
                background: url('~@/assets/0icon_LanGan2.png');
                background-size: cover;
            }
        }
        .pillar {
            background: url('~@/assets/0icon_ZhuZi0.png');
            background-size: cover;
            &.active {
                background: url('~@/assets/0icon_ZhuZi2.png');
                background-size: cover;
                }
        }
        .water-point {
            background: url('~@/assets/0icon_ShuiDianWei0.png');
            background-size: cover;
            &.active {
                background: url('~@/assets/0icon_ShuiDianWei2.png');
                background-size: cover;
            }
        }
        .flue {
            background: url('~@/assets/0icon_YanDao0.png');
            background-size: cover;
            &.active {
                background: url('~@/assets/0icon_YanDao2.png');
                background-size: cover;
            }
        }
    }
    span {
      display: block;
      margin-top: 6px;
      font-size: 10px;
      font-weight: lighter;
      color: #b2b2b2;
    }
  }
</style>
