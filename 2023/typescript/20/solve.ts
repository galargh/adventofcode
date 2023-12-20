import * as YAML from "npm:yaml@2.3.4"
import * as fs from "https://deno.land/std@0.109.0/node/fs.ts"
import { isArray } from "https://deno.land/std@0.109.0/node/util.ts";

enum Pulse {
  High,
  Low
}

abstract class Module {
  name: string
  destinations: Module[] = []
  inputs: Module[] = []

  addDestination(module: Module) {
    this.destinations.push(module)
  }

  addInput(module: Module) {
    this.inputs.push(module)
  }

  constructor(name: string) {
    this.name = name
  }

  toJSON(): object {
    return {
      name: this.name,
      destinations: this.destinations.map(module => module.name)
    }
  }

  abstract process(_pulse: Pulse, _from: Module): Pulse | undefined
}

class NullModule extends Module {
  process(_pulse: Pulse, _from: Module): Pulse | undefined {
    return undefined
  }
}

class BroadcastModule extends Module {
  process(pulse: Pulse, _from: Module): Pulse | undefined {
    return pulse
  }
}

class FlipFlopModule extends Module {
  state: Pulse = Pulse.Low

  process(pulse: Pulse, _from: Module): Pulse | undefined {
    if (pulse === Pulse.High) {
      return undefined
    }
    this.state = this.state === Pulse.High ? Pulse.Low : Pulse.High
    return this.state
  }

  toJSON(): object {
    return {
      ...super.toJSON(),
      state: this.state
    }
  }
}

class ConjunctionModule extends Module {
  history: Record<string, Pulse> = {}

  process(pulse: Pulse, from: Module): Pulse | undefined {
    this.history[from.name] = pulse
    return Object.values(this.history).every(value => value === Pulse.High) ? Pulse.Low : Pulse.High
  }

  toJSON(): object {
    return {
      ...super.toJSON(),
      history: this.history
    }
  }

  addInput(module: Module): void {
    super.addInput(module)
    this.history[module.name] = Pulse.Low
  }
}

type Input = {
  stop: string | string[],
  modules: Record<string, {type: string, destination: string[]}>
}

type Result = number

function lcm(a: number, b: number): number {
  return a * b / gcd(a, b)
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b)
}

export function solve(input: Input): Result {
  const stop = input['stop']
  // Create a dictionary of modules by their name
  const modules = Object.entries(input['modules']).reduce<Record<string, Module>>((modules, [name, {type}]) => {
    switch (type) {
      case 'broadcast':
        modules[name] = new BroadcastModule(name)
        break
      case 'flip-flop':
        modules[name] = new FlipFlopModule(name)
        break
      case 'conjunction':
        modules[name] = new ConjunctionModule(name)
        break
    }
    return modules
  }, {})
  // Connect modules (add destinations and inputs)
  Object.entries(input['modules']).forEach(([name, {destination}]) => {
    const module = modules[name]
    destination.forEach((destinationName) => {
      let destinationModule = modules[destinationName]
      if (destinationModule === undefined) {
        destinationModule = new NullModule(destinationName)
        modules[destinationName] = destinationModule
      }
      module.addDestination(destinationModule)
      destinationModule.addInput(module)
    })
  })
  const broadcaster = Object.values(modules).find(module => module.name === 'broadcaster')
  if (broadcaster === undefined) {
    throw new Error('No broadcaster found')
  }
  const historyOfIndices: Record<string, number> = {}
  const historyOfPulses: Record<string, Pulse>[] = []
  let result = 1
  for (let i = 0; Array.isArray(stop) ? stop.length !== 0 : i < parseInt(stop); i++) {
    const key: string = JSON.stringify(modules)
    const value = historyOfIndices[key]
    if (value !== undefined && !Array.isArray(stop)) {
      const pushes = parseInt(stop)
      let high = historyOfPulses.slice(0, value).reduce((sum, pulses) => sum + pulses[Pulse.High], 0)
      let low = historyOfPulses.slice(0, value).reduce((sum, pulses) => sum + pulses[Pulse.Low], 0)
      high += historyOfPulses.slice(value).reduce((sum, pulses) => sum + pulses[Pulse.High], 0) * (pushes - value) / (i - value)
      low += historyOfPulses.slice(value).reduce((sum, pulses) => sum + pulses[Pulse.Low], 0) * (pushes - value) / (i - value)
      high += historyOfPulses.slice(value, value + (pushes - value) % (i - value)).reduce((sum, pulses) => sum + pulses[Pulse.High], 0)
      low += historyOfPulses.slice(value, value + (pushes - value) % (i - value)).reduce((sum, pulses) => sum + pulses[Pulse.Low], 0)
      result = high * low
      break
    }
    const queue: {from: Module, to: Module, pulse: Pulse}[] = [{from: broadcaster, to: broadcaster, pulse: Pulse.Low}]
    const pulses = {
      [Pulse.High]: 0,
      [Pulse.Low]: 0
    }
    while (queue.length > 0) {
      const {from, to, pulse} = queue.shift()!
      pulses[pulse] += 1
      const nextPulse = to.process(pulse, from)
      if (nextPulse === undefined) {
        continue
      }
      if (Array.isArray(stop) && stop.includes(to.name) && nextPulse === Pulse.High) {
        result = lcm(result, i + 1)
        stop.splice(stop.indexOf(to.name), 1)
      }
      const destinations = to.destinations.map(destination => ({from: to, to: destination, pulse: nextPulse}))
      queue.push(...destinations)
    }
    historyOfPulses.push(pulses)
    historyOfIndices[key] = i
  }
  if (result === undefined) {
    if (Array.isArray(stop)) {
      throw new Error('No result found')
    }
    const high = historyOfPulses.reduce((sum, pulses) => sum + pulses[Pulse.High], 0)
    const low = historyOfPulses.reduce((sum, pulses) => sum + pulses[Pulse.Low], 0)
    result = high * low
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
