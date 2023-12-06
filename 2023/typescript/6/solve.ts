import * as YAML from "npm:yaml@2.3.4"
import * as fs from "https://deno.land/std@0.109.0/node/fs.ts"

type Input = {
  time: number[]
  distance: number[]
}

type Result = {
  mini: number
  mega: number
}

function getNumberOfWinningStrategies(time: number, distance: number) {
  let left = 0
  let right = time
  while (left * (time - left) <= distance && left <= right) {
    left++
  }
  while (right * (time - right) <= distance && left <= right) {
    right--
  }
  return right - left + 1
}

export function solve(input: Input): Result {
  let mini = 1
  for (let i = 0; i < input.time.length; i++) {
    const time = input.time[i]
    const distance = input.distance[i]
    mini *= getNumberOfWinningStrategies(time, distance)
  }
  const mega = getNumberOfWinningStrategies(
    parseInt(input.time.map(a => String(a)).reduce((a, b) => a + b)),
    parseInt(input.distance.map(a => String(a)).reduce((a, b) => a + b))
  )
  return {
    mini,
    mega
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
