import * as YAML from "npm:yaml@2.3.4"
import * as fs from "https://deno.land/std@0.109.0/node/fs.ts"

class Scratchcard {
  id: number
  copies: number
  winning: number[]
  numbers: number[]

  constructor(id: number, winning: number[], numbers: number[]) {
    this.id = id
    this.copies = 1
    this.winning = winning
    this.numbers = numbers
  }

  getNumberOfMatches(): number {
    // get the intersection of the winning numbers and the numbers on the scratchcard
    const intersection = this.winning.filter((number) => this.numbers.includes(number))
    return intersection.length
  }

  getValue(): number {
    const matches = this.getNumberOfMatches()
    if (matches === 0) {
      return 0
    }
    return Math.pow(2, matches - 1)
  }
}

type Result = {
  one: number
  two: number
}

export function solve(input: string): Result {
  const cards = input.split("\n")
    .filter((line) => line.length > 0)
    .map((line) => {
      const [idInput, all] = line.split(":")
      const [winningInput, numbersInput] = all.split("|")
      const id = parseInt(idInput.split(/\s+/g)[1])
      const winning = winningInput.trim().split(/\s+/g).map((number) => parseInt(number))
      const numbers = numbersInput.trim().split(/\s+/g).map((number) => parseInt(number))
      return new Scratchcard(id, winning, numbers)
    })
  const one = cards.reduce((result, card) => {
    return result + card.getValue()
  }, 0)
  const idToCard = Object.fromEntries(cards.map((card: Scratchcard) => [card.id, card]))
  const ids: number[] = Object.keys(idToCard).map((id: string) => parseInt(id))
  ids.sort((a: number, b: number) => a - b)
  ids.forEach((id: number) => {
    const card = idToCard[id]
    for (let i = 0; i < card.getNumberOfMatches(); i++) {
      idToCard[id + i + 1].copies += card.copies
    }
  })
  const two = Object.values(idToCard).reduce((result, card) => {
    return result + card.copies
  }, 0)
  return {
    one,
    two
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
