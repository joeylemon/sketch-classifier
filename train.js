import * as tf from '@tensorflow/tfjs-node-gpu'
import getModel from './src/model.js'
import { getDataset } from './src/data.js'
import { trainTestSplit, getModelDirectoryPath, getCurrentTime } from './src/utils.js'

// How many drawings in each batch?
const BATCH_SIZE = 500

// How many batches to train the CNN on for this execution?
const NUM_BATCHES = 100

// How many epochs to train each batch?
const NUM_EPOCHS = 30

// How many batches to skip before grabbing drawings?
const BATCH_OFFSET = 18

/**
 * Train the model on a single batch
 * @param {tf.Sequential} model The Tensorflow model
 * @param {Number} batchSize The number of drawings to use in each batch
 * @param {Number} batchNum The batch number to grab from the sketch files
 */
async function trainBatch (model, batchSize, batchNum) {
    const [imgs, classes] = await getDataset(batchSize, batchNum)

    const [trainX, trainY, testX, testY] = trainTestSplit(imgs, classes)

    await model.fit(trainX, trainY, {
        batchSize: batchSize,
        validationData: [testX, testY],
        epochs: NUM_EPOCHS,
        shuffle: true
    })

    tf.dispose([trainX, trainY, testX, testY])
}

async function main () {
    const model = await getModel()

    for (let i = 0; i < NUM_BATCHES; i++) {
        const batchNum = BATCH_OFFSET + i
        console.log(`\n\n(${getCurrentTime()}) begin batch ${batchNum + 1}/${BATCH_OFFSET + NUM_BATCHES} ...`)

        await trainBatch(model, BATCH_SIZE, batchNum)
        await model.save(`file:///${getModelDirectoryPath()}`)

        console.log(`saved model state to ${getModelDirectoryPath()}`)
    }
}

main()
