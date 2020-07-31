<template>
  <div class="wrapper" id="rd" v-show="show">
      <img id='rotate' class='rotate' src="../assets/icon_rotate.png" alt="rotate icon" v-show='sr' @click="rotateClicked">
      <img id='delete' class='delete' src="../assets/icon_delete.png" :class="{'marginLeft': sr}" alt="delete icon" @click='deleteClicked'>
  </div>
</template>

<script>
export default {
  name: 'imgButton',
  props: {
    rdShow: Boolean,
    showRotate: Boolean
  },
  data () {
    return {
    }
  },
  computed: {
    sr () {
      return this.showRotate
    },
    show () {
      console.log('this.rdShow', this.rdShow)
      return this.rdShow
    }
  },
  methods: {
    deleteClicked () {
      this.$emit('deleteClick')
    },
    rotateClicked () {
      this.$emit('rotateClick')
    }
  }
}
</script>

<style lang="scss" scoped>
  * {
    box-sizing: border-box;
    .wrapper {
        display: flex;
        justify-content: center;
        align-items: center;
        position: fiexd;
        top: 0;
        left: 0;
        width: 98px;
        height: 38px;
        border-radius: 2px;
        background-color: #434343;
        z-index: 1000;
        .rotate,
        .delete {
            width: 26px;
            height: 26px;
            cursor: pointer;
        }
        .marginLeft {
            margin-left: 16px;
        }
    }
  }
</style>
