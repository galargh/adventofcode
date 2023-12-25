import yaml
import random


def get_random_cut(nodes, edges):
  nodes = nodes.copy()
  edges = edges.copy()

  representatives = {}
  sizes = {}

  for node in nodes:
    representatives[node] = node
    sizes[node] = 1

  def find(node):
    if representatives[node] == node:
      return node
    else:
      return find(representatives[node])

  def union(node1, node2):
    node1 = find(node1)
    node2 = find(node2)
    if node1 == node2:
      return False
    if sizes[node1] > sizes[node2]:
      representatives[node2] = node1
      sizes[node1] += sizes[node2]
    else:
      representatives[node1] = node2
      sizes[node2] += sizes[node1]
    return True

  disjoint_sets = len(nodes)
  while disjoint_sets > 2:
    edge = random.choice(list(edges))
    edges.remove(edge)
    merged = union(edge[0], edge[1])
    if merged:
      disjoint_sets -= 1

  representative = find(list(nodes)[0])
  return [node for node in nodes if find(node) == representative]

def solve(data):
  nodes = set([])
  edges = set([])
  for node, neighbours in data['graph'].items():
    nodes.add(node)
    for neighbour in neighbours:
      nodes.add(neighbour)
      edges.add((node, neighbour))

  i = 0
  while True:
    cut = get_random_cut(nodes, edges)
    remaining_edges = []
    for edge in edges:
      if edge[0] in cut and edge[1] in cut:
        continue
      if edge[0] not in cut and edge[1] not in cut:
        continue
      remaining_edges.append(edge)
    if len(remaining_edges) <= 3:
      return len(cut) * (len(nodes) - len(cut))

if __name__ == '__main__':
  # read the data.yml file from the directory relative to this file
  with open(__file__.replace('solve.py', 'data.yml')) as f:
    data = yaml.safe_load(f)
  # print the solution
  print(solve(data['puzzle']['input']))
