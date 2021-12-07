import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import fs from 'fs'
import path from 'path'
import readline from 'readline'
import { print, getFileLineCount } from './src/utils.js'
import { shuffleFile } from './src/data.js'

const args = yargs(hideBin(process.argv))
    .option('input', {
        alias: 'i',
        type: 'string',
        default: 'sketches',
        description: 'The directory containing drawing datasets'
    })
    .option('output', {
        alias: 'o',
        type: 'string',
        default: 'train_data.ndjson',
        description: 'The file to save the combined datasets'
    })
    .option('drawings', {
        alias: 'n',
        type: 'number',
        default: 100000,
        description: 'The number of drawings to take from each dataset'
    })
    .option('skip', {
        alias: 's',
        type: 'number',
        default: 0,
        description: 'The number of drawings to skip in each dataset before appending'
    })
    .option('recognize', {
        alias: 'r',
        type: 'boolean',
        default: true,
        description: 'Only append recognized drawings'
    })
    .parse()

/**
 * Build the training file with all drawings in the sketches directory
 */
async function buildDatasetFile () {
    let startTime = Date.now()

    if (args.skip > 0) { print(`skipping ${args.skip} drawings in each file ...`) }

    const paths = fs.readdirSync(args.input).map(name => args.input + path.sep + name)
    for (const path of paths) {
        const loopStart = Date.now()
        let lineCount = await getFileLineCount(path)
        lineCount = Math.min(args.drawings, lineCount)

        const rl = readline.createInterface({
            input: fs.createReadStream(path),
            crlfDelay: Infinity
        })

        const fileWriter = fs.createWriteStream(args.output, { flags: 'a' })

        // only skip the given amount if the file has enough to skip
        let counter = lineCount > args.skip ? -args.skip : 0
        let appended = 0
        for await (const line of rl) {
            if (args.recognize && JSON.parse(line).recognized === false) { continue }
            
            counter++
            if (counter < 0) { continue }
            if (counter > lineCount) { break }

            appended++
            fileWriter.write(line + '\n')
        }

        fileWriter.end()

        print(`appended ${appended} drawings from ${path} in ${((Date.now() - loopStart) / 1000).toFixed(2)} seconds`)
    }

    print(`created dataset for ${paths.length} labels in ${((Date.now() - startTime) / 1000).toFixed(2)} seconds`)
    print('shuffling entire dataset ...')

    startTime = Date.now()
    await shuffleFile(args.output)

    print(`randomly shuffled dataset in ${((Date.now() - startTime) / 1000).toFixed(2)} seconds`)
}

(async () => {
    await buildDatasetFile()
})()
