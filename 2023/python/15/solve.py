import yaml

def hash(s):
  result = 0
  for c in s:
    result += ord(c)
    result *= 17
    result %= 256
  return result


class Box:
  def __init__(self):
    self.labels = []
    self.values = {}

  def set(self, label, value):
    if label not in self.labels:
      self.labels.append(label)
    self.values[label] = int(value)

  def unset(self, label):
    if label in self.labels:
      self.labels.remove(label)
      del self.values[label]

  def power(self):
    result = 0
    for i in range(len(self.labels)):
      result += (i + 1) * self.values[self.labels[i]]
    return result

def solve(data):
  control = 0
  boxes = [Box() for _ in range(256)]
  for s in data:
    control += hash(s)
    sign = '=' if '=' in s else '-'
    label, value = s.split(sign)
    i = hash(label)
    if sign == '=':
      boxes[i].set(label, value)
    else:
      boxes[i].unset(label)
  power = 0
  for i in range(len(boxes)):
    power += (i + 1) * boxes[i].power()
  return {
    'control': control,
    'power': power
  }

if __name__ == '__main__':
  # read the data.yml file from the directory relative to this file
  with open(__file__.replace('solve.py', 'data.yml')) as f:
    data = yaml.safe_load(f)
  # print the solution
  print(solve(data['puzzle']['input']))
