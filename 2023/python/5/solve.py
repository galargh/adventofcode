import yaml

class Range:
  def __init__(self, start, length):
    self.start = start
    self.stop = start + length
    self.length = length

  def intersect(self, other):
    start = max(self.start, other.start)
    stop = min(self.stop, other.stop)
    if start < stop:
      return Range(start, stop - start)
    return None

  def diff(self, other):
    if self.start >= other.stop:
      return [Range(self.start, self.length)]
    if self.stop <= other.start:
      return [Range(self.start, self.length)]
    if self.start >= other.start and self.stop <= other.stop:
      return []
    if self.start <= other.start and self.stop <= other.stop:
      return [Range(self.start, other.start - self.start)]
    if self.start >= other.start and self.stop >= other.stop:
      return [Range(other.stop, self.stop - other.stop)]
    if self.start <= other.start and self.stop >= other.stop:
      return [Range(self.start, other.start - self.start), Range(other.stop, self.stop - other.stop)]
    return []

class Mapping:
  def __init__(self, source, destination, length):
    self.source = Range(source, length)
    self.destination = Range(destination, length)

  def intersect(self, range):
    intersection = self.source.intersect(range)
    if intersection is not None:
      offset = intersection.start - self.source.start
      length = intersection.length
      return Mapping(self.source.start + offset, self.destination.start + offset, length)
    return None

class Map:
  def __init__(self, source, destination, mappings):
    self.source = source
    self.destination = destination
    self.mappings = mappings

  def get(self, ranges):
    result = []
    sources = []
    for mapping in self.mappings:
      for r in ranges:
        intersection = mapping.intersect(r)
        if intersection is not None:
          sources.append(intersection.source)
          result.append(intersection.destination)
    for source in sources:
      newRanges = []
      for r in ranges:
        diff = r.diff(source)
        newRanges.extend(diff)
      ranges = newRanges
    result.extend(ranges)
    return result


def parseMapping(data):
  [destination, source, length] = data.split(' ')
  return Mapping(int(source), int(destination), int(length))

def parseMap(data):
  header, *lines = data.splitlines()
  [source, destination] = header.split(' ')[0].split('-to-')
  mappings = [parseMapping(line) for line in lines]
  return Map(source, destination, mappings)

def parseSeeds(data):
  seeds = data[len('seeds: '):].split(' ')
  return [int(seed) for seed in seeds]

def parse(data):
  # split data on empty lines
  seeds, *maps = data.split('\n\n')
  return [parseSeeds(seeds), [parseMap(map) for map in maps]]

def solve(data):
  [seeds, maps] = parse(data)
  sourceToMap = {map.source: map for map in maps}

  ranges = [Range(seed, 1) for seed in seeds]

  id = 'seed'
  while id != 'location':
    map = sourceToMap[id]
    ranges = map.get(ranges)
    id = map.destination
  treatedAsId = min([r.start for r in ranges])

  # group seeds in pairs
  ranges = []
  for i in range(0, len(seeds), 2):
    ranges.append(Range(seeds[i], seeds[i + 1]))

  id = 'seed'
  while id != 'location':
    map = sourceToMap[id]
    ranges = map.get(ranges)
    id = map.destination
  treatedAsRange = min([r.start for r in ranges])

  return {
    'id': treatedAsId,
    'range': treatedAsRange
  }



if __name__ == '__main__':
  # read the data.yml file from the directory relative to this file
  with open(__file__.replace('solve.py', 'data.yml')) as f:
    data = yaml.safe_load(f)
  # print the solution
  print(solve(data['puzzle']['input']))
