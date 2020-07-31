module.exports = {
  plugins: {
    autoprefixer: {},
    'postcss-px-to-viewport': {
      viewportWidth: 750,
      unitPrecision: '3',
      viewportUnit: 'vw',
      selectorBlackList: [
        '.ignore-px-to-vw'
      ],
      minPixelValue: 1,
      mediaQuery: false
    }
  }
}
