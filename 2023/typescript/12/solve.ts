import * as YAML from "npm:yaml@2.3.4"
import * as fs from "https://deno.land/std@0.109.0/node/fs.ts"

type Records = {
  damaged: string,
  grouped: number[]
}

type Input = Records[]

type Result = number

export function solve(input: Input): Result {
  let result = 0
  for (const {damaged, grouped} of input) {
    const jumps: number[][] = []
    for (let i = 0; i < damaged.length; i++) {
      jumps.push([])
    }
    for (let i = damaged.length - 1, length = 0; i >= 0; i--) {
      switch(damaged[i]) {
        case '.':
          jumps[i].push(0)
          break
        case '?':
          jumps[i].push(0)
          if (i + 1 === damaged.length) {
            jumps[i].push(1)
          } else {
            for (const jump of jumps[i + 1]) {
              jumps[i].push(jump + 1)
            }
          }
          break
        case '#':
          length += 1
          if (i === 0 || damaged[i - 1] !== '#') {
            if (i + length === damaged.length) {
              jumps[i].push(length)
            } else {
              for (const jump of jumps[i + length]) {
                jumps[i].push(jump + length)
              }
            }
            length = 0
          }
          break
      }
    }
    const arrangements: Record<string, number>[] = []
    for (let i = 0; i < damaged.length; i++) {
      arrangements.push({})
    }
    arrangements[0][0] = 1
    arrangements.push({})
    for (let i = 0; i < damaged.length; i++) {
      for (const [key, value] of Object.entries(arrangements[i])) {
        const numKey = parseInt(key)
        const expected = grouped[numKey]
        if (jumps[i].includes(expected)) {
          const j = Math.min(i + expected + 1, damaged.length)
          arrangements[j][numKey + 1] = (arrangements[j][numKey + 1] || 0) + value
        }
        if (jumps[i].includes(0)) {
          arrangements[i + 1][numKey] = (arrangements[i + 1][numKey] || 0) + value
        }
      }
    }
    result += arrangements[damaged.length][grouped.length] || 0
  }
  return result
}

// Learn more at https://deno.land/manual/examples/module_metadata#concepts
if (import.meta.main) {
  const path = new URL("data.yml", import.meta.url).pathname
  const data = fs.readFileSync(path).toString()
  const input = YAML.parse(data).puzzle.input
  const result = solve(input)
  console.log(result)
}
