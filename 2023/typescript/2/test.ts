import * as YAML from "npm:yaml@2.3.4"
import * as fs from "https://deno.land/std@0.109.0/node/fs.ts"
import { assertEquals } from "https://deno.land/std@0.208.0/assert/mod.ts"
import { solve } from "./solve.ts"

Deno.test(function solveTest() {
  const data = fs.readFileSync("data.yml").toString()
  const tests = YAML.parse(data).tests
  tests.forEach((test: any) => {
    const input = test.input
    const output = test.output
    const result = solve(input)
    assertEquals(result, output)
  })
})
