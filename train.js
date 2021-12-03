import getModel from './src/model.js'
import { getDataset } from './src/data.js';
import { trainTestSplit, getModelDirectoryPath } from './src/utils.js'

// How many drawings in each batch?
const BATCH_SIZE = 200

// How many batches to train the CNN on for this execution?
const NUM_BATCHES = 50

// Skip the first BATCH_OFFSET batches of each dataset.
const BATCH_OFFSET = 10

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