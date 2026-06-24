//@flow

import {
  str2bigInt,
  bigInt2str,
} from '..'

describe('str2bigInt', () => {
  test('should process uppercase hexes with numeral base', () => {
    expect(str2bigInt('C', 16)).toEqual([12, 0])
    expect(str2bigInt('C', 16, 5)).toEqual([12, 0, 0, 0, 0])
  })
  test('should process lowercase hexes with numeral base', () => {
    expect(str2bigInt('c', 16)).toEqual([12, 0])
    expect(str2bigInt('c', 16, 5)).toEqual([12, 0, 0, 0, 0])
  })
  test('test data', () => {
    expect(
      str2bigInt('313aada96ad', 16, 6)
    ).toEqual([5805, 21941, 3150, 0, 0, 0])
  })
})

test('bigInt2str', () => {
  expect(bigInt2str([5805, 21941, 3150, 0, 0, 0], 10)).toBe('3383005714093')
  expect(bigInt2str([4949, 9, 0, 0, 0, 0], 10)).toBe('299861')
  expect(bigInt2str([9721, 344, 0, 0, 0, 0], 10)).toBe('11281913')
  expect(bigInt2str([4949, 9, 0, 0, 0, 0], 16)).toBe('49355')
  expect(bigInt2str([9721, 344, 0, 0, 0, 0], 16)).toBe('AC25F9')
})
