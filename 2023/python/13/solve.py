import yaml

def getPalindromes(s):
  text = '^{}$'.format(s)
  center = 1
  radius = 0
  radii = [0] * len(text)
  while center < len(text) - 1:
    while text[center - 1 - radius] == text[center + radius]:
      radius += 1
    radii[center] = radius
    diff = 1
    while diff <= radius and radii[center - diff] != radius - diff:
      radii[center + diff] = min(radii[center - diff], radius - diff)
      diff += 1
    radius = max(radius - diff, 0)
    center += diff
  return radii[1:-1]

def solve(data):
  result = 0
  for pattern in data['mirrors']:
    rows = pattern.splitlines()
    columns = [''.join([row[i] for row in rows]) for i in range(0, len(rows[0]))]
    for i in range(1, len(columns)):
      left = ''
      right = ''
      radius = min(len(columns) - i, i)
      for j in range(0, radius):
        left += columns[i - j -1]
        right += columns[i + j]
      diff = sum([1 if left[i] != right[i] else 0 for i in range(0, len(left))])
      if diff == data['diff']:
        result += i
    for i in range(1, len(rows)):
      top = ''
      bottom = ''
      radius = min(len(rows) - i, i)
      for j in range(0, radius):
        top += rows[i - j -1]
        bottom += rows[i + j]
      diff = sum([1 if top[i] != bottom[i] else 0 for i in range(0, len(top))])
      if diff == data['diff']:
        result += i * 100
  return result

if __name__ == '__main__':
  # read the data.yml file from the directory relative to this file
  with open(__file__.replace('solve.py', 'data.yml')) as f:
    data = yaml.safe_load(f)
  # print the solution
  print(solve(data['puzzle']['input']))
