import getModel from './src/model.js'
import { getDataset } from './src/data.js';
import { trainTestSplit, getModelDirectoryPath } from './src/utils.js'

// How many drawings in each batch?
const BATCH_SIZE = 300

// How many batches to train the CNN on for this execution?
const NUM_BATCHES = 30

/**
 * Train the model on a single batch
 * @param {tf.Sequential} model The Tensorflow model
 * @param {Number} batchSize The number of drawings to use in each batch
 */
async function trainBatch(model, batchSize) {
    const [imgs, classes] = await getDataset(batchSize)

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
        console.log(`\n\ntrain batch ${i + 1}/${NUM_BATCHES} ...`)
        await trainBatch(model, BATCH_SIZE)
    }

    await model.save(`file:///${getModelDirectoryPath()}`)
}

main()