import * as YAML from "npm:yaml@2.3.4"
import * as fs from "https://deno.land/std@0.109.0/node/fs.ts"

type Input = string

type Result = {
  safe: number
  unsafe: number
}

class Cube {
  constructor(public x: number, public y: number, public z: number) {}

  copy(): Cube {
    return new Cube(this.x, this.y, this.z)
  }
}

class Brick {
  above: Brick[] = []
  below: Brick[] = []
  foundation: Brick[] = []

  constructor(public start: Cube, public end: Cube) {}

  over(other: Brick): boolean {
    const x = this.start.x <= other.end.x && this.end.x >= other.start.x
    const y = this.start.y <= other.end.y && this.end.y >= other.start.y
    const z = this.start.z > other.end.z
    return x && y && z
  }

  onTopOf(other: Brick): boolean {
    return this.start.z === other.end.z + 1 && this.over(other)
  }

  addAbove(other: Brick) {
    this.above.push(other)
  }

  addBelow(other: Brick) {
    this.below.push(other)
  }

  addFoundation(other: Brick) {
    this.foundation.push(other)
  }

  canBeDisintegrated(): boolean {
    return this.above.length === 0 || this.above.every(brick => brick.below.length > 1)
  }

  copy(): Brick {
    return new Brick(this.start.copy(), this.end.copy())
  }
}

function normalize(bricks: Brick[]): Brick[] {
  const result = bricks.map(brick => brick.copy())
  for (let i = 0; i < result.length; i++) {
    const brick = result[i]
    let z = -1
    for (let j = 0; j < i; j++) {
      const other = result[j]
      if (brick.over(other)) {
        z = Math.max(z, other.end.z)
      }
    }
    brick.end.z = brick.end.z - (brick.start.z - z - 1)
    brick.start.z = z + 1
  }
  return result
}

export function solve(input: Input): Result {
  let bricks = input.split('\n').filter(line => line.length > 0).map(line => {
    const [start, end] = line.split('~')
    const [startX, startY, startZ] = start.split(',').map(n => parseInt(n))
    const [endX, endY, endZ] = end.split(',').map(n => parseInt(n))
    return new Brick(new Cube(startX, startY, startZ), new Cube(endX, endY, endZ))
  })
  bricks.sort((a, b) => a.start.z - b.start.z)
  bricks = normalize(bricks)
  for (let i = 0; i < bricks.length; i++) {
    const brick = bricks[i]
    for (let j = 0; j < bricks.length; j++) {
      const other = bricks[j]
      if (brick.onTopOf(other)) {
        other.addAbove(brick)
        brick.addBelow(other)
      }
    }
  }
  const safe = bricks.filter(brick => brick.canBeDisintegrated()).length
  let unsafe = 0
  for (let i = 0; i < bricks.length; i++) {
    const removed = [...bricks.slice(0, i), ...bricks.slice(i + 1)]
    const normalized = normalize(removed)
    for (let j = 0; j < normalized.length; j++) {
      if (removed[j].start.z !== normalized[j].start.z) {
        unsafe += 1
      }
    }
  }

  return {safe, unsafe}
}

// Learn more at https://deno.land/manual/examples/module_metadata#concepts
if (import.meta.main) {
  const path = new URL("data.yml", import.meta.url).pathname
  const data = fs.readFileSync(path).toString()
  const input = YAML.parse(data).puzzle.input
  const result = solve(input)
  console.log(result)
}
