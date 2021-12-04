import * as tf from '@tensorflow/tfjs-node-gpu';
import c from 'canvas'
const { createCanvas, loadImage } = c
import { getRandomDrawing, imageDataToPixels } from './src/drawing_pixels.js';
import { SKETCH_NAMES, getModelDirectoryPath, SAVE_IMAGES } from './src/utils.js'
import { MODEL_IMAGE_SIZE } from './src/model.js'

SAVE_IMAGES = true

const model = await tf.loadLayersModel(`file:///${getModelDirectoryPath()}/model.json`)
console.log(`use saved model ...`)

const optimizer = tf.train.adam();
model.compile({
    optimizer: optimizer,
    loss: 'categoricalCrossentropy',
    metrics: ['accuracy'],
})

// grab and save a random drawing
await getRandomDrawing()

const canvas = createCanvas(MODEL_IMAGE_SIZE, MODEL_IMAGE_SIZE)
const ctx = canvas.getContext('2d')

loadImage('image.png').then(async (image) => {
    ctx.drawImage(image, 0, 0, MODEL_IMAGE_SIZE, MODEL_IMAGE_SIZE)

    const pixels = imageDataToPixels(ctx, false)

    const predictions = model.predict(tf.tensor4d([pixels])).dataSync()

    for (let i = 0; i < SKETCH_NAMES.length; i++) {
        console.log(SKETCH_NAMES[i], ":", predictions[i].toFixed(4))
    }
})