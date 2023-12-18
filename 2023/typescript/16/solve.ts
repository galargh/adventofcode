import * as YAML from "npm:yaml@2.3.4"
import * as fs from "https://deno.land/std@0.109.0/node/fs.ts"

type Input = string

type Result = {
  topleft: number
  maximum: number
}

export function solve(input: Input): Result {
  const grid = input.split("\n").map((row) => row.split("")).filter((row) => row.length > 0)
  const vectors = [
    [0, -1],
    [1, 0],
    [0, 1],
    [-1, 0],
  ]
  const starts = []
  for (let y = 0; y < grid.length; y++) {
    starts.push([0, y, 1])
    starts.push([grid[0].length - 1, y, 3])
  }
  for (let x = 0; x < grid[0].length; x++) {
    starts.push([x, 0, 2])
    starts.push([x, grid.length - 1, 0])
  }
  const results = starts.map(start => {
    const visited: boolean[][][] = []
    for (let y = 0; y < grid.length; y++) {
      visited.push([])
      for (let x = 0; x < grid[y].length; x++) {
        visited[y].push([])
        for (let v = 0; v < vectors.length; v++) {
          visited[y][x].push(false)
        }
      }
    }
    const queue = [start]
    visited[start[1]][start[0]][start[2]] = true
    while (queue.length > 0) {
      const [x, y, v] = queue.shift()!
      const sign = grid[y][x]
      const d = []
      if (sign == "." || (sign == "-" && v % 2 == 1) || (sign == "|" && v % 2 == 0)) {
        d.push(v)
      }
      if (sign == "-" && v % 2 == 0) {
        d.push(1)
        d.push(3)
      }
      if (sign == "|" && v % 2 == 1) {
        d.push(0)
        d.push(2)
      }
      if (sign == "/") {
        d.push([1, 0, 3, 2][v])
      }
      if (sign == "\\") {
        d.push([3, 2, 1, 0][v])
      }
      for (let i = 0; i < d.length; i++) {
        const v = d[i]
        const [dx, dy] = vectors[v]
        const [nx, ny] = [x + dx, y + dy]
        if (nx >= 0 && nx < grid[y].length && ny >= 0 && ny < grid.length && !visited[ny][nx][v]) {
          visited[ny][nx][v] = true
          queue.push([nx, ny, v])
        }
      }
    }
    let result = 0
    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[y].length; x++) {
        if (visited[y][x].some(v => v)) {
          result++
        }
      }
    }
    return result
  })
  return {
    topleft: results[0],
    maximum: Math.max(...results),
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
