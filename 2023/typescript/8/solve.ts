import * as YAML from "npm:yaml@2.3.4"
import * as fs from "https://deno.land/std@0.109.0/node/fs.ts"

type Input = {
  instructions: string
  map: Record<string, string[]>
}

type Result = number

export function solve(input: Input): Result {
  const nodes = Object.keys(input.map).filter(node => node.endsWith('A')) // === 'AAA'
  const steps = nodes.map(node => {
    let step = 0
    while (!node.endsWith('Z')) { // === 'ZZZ'
      switch (input.instructions[step % input.instructions.length]) {
        case 'L':
          node = input.map[node][0]
          break
        case 'R':
          node = input.map[node][1]
          break
      }
      step += 1
    }
    return step
  })
  // get lowest common multiple of steps
  let result = steps[0]
  for (let i = 1; i < steps.length; i++) {
    result = lcm(result, steps[i])
  }
  return result
}

// implement lcm function
function lcm(a: number, b: number) {
  return a * b / gcd(a, b)
}

// implement gcd function
function gcd(a: number, b: number) {
  if (b === 0) {
    return a
  }
  return gcd(b, a % b)
}

// Learn more at https://deno.land/manual/examples/module_metadata#concepts
if (import.meta.main) {
  const path = new URL("data.yml", import.meta.url).pathname
  const data = fs.readFileSync(path).toString()
  const input = YAML.parse(data).puzzle.input
  const result = solve(input)
  console.log(result)
}
