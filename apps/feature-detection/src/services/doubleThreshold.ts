export function doubleThreshold(input: Float32Array, width: number, height: number, low: number, high: number): {
  strongEdges: Uint8Array;
  weakEdges: Uint8Array;
} {
  const strong = new Uint8Array(width * height);
  const weak = new Uint8Array(width * height);

  for (let i = 0; i < input.length; i++) {
    if (input[i] >= high) {
      strong[i] = 255;
    } else if (input[i] >= low) {
      weak[i] = 255;
    }
  }

  return { strongEdges: strong, weakEdges: weak };
}
