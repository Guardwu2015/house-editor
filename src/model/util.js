import C from '../constants'

function approximately (a, b, epsilon = C.EPSILON) {
  if (b instanceof Array) {
    for (const inst of b) {
      if (Math.abs(a - inst) < epsilon) {
        return true
      }
    }
    return false
  }
  return Math.abs(a - b) < epsilon
}

function pointApproximately (p1, p2, epsilon = C.EPSILON) {
  return Math.abs(p1.x - p2.x) < epsilon && Math.abs(p1.y - p2.y) < epsilon
}

export default {
  mod (x, y) {
    return x - (Math.floor(x / y) * y)
  },
  round (n, d = 1) {
    return Math.round(n / d) * d
  },
  approximately,
  pointApproximately,
  pointDist (p1, p2) {
    const dx = p1.x - p2.x
    const dy = p1.y - p2.y
    return Math.sqrt(dx * dx + dy * dy)
  },
  inRange (x, start, end, allowEqualStart = true, allowEqualEnd = true) {
    if (start > end) {
      [start, end] = [end, start]
    }
    if (allowEqualStart) {
      start -= C.EPSILON
    }
    if (allowEqualEnd) {
      end += C.EPSILON
    }
    return x > start && x < end
  },
  angleToRadian (a) {
    return Math.PI * a / 180
  },
  isPointsClockwise (pts) {
    let v = 0
    const ptsCount = pts.length
    for (let i = 0; i < ptsCount; i++) {
      const p1 = pts[i]
      const p2 = pts[(i + 1) % ptsCount]
      v += (p2.x - p1.x) * (p2.y + p1.y)
    }
    // 在图像坐标系中，包围面积为负数才是顺时针的
    return v < 0
  },
  simplifyWalls (walls) {
    console.log('Before simplify:', walls.length)
    let flag = true
    while (flag) {
      flag = false
      const newWalls = []
      for (const w1 of walls) {
        const v1 = {
          x: w1.p2.x - w1.p1.x,
          y: w1.p2.y - w1.p1.y
        }
        if (approximately(v1.x * v1.x + v1.y * v1.y, 0)) {
          continue
        }
        let toPush = true
        for (const w2 of newWalls) {
          if (approximately(w1.thickness, w2.thickness, C.EPSILON)) {
            const pas = [
              pointApproximately(w1.p1, w2.p1), pointApproximately(w1.p2, w2.p2),
              pointApproximately(w1.p1, w2.p2), pointApproximately(w1.p2, w2.p1)
            ]
            if (pas[0] || pas[1] || pas[2] || pas[3]) {
              const v2 = {
                x: w2.p2.x - w2.p1.x,
                y: w2.p2.y - w2.p1.y
              }
              const cosValue = (v1.x * v2.x + v1.y * v2.y) / Math.sqrt((v1.x * v1.x + v1.y * v1.y) * (v2.x * v2.x + v2.y * v2.y))
              if (approximately(cosValue, 1) && (pas[2] || pas[3])) {
                toPush = false
                if (pas[2]) {
                  w2.p2 = w1.p2
                } else {
                  w2.p1 = w1.p1
                }
                break
              } else if (approximately(cosValue, -1) && (pas[0] || pas[1])) {
                toPush = false
                if (pas[0]) {
                  w2.p1 = w1.p2
                } else {
                  w2.p2 = w1.p1
                }
                break
              }
            }
          }
        }
        if (toPush) {
          newWalls.push(w1)
        } else {
          flag = true
        }
      }
      walls = newWalls
      console.log('After simplify:', walls.length)
    }
    return walls
  }
}
