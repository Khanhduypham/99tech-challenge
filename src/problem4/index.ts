// *
// * Implementation A
// * Solution: Iterative
// * Complexity
// * - Time: O(n) -> loops from 1 to n
// * - Space: just use 1 variable to store result
// * //
const sum_to_n_a = (n: number): number => {
  let sum = 0;
  for (let i = 1; i <= n; i++) {
    sum += i;
  }
  return sum;
};

// *
// * Implementation B
// * Solution: Recursive
// * Complexity
// * - Time: O(n) -> one recursive call per number
// * - Space: O(n) -> due to recursion call stack
// * //
const sum_to_n_b = (n: number): number => {
  if (n <= 1) return n;
  return n + sum_to_n_b(n - 1);
};

// *
// * Implementation C
// * Solution: Mathematic formula
// * Complexity
// * - Time: O(1) -> runs in constant time
// * //
const sum_to_n_c = (n: number): number => {
  return (n * (n + 1)) / 2;
};

const main = () => {
  const n = Math.floor(Math.random() * 100) + 1;
  console.log(`n = ${n}`);
  console.log(`sum_to_n_a(${n}) = ${sum_to_n_a(n)}`);
  console.log(`sum_to_n_b(${n}) = ${sum_to_n_b(n)}`);
  console.log(`sum_to_n_c(${n}) = ${sum_to_n_c(n)}`);
};

main();
