/**
 * This script performs a classification on a random drawing from './sketches/'
 *
 * Run it with: node predict.js
 */

import * as tf from '@tensorflow/tfjs-node-gpu'
import c from 'canvas'
import { saveRandomDrawing, imageDataToPixels } from './src/drawing.js'
import { print, getSketchLabels, getModelDirectoryPath } from './src/utils.js'
import { MODEL_IMAGE_SIZE } from './src/model.js'
const { createCanvas, loadImage } = c

// reset color code
const RS = '\x1b[0m'

async function main() {
    // grab and save a random drawing
    const drawingName = await saveRandomDrawing('image.png')
    print(`loaded random ${drawingName} drawing ...`)

    const model = await tf.loadLayersModel(`file:///${getModelDirectoryPath()}/model.json`)
    print('use saved model ...')

    const optimizer = tf.train.adam()
    model.compile({
        optimizer: optimizer,
        loss: 'categoricalCrossentropy',
        metrics: ['accuracy']
    })

    // create the canvas to use to convert to a pixels matrix
    const canvas = createCanvas(MODEL_IMAGE_SIZE, MODEL_IMAGE_SIZE)
    const ctx = canvas.getContext('2d')

    // load the saved random drawing
    loadImage('image.png').then(async (image) => {
        // add the drawing to canvas and convert to pixels matrix
        ctx.drawImage(image, 0, 0, MODEL_IMAGE_SIZE, MODEL_IMAGE_SIZE)
        const pixels = imageDataToPixels(ctx, false)

        // predict the drawing
        const predictions = model.predict(tf.tensor4d([pixels])).dataSync()
        const maxProbability = Math.max(...predictions)

        print('label'.padStart(11, ' '), ':', 'probability')
        print('-'.padStart(11, '-'), ':', '-'.padStart(11, '-'))

        const sketchLabels = getSketchLabels()
        let predictedIdx = 0
        for (let i = 0; i < sketchLabels.length; i++) {
            let color = ''

            // color the predicted class green
            if (predictions[i].toFixed(4) === maxProbability.toFixed(4)) {
                color = '\x1b[0;32m'
                predictedIdx = i
            }

            print(color, sketchLabels[i].padStart(10, ' '), ':', predictions[i].toFixed(4), RS)
        }

        print(`got drawing of ${drawingName} and predicted ${sketchLabels[predictedIdx]} with ${(predictions[predictedIdx] * 100).toFixed(2)}% probability`)
    })
}

main()
