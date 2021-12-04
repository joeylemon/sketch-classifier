import * as ndjson from 'ndjson'
import fs from 'fs'
import readline from 'readline'
import { drawingToPixels } from './drawing_pixels.js'
import { getFileLineCount, getRandomNumbers, SKETCH_NAMES } from './utils.js'

/**
 * Read n random drawings from the given ndjson file
 * @param {String} file The file name containing the drawing strokes
 * @param {Number} n The number of drawings to read
 * @returns {Promise<Array>} The array of drawing strokes
 */
export async function getDrawings(file, n) {
    return new Promise(async (resolve, reject) => {
        const lineCount = await getFileLineCount(file)
        const randLines = getRandomNumbers(lineCount, n)

        let targetLine = randLines.shift()
        let currentLine = 0

        const rl = readline.createInterface({
            input: fs.createReadStream(file),
            crlfDelay: Infinity
        })

        const drawings = []
        for await (const line of rl) {
            if (currentLine++ >= targetLine) {
                const obj = JSON.parse(line)

                drawings.push(obj.drawing)

                targetLine = randLines.shift()
                if (targetLine === undefined) {
                    rl.close()
                    return resolve(drawings)
                }
            }
        }

        resolve(drawings)
    })
}

/**
 * Get sketches from the saved files
 * @param {Array<String>} sketches The array of sketch names
 * @param {Number} batchSize The number of drawings to use in each batch
 * @returns {Promise<Array>} An array of images and an array of class labels
 */
export async function getDataset(batchSize) {
    let imgs = []
    let classes = []

    const start = Date.now()

    for (let i = 0; i < SKETCH_NAMES.length; i++) {
        const objs = await getDrawings(`./sketches/full_simplified_${SKETCH_NAMES[i]}.ndjson`, batchSize)

        // convert the drawing paths to pixel arrays
        imgs = imgs.concat(objs.map(d => drawingToPixels(d)))

        // set the label for this class
        classes = classes.concat(new Array(objs.length).fill(i))
    }

    console.log(`loaded ${SKETCH_NAMES.length}*${batchSize} = ${imgs.length} drawings in ${((Date.now() - start) / 1000).toFixed(2)} seconds`)

    return [imgs, classes]
}