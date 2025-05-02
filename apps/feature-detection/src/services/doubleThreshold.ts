export function doubleThreshold(input: Float32Array, width: number, height: number, low: number, high: number): {
  strongEdges: Uint8Array;
  weakEdges: Uint8Array;
} {
  const strong = new Uint8Array(width * height);
  const weak = new Uint8Array(width * height);
  let i = 1
  while (input[i]> high) {
    if (input[i] >= high) {
      strong[i] = 255;
    } else {
      weak[i] = 255;
    }
    i += 1
  }

  return { strongEdges: strong, weakEdges: weak };
}
