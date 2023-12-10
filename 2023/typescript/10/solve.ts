import * as YAML from "npm:yaml@2.3.4"
import * as fs from "https://deno.land/std@0.109.0/node/fs.ts"

/*
| is a vertical pipe connecting north and south.
- is a horizontal pipe connecting east and west.
L is a 90-degree bend connecting north and east.
J is a 90-degree bend connecting north and west.
7 is a 90-degree bend connecting south and west.
F is a 90-degree bend connecting south and east.
. is ground; there is no pipe in this tile.
S is the starting position of the animal; there is a pipe on this tile, but your sketch doesn't show what shape the pipe has.
*/

type Vector = [number, number]

enum Direction {
  North,
  East,
  South,
  West
}

const directions: Record<Direction, Vector> = {
  [Direction.North]: [0, -1],
  [Direction.East]: [1, 0],
  [Direction.South]: [0, 1],
  [Direction.West]: [-1, 0]
}

class Cell {
  connections: Direction[]
  from: Cell | undefined

  constructor(public x: number, public y: number, public symbol: string) {
    switch (symbol) {
      case "|":
        this.connections = [Direction.North, Direction.South]
        break
      case "-":
        this.connections = [Direction.East, Direction.West]
        break
      case "L":
        this.connections = [Direction.North, Direction.East]
        break
      case "J":
        this.connections = [Direction.North, Direction.West]
        break
      case "7":
        this.connections = [Direction.South, Direction.West]
        break
      case "F":
        this.connections = [Direction.South, Direction.East]
        break
      case ".":
        this.connections = []
        break
      case "S":
        this.connections = [Direction.North, Direction.East, Direction.South, Direction.West]
        break
      default:
        throw new Error(`Unknown symbol ${symbol}`)
    }
  }

  isConnected(other: Cell): boolean {
    return this.connections.some(direction => {
      const [dx, dy] = directions[direction]
      return this.x + dx === other.x && this.y + dy === other.y
    })
  }

  getNeighbours(grid: Cell[][]): Cell[] {
    return this.connections.filter(direction => {
      const [dx, dy] = directions[direction]
      const [x, y] = [this.x + dx, this.y + dy]
      return ! (x < 0 || x >= grid[0].length || y < 0 || y >= grid.length)
    }).map(direction => {
      const [dx, dy] = directions[direction]
      const [x, y] = [this.x + dx, this.y + dy]
      return grid[y][x]
    }).filter(cell => cell.isConnected(this))
  }

  connect(from: Cell, to: Cell) {
    const [dx, dy] = [to.x - from.x, to.y - from.y]
    if (dx === 0 && Math.abs(dy) === 2) {
      this.symbol = "|"
      this.connections = [Direction.North, Direction.South]
    } else if (Math.abs(dx) === 2 && dy === 0) {
      this.symbol = "-"
      this.connections = [Direction.East, Direction.West]
    } else if (dx === 1 && dy === -1) {
      this.symbol = "L"
      this.connections = [Direction.North, Direction.East]
    } else if (dx === -1 && dy === -1) {
      this.symbol = "J"
      this.connections = [Direction.North, Direction.West]
    } else if (dx === -1 && dy === 1) {
      this.symbol = "7"
      this.connections = [Direction.South, Direction.West]
    } else if (dx === 1 && dy === 1) {
      this.symbol = "F"
      this.connections = [Direction.South, Direction.East]
    } else {
      throw new Error(`Invalid connection from ${from.x},${from.y} to ${to.x},${to.y}`)
    }
  }
}

type Input = string

type Result = {
  distance: number
  enclosed: number
}

export function solve(input: Input): Result {
  // Parse input as a 2D array of characters
  const grid = input.split("\n")
    .map(row => row.split(""))
    .map((row, y) => row.map((symbol, x) => new Cell(x, y, symbol)))
  // Find starting position
  const start: Cell | undefined = grid.flat().find(cell => cell.symbol === "S")
  if (start === undefined) {
    throw new Error("No starting position found")
  }
  start.from = start
  const queue: [Cell] = [start]
  const path: Cell[] = []
  while (queue.length > 0 && path.length === 0) {
    const cell = queue.shift()!
    const neighbours = cell.getNeighbours(grid).filter(neighbour => cell.from !== neighbour)
    neighbours.forEach(neighbour => {
      if (neighbour.from === undefined) {
        neighbour.from = cell
        queue.push(neighbour)
      } else {
        let from = cell
        while (from !== start) {
          path.push(from)
          from = from.from!
        }
        path.reverse()
        from = neighbour
        while (from !== start) {
          path.push(from)
          from = from.from!
        }
        path.push(start)
      }
    })
  }
  start.connect(path[path.length-2], path[0])
  let enclosed = 0
  for (let dy = 0; dy < grid.length; dy++) {
    let dx = 0
    let multiplier = 0
    let diff = 0
    path
      .filter(cell => cell.y === dy)
      .sort((a, b) => a.x - b.x)
      .forEach(cell => {
        if (["|", "7", "F"].includes(cell.symbol)) {
          enclosed += multiplier * (cell.x - dx - 1 - diff)
          dx = cell.x
          multiplier = (multiplier + 1) % 2
          diff = 0
        } else if (cell.symbol !== ".") {
          diff += 1
        }
      })
  }
  return {
    distance: path.length / 2,
    enclosed
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
