import yaml

def getNeighbours(maze, x, y):
  neighbours = {
    '<': [(x-1, y)],
    '>': [(x+1, y)],
    '^': [(x, y-1)],
    'v': [(x, y+1)],
    '.': [(x-1, y), (x+1, y), (x, y-1), (x, y+1)],
    '#': []
  }[maze[y][x]]
  return [(x, y) for x, y in neighbours if y >= 0 and y < len(maze) and x >= 0 and x < len(maze[y]) and maze[y][x] != '#']

def getNodes(maze):
  nodes = []
  for y in range(len(maze)):
    for x in range(len(maze[y])):
      if maze[y][x] != '#':
        if len(getNeighbours(maze, x, y)) > 2 or y == 0 or y == len(maze) - 1:
          nodes.append((x, y))
  return nodes

def getEdges(maze, nodes):
  edges = {}
  for start in nodes:
    queue = [(start, 0)]
    visited = set([start])
    while len(queue) > 0:
      node, distance = queue.pop(0)
      if node != start and node in nodes:
        if start not in edges.keys():
          edges[start] = []
        edges[start].append((node, distance))
        continue
      for neighbour in getNeighbours(maze, *node):
        if neighbour in visited:
          continue
        visited.add(neighbour)
        queue.append((neighbour, distance + 1))
  return edges

def getLongestPath(node, edges, end, path):
  if node == end:
    return path
  neighbours = edges[node] if node in edges.keys() else []
  new_edges = edges.copy()
  new_edges[node] = []
  return max([getLongestPath(neighbour, new_edges, end, path + distance) for neighbour, distance in neighbours], default=0)

def solve(data):
  slippery = []
  dry = []

  for s in data['maze'].splitlines():
    slippery.append([c for c in s])
    dry.append(['#' if c == '#' else '.' for c in s])

  slipperyNodes = getNodes(slippery)
  slipperyEdges = getEdges(slippery, slipperyNodes)
  dryNodes = getNodes(dry)
  dryEdges = getEdges(dry, dryNodes)

  return {
    'slippery': getLongestPath(slipperyNodes[0], slipperyEdges, slipperyNodes[-1], 0),
    'dry': getLongestPath(dryNodes[0], dryEdges, dryNodes[-1], 0)
  }

if __name__ == '__main__':
  # read the data.yml file from the directory relative to this file
  with open(__file__.replace('solve.py', 'data.yml')) as f:
    data = yaml.safe_load(f)
  # print the solution
  print(solve(data['puzzle']['input']))
