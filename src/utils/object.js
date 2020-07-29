// 对象操作：克隆、相等比较、序列化
// 特殊特性：都将过滤属性名以$$开头的字段

import map from 'lodash/map'
import isArrayLike from 'lodash/isArrayLike'
import isPlainObject from 'lodash/isPlainObject'
import { hasOwnProperty } from './util'

// 克隆，移除$$
export function clone (object, ignoreUndefined = false, ignoreNull = false) {
  // primary
  if (!object || typeof object !== 'object') return object
  // array-like
  if (isArrayLike(object)) {
    let r = map(object, item => clone(item, ignoreUndefined, ignoreNull))
    if (ignoreUndefined) r = r.filter(data => data !== undefined)
    if (ignoreNull) r = r.filter(data => data !== null)
    return r
  }
  if (!isPlainObject(object)) return object
  // object
  const res = {}
  Object.keys(object).forEach(key => {
    if (key.indexOf('$$') !== 0 && !(ignoreUndefined && object[key] === undefined) &&
      !(ignoreNull && object[key] === null)) {
      res[key] = clone(object[key], ignoreUndefined, ignoreNull)
    }
  })
  return res
}

// 相等比较
export function equals (a, b) {
  if (a === b) return true
  if (!a || !b || typeof a !== 'object') return false
  if (isArrayLike(a)) {
    if (a.length !== b.length) return false
    for (let i = 0; i < a.length; i++) {
      if (!equals(a[i], b[i])) return false
    }
    return true
  }
  if (!isPlainObject(a) || !isPlainObject(b)) return false
  for (const key of Object.keys(a)) {
    if (key.indexOf('$$') !== 0 && (!hasOwnProperty(b, key) || !equals(a[key], b[key]))) return false
  }
  for (const key of Object.keys(b)) {
    if (key.indexOf('$$') !== 0 && !hasOwnProperty(a, key)) return false
  }
  return true
}

// 序列化为JSON
export const toJSON = (object, space) => {
  return JSON.stringify(object, (key, value) => {
    if (key.indexOf('$$') !== 0) return value
  }, space)
}
