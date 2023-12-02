import * as YAML from "npm:yaml@2.3.4"
import * as fs from "https://deno.land/std@0.109.0/node/fs.ts"

class Round {
  red: number
  green: number
  blue: number

  constructor(red: number | undefined, green: number | undefined, blue: number | undefined) {
    this.red = red || 0
    this.green = green || 0
    this.blue = blue || 0
  }

  isPossible(red: number, green: number, blue: number): boolean {
    return this.red <= red && this.green <= green && this.blue <= blue
  }
}

class Game {
  id: string
  rounds: Round[]

  constructor(id: string, rounds: Round[]) {
    this.id = id
    this.rounds = rounds
  }

  isPossible(red: number, green: number, blue: number): boolean {
    return !this.rounds.some((round) => {
      return !round.isPossible(red, green, blue)
    })
  }

  getNumber(): number {
    return parseInt(this.id.replace("Game ", ""))
  }

  getPower(): number {
    const [red, green, blue] = this.rounds.reduce(([red, green, blue], round) => {
      return [Math.max(red, round.red), Math.max(green, round.green), Math.max(blue, round.blue)]
    }, [0, 0, 0])
    return red * green * blue
  }
}

type Result = {
  sum: number
  power: number
}

export function solve(input: string): Result {
  const games = input.split("\n")
    .filter((line) => line !== "")
    .map((line) => {
      const [id, roundsInput] = line.split(":")
      const rounds = roundsInput.split(";").map((cubesInput) => {
        const round = Object.fromEntries(cubesInput.split(",").map((cubeInput) => {
          const [count, color] = cubeInput.trim().split(" ")
          return [color, parseInt(count)]
        }))
        return new Round(round["red"], round["green"], round["blue"])
      })
      return new Game(id, rounds)
    })

  const sum = games.reduce((acc, game) => {
    const possible = game.isPossible(12, 13, 14)
    return possible ? acc + game.getNumber() : acc
  }, 0)

  const power = games.reduce((acc, game) => {
    return acc + game.getPower()
  }, 0)

  return {sum, power}
}

// Learn more at https://deno.land/manual/examples/module_metadata#concepts
if (import.meta.main) {
  const data = fs.readFileSync("data.yml").toString()
  const input = YAML.parse(data).puzzle.input
  const result = solve(input)
  console.log(result)
}
