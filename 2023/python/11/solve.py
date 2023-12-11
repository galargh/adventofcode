import yaml

def solve(data):
  expansionRate = data['rate']
  # turn data into a 2d grid
  grid = data['map'].splitlines()
  # find indices of empty rows (i.e. rows containing only .)
  emptyRows = [i for i in range(0, len(grid)) if "#" not in grid[i]]
  # find indices of empty columns
  emptyColumns = [i for i in range(0, len(grid[0])) if "#" not in [row[i] for row in grid]]
  # find coordinates of galaxies (#)
  galaxies = [(i, j) for i in range(0, len(grid)) for j in range(0, len(grid[0])) if grid[i][j] == '#']
  result = 0
  for i in range(0, len(galaxies)):
    for j in range(i+1, len(galaxies)):
      minX = min(galaxies[i][0], galaxies[j][0])
      maxX = max(galaxies[i][0], galaxies[j][0])
      minY = min(galaxies[i][1], galaxies[j][1])
      maxY = max(galaxies[i][1], galaxies[j][1])
      shortestDistance = maxX - minX + maxY - minY
      # count empty rows between galaxies twice
      for emptyRow in emptyRows:
        if emptyRow > minX and emptyRow < maxX:
          shortestDistance += expansionRate - 1
      # count empty columns between galaxies twice
      for emptyColumn in emptyColumns:
        if emptyColumn > minY and emptyColumn < maxY:
          shortestDistance += expansionRate - 1
      result += shortestDistance
  return result

if __name__ == '__main__':
  # read the data.yml file from the directory relative to this file
  with open(__file__.replace('solve.py', 'data.yml')) as f:
    data = yaml.safe_load(f)
  # print the solution
  print(solve(data['puzzle']['input']))
