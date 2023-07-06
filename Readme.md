Certainly! Here's a detailed documentation for the provided project:

## Project Documentation

### Introduction
This project is a web-based image segmentation application that allows users to interactively select a region on an image and generate a corresponding segmentation mask using an ONNX model.

### Dependencies
The project requires the following dependencies:
- Web browser with WebGL2 support
- XMLHttpRequest
- ONNX runtime library (loaded dynamically)

### Execution Flow

The project consists of two main parts: Part 1 - Execution with screen interaction and Part 2 - Execution after getting embedding.

#### Part 1 - Execution with screen interaction
1. Hide crosslines: The crosslines in the viewer are hidden by setting the crosshair color to transparent and the crosshair width to zero.

2. Grab real pixels: The pixel data is captured from the WebGL canvas by creating a `Uint8Array` and using the `readPixels` method of the `webgl2` context. The pixel data is stored in the `pixels` array.

3. Create imageData object: An offscreen canvas is created with the same dimensions as the viewer canvas. An `ImageData` object is created using the offscreen canvas, and the pixel data is copied from the `pixels` array to the `ImageData` object.

4. Get image embedding: The `pixels` array is converted to base64 format and sent as a POST request to the specified `endpoint`. The response contains the image embedding. Additionally, the ONNX runtime library is dynamically loaded by creating a script element and setting its source to the CDN link.

#### Part 2 - Execution after getting embedding
5. Segment and display mask: The `segmentAndDisplayMask` function is called to perform image segmentation and display the resulting mask. The function takes the image embedding, height, width, and coordinates of the selected region as input.

6. Convert array to ImageData: The `arrayToImageData` function takes the segmentation mask array and the original image data and applies a blue color to the corresponding pixels in the mask.

7. Grabbing pixels and displaying the segment: Event listeners are added to the canvas to handle mouse events. When the mouse is pressed, the coordinates of the starting point (`x1` and `y1`) are recorded. When the mouse is moved while the button is pressed, the coordinates of the ending point (`x2` and `y2`) are updated, and a selection box is drawn on the canvas. When the mouse button is released, the `segmentAndDisplayMask` function is called with the selected region coordinates, and the resulting mask is displayed on the canvas.

### Usage
To use this project, follow these steps:
1. Add this link to your bookmarklet on Google Chrome [javascript:(function()%7Bwindow.s0=document.createElement('script');window.s0.setAttribute('type','text/javascript');window.s0.setAttribute('src','https://bookmarkify.it/bookmarklets/61320/raw');document.getElementsByTagName('body')%5B0%5D.appendChild(window.s0);%7D)();]

2. Open the provided URL: [https://mpsych.github.io/CACTAS/](https://mpsych.github.io/CACTAS/)

3. Interact with the canvas:
   - Press and hold the mouse button to start selecting a region.
   - Drag the mouse to define the region by moving to the desired ending position.
   - Release the mouse button to trigger the segmentation and display the mask.

### Limitations
- This documentation is based on the provided code snippet. There may be additional functionality or dependencies not mentioned here.
- The project assumes the availability of the specified endpoints and CDN links. If any of these resources are not accessible or have changed, the project may not work as expected.
- The details of the ONNX model and its specific requirements are not mentioned in the code snippet. It is assumed that the model is compatible with the provided code.

### Conclusion
This project provides an interactive web-based image segmentation application using an ONNX model. Users can select a region on the canvas, and the model generates a corresponding segmentation mask. The project can serve as a starting point for building more advanced image processing and segmentation applications.