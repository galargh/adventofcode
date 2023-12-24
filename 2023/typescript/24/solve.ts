import * as YAML from "npm:yaml@2.3.4"
import * as fs from "https://deno.land/std@0.109.0/node/fs.ts"
import * as mathjs from "https://dev.jspm.io/mathjs";


type Input = {
  hailstones: string
  left: number[]
  right: number[]
}

type Result = {
  collisionsIn2D: number,
  sumOfOrigin: number
}

type Time = number

function collideIn2D(o1: Vector, v1: Vector, o2: Vector, v2: Vector): [Vector, Time, Time] | undefined {
  const x = o1.v[0] - o2.v[0]
  const dx1 = v1.v[0]
  const dx2 = v2.v[0]
  const y = o1.v[1] - o2.v[1]
  const dy1 = v1.v[1]
  const dy2 = v2.v[1]
  const t1 = (y * dx2 - x * dy2) / (dx1 * dy2 - dx2 * dy1)
  const t2 = (x * dy1 - y * dx1) / (dx2 * dy1 - dx1 * dy2)
  return [new Vector([o1.v[0] + v1.v[0] * t1, o1.v[1] + v1.v[1] * t1, 0]), t1, t2]
}

class Vector {
  constructor(public v: number[]) {}

  between(left: Vector, right: Vector): boolean {
    if (this.v.length !== left.v.length || this.v.length != right.v.length) {
      throw new Error("Invalid vector dimensions. The number of values in the vectors must match.");
    }
    for (let i = 0; i < this.v.length; i++) {
      if (this.v[i] < left.v[i] || this.v[i] > right.v[i]) {
        return false
      }
    }
    return true
  }

  crossProduct(other: Vector): Vector {
    if (this.v.length !== 3 || this.v.length !== other.v.length) {
      throw new Error("Invalid vector dimensions. The number of values in the vectors must be 3.");
    }
    const x = this.v[1] * other.v[2] - this.v[2] * other.v[1]
    const y = this.v[2] * other.v[0] - this.v[0] * other.v[2]
    const z = this.v[0] * other.v[1] - this.v[1] * other.v[0]
    return new Vector([x, y, z])
  }

  subtract(other: Vector): Vector {
    if (this.v.length !== other.v.length) {
      throw new Error("Invalid vector dimensions. The number of values in the vectors must match.");
    }
    const v = []
    for (let i = 0; i < this.v.length; i++) {
      v.push(this.v[i] - other.v[i])
    }
    return new Vector(v)
  }

  toArray(): number[] {
    return this.v
  }

  toMatrix(): Matrix {
    if (this.v.length !== 3) {
      throw new Error("Invalid vector dimensions. The number of values in the vectors must be 3.");
    }
    return new Matrix([
      [0, -this.v[2], this.v[1]],
      [this.v[2], 0, -this.v[0]],
      [-this.v[1], this.v[0], 0]
    ])
  }
}

class Matrix {
  constructor(public m: number[][]) {}

  multiply(v: Vector): Vector {
    const numRows = this.m.length
    const numCols = this.m[0].length

    if (numCols !== v.v.length) {
      throw new Error("Invalid matrix and vector dimensions. The number of columns in the matrix must match the length of the vector.")
    }

    const result: number[] = []

    for (let i = 0; i < numRows; i++) {
      let sum = 0
      for (let j = 0; j < numCols; j++) {
        sum += this.m[i][j] * v.v[j]
      }
      result.push(sum)
    }

    return new Vector(result)
  }

  subtract(other: Matrix): Matrix {
    if (this.m.length !== other.m.length || this.m[0].length !== other.m[0].length) {
      throw new Error("Invalid matrix dimensions. The number of values in the matrices must match.");
    }
    const m = []
    for (let i = 0; i < this.m.length; i++) {
      const v = []
      for (let j = 0; j < this.m[i].length; j++) {
        v.push(this.m[i][j] - other.m[i][j])
      }
      m.push(v)
    }

    return new Matrix(m)
  }

  toArray(): number[][] {
    return this.m
  }
}

export function solve(input: Input): Result {
  const left = new Vector(input["left"])
  const right = new Vector(input["right"])
  let vectors: [Vector, Vector][] = input["hailstones"].split("\n").filter((line: string) => line.length > 0).map((line) => {
    const [left, right] = line.split(" @ ")
    return [new Vector(left.split(", ").map((value) => parseInt(value))), new Vector(right.split(", ").map((value) => parseInt(value)))]
  })

  let collisionsIn2D = 0
  for (let i = 0; i < vectors.length; i++) {
    const [o1, v1] = vectors[i]
    for (let j = i + 1; j < vectors.length; j++) {
      const [o2, v2] = vectors[j]
      const collision = collideIn2D(o1, v1, o2, v2)
      if (collision === undefined) {
        continue
      }
      const [point, t1, t2] = collision
      if (t1 > 0 && t2 > 0 && point.between(left, right)) {
        collisionsIn2D += 1
      }
    }
  }

  vectors = vectors.slice(2)

  const v = new Vector([
    ...vectors[1][0].crossProduct(vectors[1][1]).subtract(vectors[0][0].crossProduct(vectors[0][1])).toArray(),
    ...vectors[2][0].crossProduct(vectors[2][1]).subtract(vectors[0][0].crossProduct(vectors[0][1])).toArray()
  ])

  const m1 = vectors[0][1].toMatrix().subtract(vectors[1][1].toMatrix()).toArray()
  const m2 = vectors[0][1].toMatrix().subtract(vectors[2][1].toMatrix()).toArray()
  const m3 = vectors[1][0].toMatrix().subtract(vectors[0][0].toMatrix()).toArray()
  const m4 = vectors[2][0].toMatrix().subtract(vectors[0][0].toMatrix()).toArray()

  const m = new Matrix(mathjs.inv([
    [...m1[0], ...m3[0]],
    [...m1[1], ...m3[1]],
    [...m1[2], ...m3[2]],
    [...m2[0], ...m4[0]],
    [...m2[1], ...m4[1]],
    [...m2[2], ...m4[2]],
  ]))

  const sumOfOrigin = Math.round(m.multiply(v).toArray().slice(0, 3).reduce((a, b) => a + b, 0))

  return {
    collisionsIn2D,
    sumOfOrigin
  }
}

// Learn more at https://deno.land/manual/examples/module_metadata#concepts
if (import.meta.main) {
  const path = new URL("data.yml", import.meta.url).pathname
  const data = fs.readFileSync(path).toString()
  const input = YAML.parse(data).puzzle.input
  const result = solve(input)
  console.log(result)
}
