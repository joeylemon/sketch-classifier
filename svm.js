import * as tf from '@tensorflow/tfjs';
import model from './model.js'
import { getDrawings } from './data.js';
import { drawingToPixels } from './drawing_pixels.js'
import { shuffle, trainTestSplit } from './utils.js'

async function main() {
    const numSamples = 10

    const buses = await getDrawings("./sketches/full_simplified_bus.ndjson", numSamples)
    let imgs = buses.map(d => drawingToPixels(d))
    let classes = new Array(numSamples).fill([1, 0, 0])

    const cookies = await getDrawings("./sketches/full_simplified_cookie.ndjson", numSamples)
    imgs = imgs.concat(cookies.map(d => drawingToPixels(d)))
    classes = classes.concat(new Array(numSamples).fill([0, 1, 0]))

    const moons = await getDrawings("./sketches/full_simplified_moon.ndjson", numSamples)
    imgs = imgs.concat(moons.map(d => drawingToPixels(d)))
    classes = classes.concat(new Array(numSamples).fill([0, 0, 1]))

    // The data tensor of shape [numSamples, numPixels, 3]
    const [trainX, trainY, testX, testY] = trainTestSplit(imgs, classes)

    model.fit(trainX, trainY, {
        batchSize: 512,
        validationData: [testX, testY],
        epochs: 10,
        shuffle: true
    })

    const testResult = model.evaluate(testX, testY)
    const accuracy = testResult[1].dataSync()[0] * 100
    console.log(`Model accuracy: ${accuracy}`)
}

main()