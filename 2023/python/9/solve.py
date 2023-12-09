import yaml

def solve(data):
  nextResult = 0
  prevResult = 0
  for history in data:
    multipliers = [1]
    nextNumber = history[-1]
    prevNumber = history[0]
    while len(multipliers) < len(history):
      multipliers = [1, *[multipliers[i - 1] + multipliers[i] for i in range(1, len(multipliers))], 1]
      nextPartials = [history[-1 - i] * multipliers[i] * (1 if i % 2 == 0 else -1) for i in range(0, len(multipliers))]
      prevPartials = [history[i] * multipliers[i] * (1 if i % 2 == 0 else -1) for i in range(0, len(multipliers))]
      nextNumber += sum(nextPartials)
      prevNumber += sum(prevPartials)
    nextResult += nextNumber
    prevResult += prevNumber
  return {
    'next': nextResult,
    'prev': prevResult
  }

if __name__ == '__main__':
  # read the data.yml file from the directory relative to this file
  with open(__file__.replace('solve.py', 'data.yml')) as f:
    data = yaml.safe_load(f)
  # print the solution
  print(solve(data['puzzle']['input']))
