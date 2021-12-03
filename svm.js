import getModel from './model.js'
import { getDrawings } from './data.js';
import { drawingToPixels } from './drawing_pixels.js'
import { SKETCH_NAMES, trainTestSplit, getModelDirectoryPath } from './utils.js'

// How many drawings in each batch?
const BATCH_SIZE = 200

// How many batches to train the CNN on for this execution?
const NUM_BATCHES = 50

// Skip the first BATCH_OFFSET batches of each dataset.
const BATCH_OFFSET = 10

/**
 * Get sketches from the saved files
 * @param {Array<String>} sketches The array of sketch names
 * @param {Number} batchSize The number of drawings to use in each batch
 * @param {Number} batchNum The batch number to grab from the sketch files
 * @returns {Promise<Array>} An array of images and an array of class labels
 */
async function getDataset(batchSize, batchNum) {
    let imgs = []
    let classes = []

    for (let i = 0; i < SKETCH_NAMES.length; i++) {
        const objs = await getDrawings(`./sketches/full_simplified_${SKETCH_NAMES[i]}.ndjson`, batchSize, batchNum * batchSize)

        // convert the drawing paths to pixel arrays
        imgs = imgs.concat(objs.map(d => drawingToPixels(d)))

        // set the label for this class
        classes = classes.concat(new Array(imgs.length).fill(i))
    }

    return [imgs, classes]
}

/**
 * Train the model on a single batch
 * @param {tf.Sequential} model The Tensorflow model
 * @param {Number} batchSize The number of drawings to use in each batch 
 * @param {Number} batchNum The batch number to grab from the sketch files
 */
async function trainBatch(model, batchSize, batchNum) {
    console.log(`train batch ${batchNum} ...`)
    const [imgs, classes] = await getDataset(batchSize, batchNum)

    const [trainX, trainY, testX, testY] = trainTestSplit(imgs, classes)

    await model.fit(trainX, trainY, {
        batchSize: batchSize,
        validationData: [testX, testY],
        epochs: 15,
        shuffle: true
    })
}

async function main() {
    const model = await getModel()

    for (let i = 0; i < NUM_BATCHES; i++) {
        await trainBatch(model, BATCH_SIZE, BATCH_OFFSET + i)
    }

    await model.save(`file:///${getModelDirectoryPath()}`)
}

main()