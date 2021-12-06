import * as tf from '@tensorflow/tfjs-node-gpu'
import getModel from './src/model.js'
import { Dataset } from './src/data.js'
import { trainTestSplit, getModelDirectoryPath, getCurrentTime } from './src/utils.js'

// How many drawings in each batch?
const BATCH_SIZE = 100

// How many epochs to train each batch?
const NUM_EPOCHS = 100



async function main() {
    const model = await getModel()

    const trainDS = new Dataset('train_data.ndjson').load()
    const testDS = new Dataset('test_data.ndjson').load()

    console.log(await trainDS.take(10).toArray())

    // await model.fitDataset(trainDS.batch(BATCH_SIZE), {
    //     epochs: NUM_EPOCHS,
    //     validationData: testDS.batch(BATCH_SIZE)
    // })

    // await model.save(`file:///${getModelDirectoryPath()}`)

    // await model.fit(trainDS.load(), {
    //     validationData: testDS.load()
    // })

    // for (let i = 0; i < NUM_BATCHES; i++) {
    //     const batchNum = BATCH_OFFSET + i
    //     console.log(`\n\n(${getCurrentTime()}) begin batch ${batchNum + 1}/${BATCH_OFFSET + NUM_BATCHES} ...`)

    //     await trainBatch(model, BATCH_SIZE, batchNum)
    //     await model.save(`file:///${getModelDirectoryPath()}`)

    //     console.log(`saved model state to ${getModelDirectoryPath()}`)
    // }
}

main()
