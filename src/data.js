import * as ndjson from 'ndjson'
import fs from 'fs'
import { drawingToPixels } from './drawing.js'
import { getSketchLabels } from './utils.js'

/**
 * Read the first n drawings from the given ndjson file
 * @param {String} file The file name containing the drawing strokes
 * @param {Number} n The number of drawings to read
 * @param {Number} skip The number of drawings to skip before reading
 * @returns {Promise<Array>} The array of drawing strokes
 */
export async function getDrawings (file, n, skip = 0) {
    return new Promise((resolve, reject) => {
        const drawings = new Array(n)
        drawings.length = 0

        let numRead = 0

        const fileStream = fs.createReadStream(file)
        fileStream
            .pipe(ndjson.parse())
            .on('data', obj => {
                if (!obj.recognized) return
                if (numRead++ < skip) return

                drawings[drawings.length] = obj.drawing
                if (numRead >= n + skip) {
                    fileStream.destroy()
                    resolve(drawings.slice(0, n))
                }
            })
            .on('error', err => reject(err))
            .on('end', () => resolve(drawings.slice(0, n)))
    })
}

/**
 * Get sketches from the saved files
 * @param {Array<String>} sketches The array of sketch names
 * @param {Number} batchSize The number of drawings to use in each batch
 * @param {Number} batchNum The batch number to grab from the sketch files
 * @returns {Promise<Array>} An array of images and an array of class labels
 */
export async function getDataset (batchSize, batchNum) {
    const sketchNames = getSketchLabels()
    let imgs = []
    let classes = []

    const start = Date.now()

    for (let i = 0; i < sketchNames.length; i++) {
        const objs = await getDrawings(`./sketches/full_simplified_${sketchNames[i]}.ndjson`, batchSize, batchNum * batchSize)

        // convert the drawing paths to pixel arrays
        imgs = imgs.concat(objs.map(d => drawingToPixels(d)))

        // set the label for this class
        classes = classes.concat(new Array(objs.length).fill(i))
    }

    console.log(`loaded ${sketchNames.length}*${batchSize} = ${imgs.length} drawings in ${((Date.now() - start) / 1000).toFixed(2)} seconds`)

    return [imgs, classes]
}
