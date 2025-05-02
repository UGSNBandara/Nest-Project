<p align="center">
  <a href="https://cse40.cse.uom.lk/codejam" target="blank"><img src="https://firebasestorage.googleapis.com/v0/b/profile-image-1c78a.appspot.com/o/codejam%2FCodeJameLogo.webp?alt=media&token=507a7f7b-e735-4952-ad04-d0a8f48a8f55" width="350" alt="CodeJam Logo" /></a>
</p>

## Introduction

This NestJS application implements core image processing algorithms that are divided into three sections.
1. Basic Processing Algorithms
    - Greyscale
    - Negative
    - Resize
    - Rotate
    - Sharpen
    - Contrast
    - Emboss
2. Image Enhancement Algorithms
    - Flood-fill
    - Histogram equalization
3. Feature Detection Algorithms
    - Canny Edge Detection
    - Harris Corner Detection

This code contains deliberately planted logical errors that produce visual anomalies without causing compilation failures.

## Your Mission

Your task is to find and fix all logical bugs in the codebase, and demonstrate how your fixes improve the output images. Success requires not just coding skills, but a deep understanding of image processing fundamentals and the ability to trace algorithm execution when results don't match expectations.

## Project setup

```bash
$ npm install
```

## Run all the services given below

```bash
# run main service
$ npm start cse40

# run basic-processing service
$ npm run start:basic-processing

# run enhancement service
$ npm run start:enhancement

# run feature-detection service
$ npm run start:feature-detection
```

## API Documentation

To access the Swagger API Documentation:
```
http://localhost:3000/api
```

The Swagger UI provides interactive documentation for testing all available endpoints and viewing request formats.

## Image Processing Implementation References

| Operation | Reference |
|-----------|-----------|
| **Greyscale Operation** | [RGB to Grayscale Conversion](https://e2eml.school/convert_rgb_to_grayscale.html) |
| **Contrast Operation** | [Algorithms for Adjusting Brightness and Contrast](https://ie.nitk.ac.in/blog/2020/01/19/algorithms-for-adjusting-brightness-and-contrast-of-an-image/) |
| **Emboss Operation** | Refer [Image Embossing](https://en.wikipedia.org/wiki/Image_embossing#:~:text=The%20emboss%20filter%20repeats%20the,line%20following%20an%20object's%20contour) Wikipedia article for proper implementation. You should use the specific enlarged kernel to control the depth of edges mentioned in the article. |
| **Flood Fill Operation** | [Flood Fill Algorithm](https://www.geeksforgeeks.org/flood-fill-algorithm/) to get an idea on how to implement. Note that pixel at position (400,250) is used as the reference point for flood filling and the pixels should be updated with Red color. |
| **Canny Edge Detection** | [Canny Edge Detection Step by Step](https://medium.com/data-science/canny-edge-detection-step-by-step-in-python-computer-vision-b49c3a2d8123) |
