import * as tf from '@tensorflow/tfjs-node-gpu'
import fs from 'fs'
import readline from 'readline'
import { drawingToPixels } from './drawing.js'
import { getFileLineCount, getSketchLabels, getSketchLabelValue } from './utils.js'

export class Dataset {
    constructor (path) {
        this.path = path

        this.numClasses = getSketchLabels().length
        this.numSamples = 100000
        getFileLineCount(this.path).then(lines => {
            this.numSamples = lines
        })

        const rl = readline.createInterface({
            input: fs.createReadStream(path),
            crlfDelay: Infinity
        })
        this.it = rl[Symbol.asyncIterator]()

        this.sampleNum = 0
    }

    /**
     * Get an array of zeroes except for a one at the index of the label value
     * @param {Number} labelValue The numeric label value [0...numClasses]
     * @returns {Array<Number>}
     */
    labelArray (labelValue) {
        return Array.from({ length: this.numClasses }, (_, k) => k === labelValue ? 1 : 0)
    }

    async * dataGenerator () {
        while (this.sampleNum < this.numSamples) {
            const line = await this.it.next()
            const obj = JSON.parse(line.value)
            const val = { xs: tf.tensor3d(drawingToPixels(obj.drawing)), ys: tf.tensor1d(this.labelArray(getSketchLabelValue(obj.word))) }

            this.sampleNum++
            if (this.sampleNum === this.numSamples) { return val }
            yield val
        }
    }

    load () {
        console.log('loading data ...')
        const ds = tf.data.generator(this.dataGenerator.bind(this))
        return ds
    }
}
