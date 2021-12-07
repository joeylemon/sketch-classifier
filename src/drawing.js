import canvasPkg from 'canvas'
import fs from 'fs'
import readline from 'readline'
import { getFileLineCount } from './utils.js'
const { createCanvas } = canvasPkg

// How big are the original images?
export const IMAGE_SIZE = 256

// How much should we scale down the images?
export const IMAGE_SCALE = 0.25

const COLORS = ['white', 'red', 'blue', 'green', 'yellow', 'purple', 'orange', 'gray', 'cyan', 'pink']

const canvas = createCanvas(IMAGE_SIZE, IMAGE_SIZE)
const ctx = canvas.getContext('2d')

/**
 * Convert the canvas image to an array of RGB pixels
 * @param {CanvasRenderingContext2D} ctx The canvas 2d context
 * @param {Boolean} scale Whether or not to scale the image down by IMAGE_SCALE
 * @param {String} savePath If set, save an image of the drawing to this path
 * @returns {Array[64][64][3]} An array of RGB pixels
 */
export function imageDataToPixels (ctx, scale = true, savePath = '') {
    let [width, height] = [IMAGE_SIZE * IMAGE_SCALE, IMAGE_SIZE * IMAGE_SCALE]
    let imageData

    if (scale) {
        // Scale the image down by IMAGE_SCALE
        const smallCanvas = createCanvas(width, height)
        const smallCtx = smallCanvas.getContext('2d')
        smallCtx.scale(IMAGE_SCALE, IMAGE_SCALE)
        smallCtx.drawImage(ctx.canvas, 0, 0)

        if (savePath !== '') fs.writeFileSync(savePath, smallCanvas.toBuffer('image/png'))
        imageData = smallCtx.getImageData(0, 0, width, height).data
    } else {
        width = ctx.canvas.width
        height = ctx.canvas.width
        if (savePath !== '') fs.writeFileSync(savePath, ctx.canvas.toBuffer('image/png'))
        imageData = ctx.getImageData(0, 0, width, height).data
    }

    // The rows of pixels
    const pixelRows = Array(height)
    let rIdx = 0

    // The columns of pixels
    let pixelCols = Array(width)
    let cIdx = 0

    for (let i = 0; i < imageData.length; i += 4) {
        // add the red, green, and blue values to pixels
        // ignore alpha value imageData[i + 3]
        pixelCols[cIdx++] = [imageData[i], imageData[i + 1], imageData[i + 2]]

        // if we have fill all 256 columns of this row, add to row array
        if (cIdx === width) {
            cIdx = 0
            pixelRows[rIdx++] = pixelCols
            pixelCols = Array(width)
        }
    }

    return pixelRows
}

/**
 * Convert a drawing to an array of RGB pixels
 * @param {Array} drawing The drawing containing an array of strokes
 * @param {String} savePath If set, save an image of the drawing to this path
 * @returns {Array[64][64][3]} An array of RGB pixels
 */
export function drawingToPixels (drawing, savePath = '') {
    ctx.clearRect(0, 0, IMAGE_SIZE, IMAGE_SIZE)

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

    return imageDataToPixels(ctx, true, savePath)
}

/**
 * Load and save a random drawing from the sketches directory
 * @param {String} savePath The path to save the random drawing
 * @returns {Promise<String>} The name of the random drawing
 */
export function saveRandomDrawing (savePath) {
    return new Promise(resolve => {
        const sketchSets = fs.readdirSync('./sketches')
        const randSketch = sketchSets[Math.floor(Math.random() * sketchSets.length)]
        const path = './sketches/' + randSketch

        getFileLineCount(path)
            .then(async lineCount => {
                const targetLine = Math.floor(Math.random() * lineCount)

                const rl = readline.createInterface({
                    input: fs.createReadStream(path),
                    crlfDelay: Infinity
                })

                let counter = 0
                for await (const line of rl) {
                    if (counter++ >= targetLine) {
                        const obj = JSON.parse(line)
                        drawingToPixels(obj.drawing, savePath)
                        rl.close()
                        return resolve(obj.word)
                    }
                }
            })
    })
}
