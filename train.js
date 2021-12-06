import getModel from './src/model.js'
import { Dataset } from './src/data.js'
import { getModelDirectoryPath } from './src/utils.js'

// How many drawings in each batch?
const BATCH_SIZE = 1024

async function main () {
    const model = await getModel()

    const trainDS = new Dataset('train_data.ndjson').load()
    const testDS = new Dataset('test_data.ndjson').load()

    await model.fitDataset(trainDS.batch(BATCH_SIZE), {
        epochs: 1,
        validationData: testDS
    })

    await model.save(`file:///${getModelDirectoryPath()}`)
}

main()
