import * as YAML from "npm:yaml@2.3.4"
import * as fs from "https://deno.land/std@0.109.0/node/fs.ts"

type Input = string

type Result = {
  dec: number
  hex: number
}

type Instruction = {
  direction: string
  distance: number
}

function area(instructions: Instruction[]): number {
  let result = 0
  let border = 0
  for (let i = 0, height = 0; i < instructions.length; i++) {
    const {direction, distance} = instructions[i]
    const {direction: nextDirection} = instructions[(i + 1) % instructions.length]
    switch (direction) {
      case 'R':
        result -= distance * height
        if (nextDirection === 'D') {
          border += distance * 2 + 1
        } else if (nextDirection === 'U') {
          border += distance * 2 - 1
        }
        break
      case 'L':
        result += distance * height
        if (nextDirection === 'D') {
          border += distance * 2 - 1
        } else if (nextDirection === 'U') {
          border += distance * 2 + 1
        }
        break
      case 'U':
        height -= distance
        if (nextDirection === 'R') {
          border += distance * 2 + 1
        } else if (nextDirection === 'L') {
          border += distance * 2 - 1
        }
        break
      case 'D':
        height += distance
        if (nextDirection === 'R') {
          border += distance * 2 - 1
        } else if (nextDirection === 'L') {
          border += distance * 2 + 1
        }
        break
    }
  }
  return result + border / 4
}

export function solve(input: Input): Result {
  const lines = input.split("\n")
    .filter(line => line.length > 0)
    .map(line => line.split(" "))
  const dec = lines.map(([direction, distance]) => ({direction, distance: parseInt(distance)}))
  const hex = lines.map(([_direction, _distance, colour]) => {
    const direction = ['R', 'D', 'L', 'U'][parseInt(colour[colour.length - 2])]
    const distance = colour.slice(2, colour.length - 2)
    return {direction, distance: parseInt(distance, 16)}
  })
  return {
    dec: area(dec),
    hex: area(hex)
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
