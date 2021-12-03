import canvas from 'canvas'
const { createCanvas } = canvas
import fs from 'fs'

const IMAGE_WIDTH = 256
const IMAGE_HEIGHT = 256

/**
 * Convert the canvas image to an array of RGB pixels
 * @param {CanvasRenderingContext2D} ctx The canvas 2d context
 * @returns {Array} An array of RGB pixels
 */
function imageDataToPixels(ctx) {
    const imageData = ctx.getImageData(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT).data

    // The rows of pixels
    const pixel_rows = Array(IMAGE_HEIGHT)
    let r_idx = 0

    // The columns of pixels
    let pixel_cols = Array(IMAGE_WIDTH)
    let c_idx = 0
    
    for (let i = 0; i < imageData.length; i += 4) {
        // add the red, green, and blue values to pixels
        // ignore alpha value imageData[i + 3]
        pixel_cols[c_idx++] = [imageData[i], imageData[i + 1], imageData[i + 2]]

        // if we have fill all 256 columns of this row, add to row array
        if (c_idx === IMAGE_WIDTH) {
            c_idx = 0
            pixel_rows[r_idx++] = pixel_cols
            pixel_cols = Array(IMAGE_WIDTH)
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
    const canvas = createCanvas(IMAGE_WIDTH, IMAGE_HEIGHT)
    const ctx = canvas.getContext('2d')

    // strokes is an array containing 2d arrays
    for (const stroke of drawing) {
        // stroke is an array of size 2
        // stroke = [[x0, x1, x2], [y0, y1, y2]]
        const [x, y] = stroke

        ctx.strokeStyle = 'white'
        ctx.beginPath()
        ctx.moveTo(x[0], y[0])
        for (let i = 1; i < x.length; i++) {
            ctx.lineTo(x[i], y[i])
        }
        ctx.stroke()
    }

    // fs.writeFileSync('./image.png', canvas.toBuffer('image/png'))

    return imageDataToPixels(ctx)
}

drawingToPixels([[[10,44,93,186,221,234,238,237,230,212,166,124,108,80,13],[44,56,62,64,63,52,45,32,26,18,5,0,0,7,33]],[[0,3,17,47,77],[48,138,180,210,224]],[[229,249,253,234,204,175,133,51,28,115,170,217,226,218,192,172],[67,125,169,193,221,230,235,234,245,246,253,255,252,243,233,230]]])