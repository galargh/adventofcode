import yaml

# create a dictionary of digit names
digits = {
  'one': 1,
  'two': 2,
  'three': 3,
  'four': 4,
  'five': 5,
  'six': 6,
  'seven': 7,
  'eight': 8,
  'nine': 9
}

def solve(data):
  # split the input into a list of strings
  lines = data.split('\n')
  # create a variable to store the sum of the numbers
  result = 0
  # iterate over the list of strings
  for i in range(len(lines)):
    line = lines[i]
    # skip the empty lines
    if not line:
      continue
    # find the first and last digit
    first = 0
    last = 0
    # iterate over the characters of the string
    for j in range(len(line)):
      # check if the character is a digit
      if line[j].isdigit():
        first = int(line[j])
      else:
        # check if the string starting from the character is a digit name
        for key, value in digits.items():
          if line[j:].startswith(key):
            first = value
            break
      # check if the first digit is found
      if first != 0:
        break
    # iterate over the characters of the string in reverse order
    for j in range(len(line)):
      # check if the character is a digit
      if line[-j - 1].isdigit():
        last = int(line[-j - 1])
      else:
        # check if the string ending with the character is a digit name
        for key, value in digits.items():
          if line[:len(line)-j].endswith(key):
            last = value
            break
      if last != 0:
        break
    result += first * 10 + last
  # return the sum of the list
  return result

if __name__ == '__main__':
  # read the data.yml file from the directory relative to this file
  with open(__file__.replace('test.py', 'data.yml')) as f:
    data = yaml.safe_load(f)
    data = yaml.safe_load(f)
  # print the solution
  print(solve(data['puzzle']['input']))
