import * as ndjson from 'ndjson'
import fs from 'fs'
import readline from 'readline'

/**
 * Read the first n drawings from the given ndjson file
 * @param {String} file The file name containing the drawing strokes
 * @param {Number} n The number of drawings to read
 * @param {Number} skip The number of drawings to skip before reading
 * @returns {Promise<Array>} The array of drawing strokes
 */
export async function getDrawings(file, n, skip = 0) {
    return new Promise((resolve, reject) => {
        const drawings = []
        let num_read = 0

        const fileStream = fs.createReadStream(file)
        fileStream
            .pipe(ndjson.parse())
            .on('data', obj => {
                if (!obj.recognized) return
                if (num_read++ < skip) return

                drawings.push(obj.drawing)
                if (num_read >= n + skip) {
                    fileStream.destroy()
                    resolve(drawings.slice(0, n))
                }
            })
            .on("error", err => reject(err))
            .on("end", () => resolve(drawings.slice(0, n)))
    })
}