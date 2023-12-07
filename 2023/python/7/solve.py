import yaml

ranks = {
  'A': 14,
  'K': 13,
  'Q': 12,
  'J': 11,
  'T': 10,
  '9': 9,
  '8': 8,
  '7': 7,
  '6': 6,
  '5': 5,
  '4': 4,
  '3': 3,
  '2': 2
}

maxRank = max(ranks.values())

class Hand:
  def __init__(self, hand, bid, joker = False):
    self.hand = hand
    self.bid = int(bid)
    cardRanks = [ranks[card] if card != 'J' or not joker else 1 for card in list(hand)]
    rankCounts = [cardRanks.count(rank) for rank in set(cardRanks) - {1}]
    jokerCount = cardRanks.count(1)
    maxCount = max(rankCounts) if rankCounts else 0
    if maxCount + jokerCount == 5:
      handRank = maxRank + 6
    elif maxCount + jokerCount == 4:
      handRank = maxRank + 5
    elif len(rankCounts) <= 2:
      handRank = maxRank + 4
    elif maxCount + jokerCount == 3:
      handRank = maxRank + 3
    elif len(rankCounts) <= 3:
      handRank = maxRank + 2
    elif maxCount + jokerCount == 2:
      handRank = maxRank + 1
    elif len(rankCounts) + min(jokerCount, 1) == 5:
      handRank = maxRank
    else:
      raise Exception('Unknown hand')
    self.cardRanks = cardRanks
    self.handRank = handRank

  def __lt__(self, other):
    if self.handRank != other.handRank:
      return self.handRank < other.handRank
    for i in range(0, 5):
      if self.cardRanks[i] != other.cardRanks[i]:
        return self.cardRanks[i] < other.cardRanks[i]
    raise Exception('Hands are equal')

def solve(data):
  lines = data.splitlines()
  standardHands = [Hand(line.split(' ')[0], line.split(' ')[1]) for line in lines]
  jokerHands = [Hand(line.split(' ')[0], line.split(' ')[1], True) for line in lines]
  standardHands.sort()
  jokerHands.sort()
  standard = 0
  joker = 0
  for i in range(0, len(lines)):
    standard += standardHands[i].bid * (i + 1)
    joker += jokerHands[i].bid * (i + 1)
  return {
    'standard': standard,
    'joker': joker
  }

if __name__ == '__main__':
  # read the data.yml file from the directory relative to this file
  with open(__file__.replace('solve.py', 'data.yml')) as f:
    data = yaml.safe_load(f)
  # print the solution
  print(solve(data['puzzle']['input']))
