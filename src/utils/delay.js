const __delayTable = {}

export function delay (name, func, timeout = 10) {
  if (__delayTable[name]) {
    return
  }
  __delayTable[name] = () => {
    setTimeout(() => {
      __delayTable[name] = null
      func()
    }, timeout)
  }
  __delayTable[name]()
}
