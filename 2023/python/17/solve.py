import yaml

vectors = [[0, 1], [1, 0], [0, -1], [-1, 0]]

def solve(data):
  minimum = data['minimum']
  maximum = data['maximum']
  heatmap = []
  distance = []
  for s in data['heatmap'].splitlines():
    heatmap.append([int(c) for c in s])
    distance.append([[None] * len(vectors) for _ in range(len(s))])
  width = len(heatmap[0])
  height = len(heatmap)
  distance[0][0] = [None, None, 0, 0]
  queue = [[0, 0, 2], [0, 0, 3]]
  while len(queue) > 0:
    queue.sort(key=lambda e: distance[e[1]][e[0]][e[2]])
    x, y, i = queue.pop(0)
    d = distance[y][x][i]
    for j in range(len(vectors)):
      if i % 2 == j % 2:
        continue
      [dx, dy] = vectors[j]
      nx = x
      ny = y
      nd = d
      for k in range(1, maximum + 1):
        nx += dx
        ny += dy
        if nx < 0 or nx >= width or ny < 0 or ny >= height:
          break
        nd += heatmap[ny][nx]
        if k < minimum:
          continue
        if distance[ny][nx][j] is None or distance[ny][nx][j] > nd:
          distance[ny][nx][j] = nd
          if [nx, ny, j] not in queue:
            queue.append([nx, ny, j])
  return min([d for d in distance[height - 1][width - 1] if d is not None])

if __name__ == '__main__':
  # read the data.yml file from the directory relative to this file
  with open(__file__.replace('solve.py', 'data.yml')) as f:
    data = yaml.safe_load(f)
  # print the solution
  print(solve(data['puzzle']['input']))
