import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import getModel from './src/model.js'
import { Dataset, shuffleFile } from './src/data.js'
import { print, getFileLineCount, getModelDirectoryPath, getSketchLabels } from './src/utils.js'

const args = yargs(hideBin(process.argv))
    .option('input', {
        alias: 'i',
        type: 'string',
        default: 'train_data.ndjson',
        description: 'The dataset file to train on'
    })
    .option('batch', {
        alias: 'b',
        type: 'number',
        default: 1024,
        description: 'Size of the batches'
    })
    .option('shuffle', {
        alias: 's',
        type: 'boolean',
        default: true,
        description: 'Whether or not to shuffle the input dataset'
    })
    .parse()

async function main () {
    const model = await getModel()

    print(`found ${getSketchLabels().length} types of drawings`)

    if (args.shuffle) {
        print('shuffling input files ...')
        await shuffleFile('train_data.ndjson')
    }

    print('getting number of samples ...')
    const numSamples = await getFileLineCount(args.input)
    const trainDS = new Dataset(args.input, numSamples).load()

    print(`start training on ${numSamples} samples ...`)
    await model.fitDataset(trainDS.batch(args.batch), {
        epochs: 1
    })

    print('save model to', getModelDirectoryPath())
    await model.save(`file:///${getModelDirectoryPath()}`)
}

main()
