import yaml

class Object:
  def __init__(self, x, y, length):
    self.x = x
    self.y = y
    self.length = length

  def isAdjacent(self, other):
    return set(range(self.x - 1, self.x + self.length + 1)) & set(range(other.x, other.x + other.length)) and self.y in range(other.y - 1, other.y + 2)

class Part(Object):
  def __init__(self, x, y, number):
    super().__init__(x, y, len(number))
    self.number = number

  def toInt(self):
    return int(self.number)

class Symbol(Object):
  def __init__(self, x, y, symbol):
    super().__init__(x, y, 1)
    self.symbol = symbol

  def isGear(self):
    return self.symbol == '*'

def solve(data):
  # split data into lines
  lines = data.splitlines()
  # initialize the parts and symbols
  parts = []
  symbols = []
  # iterate over all the lines
  for i in range(len(lines)):
    line = lines[i]
    number = None
    # iterate over the line
    for j in range(len(line)):
      # check if the character is a digit
      if line[j].isdigit():
        if number is None:
          number = line[j]
        else:
          number += line[j]
          if j == len(line) - 1:
            parts.append(Part(j - len(number) + 1, i, number))
            number = None
      else:
        if number is not None:
          parts.append(Part(j - len(number), i, number))
          number = None
        # check if the character is a symbol
        if line[j] != '.':
          # initialize the symbol
          symbols.append(Symbol(j, i, line[j]))
  # initialize the result
  sumOfNumbers = 0
  # iterate over all the parts
  for part in parts:
    # iterate over all the symbols
    for symbol in symbols:
      # check if part and symbol are adjacent
      if part.isAdjacent(symbol):
        sumOfNumbers += part.toInt()
        break
  # initialize the result
  sumOfProducts = 0
  # iterate over all the symbols
  for symbol in symbols:
    # check if symbol is a gear
    if symbol.isGear():
      # find all the parts that are adjacent to the gear
      adjacentParts = [part for part in parts if part.isAdjacent(symbol)]
      # check if there are two adjacent parts
      if len(adjacentParts) == 2:
        # calculate the product of the two parts
        product = adjacentParts[0].toInt() * adjacentParts[1].toInt()
        # add the product to the result
        sumOfProducts += product
  # return the result
  return {
    'numbers': sumOfNumbers,
    'products': sumOfProducts
  }

if __name__ == '__main__':
  # read the data.yml file from the directory relative to this file
  with open(__file__.replace('test.py', 'data.yml')) as f:
    data = yaml.safe_load(f)
    data = yaml.safe_load(f)
  # print the solution
  print(solve(data['puzzle']['input']))
