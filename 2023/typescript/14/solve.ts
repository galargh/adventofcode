import * as YAML from "npm:yaml@2.3.4"
import * as fs from "https://deno.land/std@0.109.0/node/fs.ts"

type Input = {
  cycles: number
  dish: string
}

type Result = number

function spin(rows: string[][]): string[][] {
  const columns: string[][] = []
  for (let i = 0; i < rows[0].length; i++) {
    columns.push([])
  }
  for (const row of rows) {
    for (let i = 0; i < row.length; i++) {
      columns[i].push(row[i])
    }
  }
  return columns.map(column => column.toReversed())
}

function tilt(rows: string[][]): string[][] {
  for (let j = 0; j < rows[0].length; j++) {
    let position = 0
    for (let i = 0; i < rows.length; i++) {
      switch (rows[i][j]) {
        case "#":
          position = i + 1
          break
        case "O":
          rows[i][j] = "."
          rows[position][j] = "O"
          position += 1
          break
      }
    }
  }
  return rows
}

function calculateLoad(rows: string[][]): number {
  let result = 0
  for (let j = 0; j < rows[0].length; j++) {
    for (let i = 0; i < rows.length; i++) {
      if (rows[i][j] === "O") {
        result += rows.length - i
      }
    }
  }
  return result
}

function cycle(rows: string[][]): string[][] {
  rows = tilt(rows)
  rows = spin(rows)
  rows = tilt(rows)
  rows = spin(rows)
  rows = tilt(rows)
  rows = spin(rows)
  rows = tilt(rows)
  rows = spin(rows)
  return rows
}

export function solve(input: Input): Result {
  let rows = input.dish.split("\n").map((row) => row.split("")).filter((row) => row.length > 0)
  const history: string[] = []
  history.push(JSON.stringify(tilt(rows)))
  for (let i = 0; i < input.cycles; i++) {
    rows = cycle(rows)
    const serialized = JSON.stringify(rows)
    const index = history.indexOf(serialized)
    if (index >= 0) {
      const cycleLength = history.length - index
      const cycleIndex = (input.cycles - index) % cycleLength
      history.push(history[index + cycleIndex])
      break
    }
    history.push(serialized)
  }
  rows = JSON.parse(history[history.length - 1])
  return calculateLoad(rows)
}

// Learn more at https://deno.land/manual/examples/module_metadata#concepts
if (import.meta.main) {
  const path = new URL("data.yml", import.meta.url).pathname
  const data = fs.readFileSync(path).toString()
  const input = YAML.parse(data).puzzle.input
  const result = solve(input)
  console.log(result)
}
