<template>
  <div id="app">
    <house-editor />
  </div>
</template>

<script>
import HouseEditor from './components/house-editor'

export default {
  name: 'App',
  components: {
    HouseEditor
  }
}
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
