//updated on July 5th, 2023
//https://mpsych.github.io/CACTAS/

//Execution part 1 with some screen interaction.

// 1. hide crosslines
nv.setCrosshairColor([0,0,0,0]);
nv.opts.crosshairWidth=0;
nv.updateGLVolume();


// 2. grab REAL pixels
c = document.getElementById('viewer')
ctx = c.getContext("webgl2")

nv.refreshDrawing() // draw call
pixels = new Uint8Array(ctx.drawingBufferWidth * ctx.drawingBufferHeight * 4);
ctx.readPixels(
  0, 
  0, 
  ctx.drawingBufferWidth, 
  ctx.drawingBufferHeight, 
  ctx.RGBA, 
  ctx.UNSIGNED_BYTE, 
  pixels);


offscreen = document.createElement('canvas'),
offscreen.width = ctx.drawingBufferWidth;
offscreen.height = ctx.drawingBufferHeight;
document.body.append(offscreen);

offctx = offscreen.getContext('2d');


// 3. create imageData object
imgdata = offctx.createImageData(offscreen.width, offscreen.height);
pxdata = imgdata.data;

for (var i =0; i<pxdata.length;i++) {
    
  pxdata[i] = pixels[i];

}
  // update canvas with new data
offctx.putImageData(imgdata, 0, 0);
offctx.save();
offctx.scale(1, -1); // Flip vertically
offctx.drawImage(offscreen, 0, -c.height); // Draw with flipped coordinates
offctx.restore();


base64 = offscreen.toDataURL('image/png')
base64 = base64.replace("data:image/png;base64,","")
realpixels = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));


// 4. get image embedding
endpoint = 'https://model-zoo.metademolab.com/predictions/segment_everything_box_model';        

xhr = new XMLHttpRequest();
xhr.open("POST", endpoint);
xhr.onreadystatechange = function () {
  if (xhr.readyState === 4) {

    embedding = JSON.parse(xhr.response);

    // LOAD ONNX RUNTIME
    const script = document.createElement("script")
    script.type = "text/javascript"
    script.src = "https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/ort.min.js"
    document.head.appendChild(script)
    eval(script)

  }
} 
xhr.send(realpixels);


//Execution part 2 after getting embedding.

// 5. SEGMENT AND DISPLAY MASK
async function segmentAndDisplayMask(embedding, height, width, x1, y1, x2, y2) {
  session = await ort.InferenceSession.create('https://cs666.org/onnx/sam.onnx');

  input = {};

  uint8arr = Uint8Array.from(atob(embedding[0]), (c) => c.charCodeAt(0));
  embeddingTensor = new ort.Tensor("float32", new Float32Array(uint8arr.buffer), [1, 256, 64, 64]);
  input['low_res_embedding'] = embeddingTensor;

  input['point_coords'] = new ort.Tensor("float32", new Float32Array([x1, y1, x2, y2]), [1, 2, 2]);

  input['point_labels'] = new ort.Tensor("float32", new Float32Array([2, 3]), [1, 2]);

  input['image_size'] = new ort.Tensor("float32", new Float32Array([height, width]));

  input['last_pred_mask'] = new ort.Tensor("float32", new Float32Array(256 * 256), [1, 1, 256, 256]);
  input['has_last_pred'] = new ort.Tensor("float32", new Float32Array([0]));

  return session.run(input).then(output => {
    ctx = offscreen.getContext('2d');
    image = ctx.getImageData(0, 0, width, height);
    mask = arrayToImageData(output.output.data, image, width, height);
    ctx.putImageData(mask, 0, 0);

  }).catch(err => {
    console.error(err);
  });
}


// 6. CONVERT ARRAY TO IMAGEDATA
function arrayToImageData(mask, image, width, height) {
  [r, g, b, a] = [0, 114, 189, 255]; // the mask's blue color
  arr = image.data;
  for (var i = 0; i < mask.length; i++) {
    if (mask[i] > 0.0) {
      arr[4 * i + 0] = r;
      arr[4 * i + 1] = g;
      arr[4 * i + 2] = b;
      arr[4 * i + 3] = a;
    }
  }
  return new ImageData(arr, width, height);
}


// 7. Grabbing the pixels and displaying the Segment
let x1=0;
let y1=0; 
let x2=0;
let y2=0;
let isMouseDown = false;

const canvas = document.getElementById('viewer')

canvas.addEventListener('mousedown', function (e) {
  console.log(`${e.x} and ${e.y}`);
  isMouseDown = true;
  x1=e.x;
  y1=e.y;
});

canvas.addEventListener('mousemove', function (e) {
  if (isMouseDown) {
    x2 = e.x;
    y2 = e.y;
    nv.drawSelectionBox([x1, y1, x2-x1, y2-y1]);
  }
});

canvas.addEventListener('mouseup', function (e) {
  console.log(`${e.x} and ${e.y}`);
  x2=e.x;
  y2=e.y;
  isMouseDown = false;
  segmentAndDisplayMask(embedding,offscreen.height, offscreen.width, x1,y1,x2,y2);
  // Draw selection box on offscreen canvas
  // nv.drawSelectionBox([x1, y1, x2-x1, y2-y1]);
  offscreen.style.position = 'absolute';
  offscreen.style.top = '0';
  offscreen.style.left = '0';
  offscreen.style.zIndex = '1';
});

offscreen.addEventListener('click', function (e) {
  offscreen.style.zIndex = '-1';
});