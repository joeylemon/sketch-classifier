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
export function imageDataToPixels(ctx, scale = true) {
    let [width, height] = [IMAGE_SIZE * IMAGE_SCALE, IMAGE_SIZE * IMAGE_SCALE]
    let imageData

    if (scale) {
        // Scale the image down by IMAGE_SCALE
        const smallCanvas = createCanvas(width, height)
        const smallCtx = smallCanvas.getContext('2d')
        smallCtx.scale(IMAGE_SCALE, IMAGE_SCALE)
        smallCtx.drawImage(ctx.canvas, 0, 0)

        fs.writeFileSync('./image.jpeg', smallCanvas.toBuffer('image/jpeg'))
        imageData = smallCtx.getImageData(0, 0, width, height).data
    } else {
        width = ctx.canvas.width
        height = ctx.canvas.width
        fs.writeFileSync('./image.jpeg', ctx.canvas.toBuffer('image/jpeg'))
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

    return imageDataToPixels(ctx)
}

drawingToPixels([[[112,98,77,39,15,2,0,0,14,28,48,61,90,130,174,210,222,237,244,242,227,202,188,161,137,123],[6,4,15,58,95,133,149,164,210,231,249,254,255,243,221,192,175,140,93,77,45,24,18,12,14,24]],[[111,95,100,124,127,138,175],[32,28,48,24,55,48,0]],[[101,86,77,83,101,109,93,85],[175,182,192,206,215,224,230,225]],[[238,212,196,189,194,215,232],[95,90,105,120,131,135,150]],[[34,29,27,38,51,54,66,85],[97,112,146,140,125,136,129,105]],[[119,124,145,156,144,129],[131,104,66,128,137,141]]])