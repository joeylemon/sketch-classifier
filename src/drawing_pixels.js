import canvas from 'canvas'
const { createCanvas } = canvas
import fs from 'fs'

// How big are the original images?
const IMAGE_SIZE = 256

// How much should we scale down the images?
const IMAGE_SCALE = 0.25

/**
 * Convert the canvas image to an array of RGB pixels
 * @param {CanvasRenderingContext2D} ctx The canvas 2d context
 * @returns {Array} An array of RGB pixels
 */
export function imageDataToPixels(ctx) {
    // Scale the image down by IMAGE_SCALE
    const [width, height] = [IMAGE_SIZE * IMAGE_SCALE, IMAGE_SIZE * IMAGE_SCALE]
    const smallCanvas = createCanvas(width, height)
    const smallCtx = smallCanvas.getContext('2d')
    smallCtx.scale(IMAGE_SCALE, IMAGE_SCALE)
    smallCtx.drawImage(ctx.canvas, 0, 0)

    const imageData = smallCtx.getImageData(0, 0, width, height).data

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

    fs.writeFileSync('./image.png', canvas.toBuffer('image/png'))

    return imageDataToPixels(ctx)
}

drawingToPixels([[[1,0,12,30,36,38,38,50,63,67,72,74,74,88,96,103,107,104,101,81,75,67,64,59,48,44,43,32,8,4],[96,79,3,1,14,22,77,38,14,13,17,29,80,23,11,15,30,122,129,136,145,175,233,253,254,245,141,131,119,93]]])