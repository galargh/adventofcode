import yaml

vectors = [[0, 1], [1, 0], [0, -1], [-1, 0]]

class Rule:
  def __init__(self, s):
    if ':' in s:
      [condition, result] = s.split(':')
      self.result = result
      if '>' in condition:
        self.sign = '>'
        [self.key, self.value] = condition.split('>')
      elif '<' in condition:
        self.sign = '<'
        [self.key, self.value] = condition.split('<')
    else:
      self.result = s
      self.sign = None
      self.key = None
      self.value = None

  def evaluate(self, part):
    if self.sign == '>':
      return self.result if part.get(self.key) > int(self.value) else None
    elif self.sign == '<':
      return self.result if part.get(self.key) < int(self.value) else None
    else:
      return self.result

  def split(self, range_part):
    if self.sign == '>':
      [left, right] = range_part.split(self.key, int(self.value))
      if right is not None:
        return [[self.result, right], left]
      else:
        return [None, left]
    elif self.sign == '<':
      [left, right] = range_part.split(self.key, int(self.value) - 1)
      if left is not None:
        return [[self.result, left], right]
      else:
        return [None, right]
    else:
      return [[self.result, range_part], None]

class Workflow:
  def __init__(self, s):
    self.name = s[:s.index('{')]
    self.rules = [Rule(r) for r in s[s.index('{') + 1:s.index('}')].split(',')]

  def evaluate(self, part):
    for rule in self.rules:
      result = rule.evaluate(part)
      if result is not None:
        return result
    raise Exception('No rule matches')

  def split(self, range_part):
    result = []
    right = range_part
    rule_index = 0
    while right is not None:
      [left, right] = self.rules[rule_index].split(right)
      if left is not None:
        result.append(left)
      rule_index += 1
    return result

class Part:
  def __init__(self, s):
    self.properties = {}
    for p in s[s.index('{') + 1:s.index('}')].split(','):
      [key, value] = p.split('=')
      self.properties[key] = int(value)

  def get(self, key):
    return self.properties[key]

  def sum(self):
    return sum(self.properties.values())

class RangePart:
  def __init__(self, minimum, maximum):
    self.properties = {
      'x': [minimum, maximum],
      'm': [minimum, maximum],
      'a': [minimum, maximum],
      's': [minimum, maximum],
    }

  def copy(self):
    result = RangePart(0, 0)
    for key in self.properties:
      result.properties[key] = self.properties[key].copy()
    return result

  def split(self, key, value):
    [left, right] = [self.copy(), self.copy()]
    left.properties[key][1] = value
    right.properties[key][0] = value + 1
    if left.properties[key][0] > left.properties[key][1]:
      left = None
    if right.properties[key][0] > right.properties[key][1]:
      right = None
    return [left, right]

  def product(self):
    result = 1
    for key in self.properties:
      [minimum, maximum] = self.properties[key]
      result *= maximum - minimum + 1
    return result

def solve(data):
  workflows = [Workflow(w) for w in data['workflows'].splitlines()]
  parts = [Part(p) for p in data['parts'].splitlines()]

  workflow_dict = {}
  for workflow in workflows:
    workflow_dict[workflow.name] = workflow

  result_parts = 0
  for part in parts:
    workflow = 'in'
    while workflow not in ['R', 'A']:
      workflow = workflow_dict[workflow].evaluate(part)
    if workflow == 'A':
      result_parts += part.sum()

  accepted_parts = []
  rejected_parts = []
  range_parts = [['in', RangePart(1, 4000)]]
  while len(range_parts) > 0:
    workflow, range_part = range_parts.pop(0)
    if workflow == 'R':
      rejected_parts.append(range_part)
      continue
    if workflow == 'A':
      accepted_parts.append(range_part)
      continue
    workflow = workflow_dict[workflow]
    range_parts.extend(workflow.split(range_part))

  result_range = 0
  for range_part in accepted_parts:
    result_range += range_part.product()

  return {
    'parts': result_parts,
    'range': result_range,
  }

if __name__ == '__main__':
  # read the data.yml file from the directory relative to this file
  with open(__file__.replace('solve.py', 'data.yml')) as f:
    data = yaml.safe_load(f)
  # print the solution
  print(solve(data['puzzle']['input']))
