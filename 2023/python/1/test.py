import yaml

from solve import solve

if __name__ == '__main__':
  with open('data.yml') as f:
    data = yaml.safe_load(f)
  # iterate over the test cases
  for test in data['tests']:
    # call the solve function
    result = solve(test['input'])
    # check if the result is equal to the expected result
    assert result == test['output'], f'Expected {test["output"]}, got {result}'
