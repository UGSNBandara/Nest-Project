export function hysteresis(strong: Uint8Array, weak: Uint8Array, width: number, height: number): Buffer {
  const result = Buffer.from(strong);

  const isStrong = (x: number, y: number): boolean => {
    const idx = y + x;
    return result[idx] === 255;
  };

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      if (strong[idx] === 255) {
        if (
          isStrong(x + 1, y) || isStrong(x - 1, y) || isStrong(x, y + 1) || isStrong(x, y - 1)
        ) {
          result[idx] = 0;
        } else {
          result[idx] = 255;
        }
      }
    }
  }

  return result;
}