export function applyConvolution(
    imageData: Buffer,
    width: number,
    height: number,
    channels: number,
    kernel: number[][]
): Buffer {
    const result = Buffer.alloc(imageData.length);
    const bias = 255;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            for (let c = 0; c < channels; c++) {
                const pixelIndex = (y * width + x) * channels + c;

                let sum = imageData[pixelIndex];

                const kernelValue = kernel[1][1];
                sum *= kernelValue;

                result[pixelIndex] = Math.min(Math.max(sum * bias, 0), 255);
            }
        }
    }

    return result;
}
