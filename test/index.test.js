const { greeting } = require('../src/index');

describe('Basic Application Tests', () => {
  test('greeting function should return correct greeting', () => {
    expect(greeting('Jenkins')).toBe('Hello, Jenkins!');
  });
  
  test('greeting function should handle empty input', () => {
    expect(greeting('')).toBe('Hello, !');
  });

  test('greeting function should properly handle special characters', () => {
  expect(greeting('Jenkins CI/CD')).toBe('Hello, Jenkins CI/CD!');
});
});
