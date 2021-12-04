import * as tf from '@tensorflow/tfjs-node';
import c from 'canvas'
const { createCanvas, loadImage } = c
import { imageDataToPixels } from './src/drawing_pixels.js';
import { SKETCH_NAMES, getModelDirectoryPath } from './src/utils.js'

const model = await tf.loadLayersModel(`file:///${getModelDirectoryPath()}/model.json`)
console.log(`use saved model ...`)

const optimizer = tf.train.adam();
model.compile({
    optimizer: optimizer,
    loss: 'categoricalCrossentropy',
    metrics: ['accuracy'],
})

const canvas = createCanvas(64, 64)
const ctx = canvas.getContext('2d')

loadImage('image.jpeg').then(async (image) => {
    ctx.drawImage(image, 0, 0, 64, 64)

    const pixels = imageDataToPixels(ctx, false)

    const predictions = model.predict(tf.tensor4d([pixels])).dataSync()


    for (let i = 0; i < SKETCH_NAMES.length; i++) {
        console.log(SKETCH_NAMES[i], "\t\t", predictions[i].toFixed(4))
    }
})