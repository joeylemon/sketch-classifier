import canvas from 'canvas'
const { createCanvas } = canvas
import * as ndjson from 'ndjson'
import fs from 'fs'
import { getFileLineCount, SAVE_IMAGES } from './utils.js'

// How big are the original images?
export const IMAGE_SIZE = 256

// How much should we scale down the images?
export const IMAGE_SCALE = 0.25

const COLORS = ['white', 'red', 'blue', 'green', 'yellow', 'purple', 'orange', 'gray', 'cyan', 'pink']

/**
 * Convert the canvas image to an array of RGB pixels
 * @param {CanvasRenderingContext2D} ctx The canvas 2d context
 * @returns {Array} An array of RGB pixels
 */
export function imageDataToPixels(ctx, scale = true) {
    let [width, height] = [IMAGE_SIZE * IMAGE_SCALE, IMAGE_SIZE * IMAGE_SCALE]
    let imageData

    if (scale) {
        // Scale the image down by IMAGE_SCALE
        const smallCanvas = createCanvas(width, height)
        const smallCtx = smallCanvas.getContext('2d')
        smallCtx.scale(IMAGE_SCALE, IMAGE_SCALE)
        smallCtx.drawImage(ctx.canvas, 0, 0)

        if (SAVE_IMAGES) fs.writeFileSync('./image.png', smallCanvas.toBuffer('image/png'))
        imageData = smallCtx.getImageData(0, 0, width, height).data
    } else {
        width = ctx.canvas.width
        height = ctx.canvas.width
        if (SAVE_IMAGES) fs.writeFileSync('./image.png', ctx.canvas.toBuffer('image/png'))
        imageData = ctx.getImageData(0, 0, width, height).data
    }

    // The rows of pixels
    const pixel_rows = Array(height)
    let r_idx = 0

    // The columns of pixels
    let pixel_cols = Array(width)
    let c_idx = 0

    for (let i = 0; i < imageData.length; i += 4) {
        // add the red, green, and blue values to pixels
        // ignore alpha value imageData[i + 3]
        pixel_cols[c_idx++] = [imageData[i], imageData[i + 1], imageData[i + 2]]

        // if we have fill all 256 columns of this row, add to row array
        if (c_idx === width) {
            c_idx = 0
            pixel_rows[r_idx++] = pixel_cols
            pixel_cols = Array(width)
        }
    }

    return pixel_rows
}

/**
 * Convert a drawing to an array of RGB pixels
 * @param {Array} drawing The drawing containing an array of strokes
 * @returns {Array} An array of RGB pixels
 */
export function drawingToPixels(drawing) {
    const canvas = createCanvas(IMAGE_SIZE, IMAGE_SIZE)
    const ctx = canvas.getContext('2d')

    // drawing is an array containing 2 arrays (x, y) representing a stroke
    for (let j = 0; j < drawing.length; j++) {
        // stroke is an array of size 2
        // stroke = [[x0, x1, x2], [y0, y1, y2]]
        const [x, y] = drawing[j]

        ctx.strokeStyle = COLORS[j % COLORS.length]
        ctx.lineWidth = 5
        ctx.beginPath()
        ctx.moveTo(x[0], y[0])
        for (let i = 1; i < x.length; i++) {
            ctx.lineTo(x[i], y[i])
        }
        ctx.stroke()
    }

    return imageDataToPixels(ctx)
}

export async function getRandomDrawing() {
    const sketchSets = fs.readdirSync('./sketches')
    const randSketch = sketchSets[Math.floor(Math.random() * sketchSets.length)]

    const lineCount = await getFileLineCount('./sketches/' + randSketch)
    const targetLine = Math.floor(Math.random() * lineCount)

    let counter = 0
    let drawing

    const fileStream = fs.createReadStream('./sketches/' + randSketch)
    fileStream
        .pipe(ndjson.parse())
        .on('data', obj => {
            if (counter++ === targetLine) {
                console.log(`random ${obj.word} on line ${targetLine}`)
                drawingToPixels(obj.drawing)
                fileStream.destroy()
            }
        })
}