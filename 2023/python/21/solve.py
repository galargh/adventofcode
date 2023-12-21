import yaml
import json

def countReachablePlots(garden, steps):
    # Find starting point marked with 'S'
  start = None
  for y in range(len(garden)):
    for x in range(len(garden[y])):
      if garden[y][x][0] == 'S':
        start = [x, y]
        break
    if start is not None:
      break

  distance = {}

  queue = [[*start]]
  distance[json.dumps(start)] = 0
  while len(queue) > 0:
    x, y = queue.pop(0)
    d = distance[json.dumps([x, y])]
    if d >= steps:
      continue
    for x, y in [[x-1, y], [x+1, y], [x, y-1], [x, y+1]]:
      key = json.dumps([x, y])
      dx = x
      dy = y
      while dy < 0:
        dy += len(garden)
      dy %= len(garden)
      while dx < 0:
        dx += len(garden[dy])
      dx %= len(garden[dy])
      if garden[dy][dx] == '#':
        continue
      if key in distance and distance[key] <= d + 1:
        continue
      distance[key] = d + 1
      queue.append([x, y])

  result = 0
  for key, value in distance.items():
    if value % 2 == steps % 2:
      result += 1

  return result

def solve(data):
  garden = []
  for s in data['garden'].splitlines():
    garden.append([c for c in s])

  steps = data['steps']

  width = len(garden[0])
  remainder = steps % width
  x, y, z = [countReachablePlots(garden, remainder), countReachablePlots(garden, remainder + width), countReachablePlots(garden, remainder + 2 * width)]
  a, b, c = [(x - 2*y + z) // 2, (-3*x + 4*y - z) // 2, x]
  n = steps // width
  result = a * n * n + b * n + c

  return result

if __name__ == '__main__':
  # read the data.yml file from the directory relative to this file
  with open(__file__.replace('solve.py', 'data.yml')) as f:
    data = yaml.safe_load(f)
  # print the solution
  print(solve(data['puzzle']['input']))
