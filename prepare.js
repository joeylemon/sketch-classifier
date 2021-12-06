import fs from 'fs'
import readline from 'readline'
import { print, getFileLineCount } from './src/utils.js'
import { shuffleFile } from './src/data.js'

// set to Infinity to read all lines
const MAX_LINES = 100000

/**
 * Build the training file with all drawings in the sketches directory
 */
async function buildDatasetFile () {
    let startTime = Date.now()
    const paths = fs.readdirSync('./sketches').map(name => `./sketches/${name}`)

    for (const path of paths) {
        const loopStart = Date.now()
        let lineCount = await getFileLineCount(path)
        lineCount = Math.min(MAX_LINES, lineCount)

        const rl = readline.createInterface({
            input: fs.createReadStream(path),
            crlfDelay: Infinity
        })

        const fileWriter = fs.createWriteStream('train_data.ndjson', { flags: 'a' })

        const counter = 0
        for await (const line of rl) {
            if (counter > lineCount) break
            fileWriter.write(line + '\n')
        }

        fileWriter.end()

        print(`appended ${lineCount} drawings from ${path} in ${((Date.now() - loopStart) / 1000).toFixed(2)} seconds`)
    }

    print(`created dataset for ${paths.length} labels in ${((Date.now() - startTime) / 1000).toFixed(2)} seconds`)
    print('\nshuffling entire dataset ...')

    startTime = Date.now()
    await shuffleFile('train_data.ndjson')

    print(`randomly shuffled dataset in ${((Date.now() - startTime) / 1000).toFixed(2)} seconds`)
}

(async () => {
    await buildDatasetFile()
})()
