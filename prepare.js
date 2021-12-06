import fs from 'fs'
import readline from 'readline'
import { exec } from 'child_process'
import { getFileLineCount } from './src/utils.js'

// set to Infinity to read all lines
const MAX_LINES = 100000

/**
 * Build the training and testing dataset files of all drawings in the sketches directory
 * @param {Number} trainRatio Ratio of drawings to be used for training
 */
async function buildDatasetFiles (trainRatio = 0.8) {
    let startTime = Date.now()
    const paths = fs.readdirSync('./sketches').map(name => `./sketches/${name}`)
    // const paths = ['./sketches/full_simplified_bus.ndjson']
    // const paths = ['./test.ndjson']

    for (const path of paths) {
        const loopStart = Date.now()
        let lineCount = await getFileLineCount(path)
        lineCount = Math.min(MAX_LINES, lineCount)

        const trainLines = Math.floor(lineCount * trainRatio)

        const rl = readline.createInterface({
            input: fs.createReadStream(path),
            crlfDelay: Infinity
        })

        const trainWriter = fs.createWriteStream('raw_train_data.ndjson', { flags: 'a' })
        const testWriter = fs.createWriteStream('raw_test_data.ndjson', { flags: 'a' })

        let counter = 0
        for await (const line of rl) {
            if (counter > lineCount) break
            const writer = counter++ < trainLines ? trainWriter : testWriter
            writer.write(line + '\n')
        }

        trainWriter.end()
        testWriter.end()

        console.log(`appended ${lineCount} drawings from ${path} in ${((Date.now() - loopStart) / 1000).toFixed(2)} seconds`)
    }

    console.log(`created train and test files for ${paths.length} labels in ${((Date.now() - startTime) / 1000).toFixed(2)} seconds`)

    console.log('\nshuffling dataset files ...')
    startTime = Date.now()
    await new Promise((resolve, reject) => {
        exec('shuf raw_train_data.ndjson -o train_data.ndjson && rm raw_train_data.ndjson', (err, stdout, stderr) => {
            if (err) { return reject(err) }
            resolve()
        })
    })

    await new Promise((resolve, reject) => {
        exec('shuf raw_test_data.ndjson -o test_data.ndjson && rm raw_test_data.ndjson', (err, stdout, stderr) => {
            if (err) { return reject(err) }
            resolve()
        })
    })

    console.log(`randomly shuffled train and test files in ${((Date.now() - startTime) / 1000).toFixed(2)} seconds`)
}

(async () => {
    await buildDatasetFiles()
})()
