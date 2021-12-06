import * as tf from '@tensorflow/tfjs-node-gpu'
import fs from 'fs'
import readline from 'readline'
import { exec } from 'child_process'
import { drawingToPixels } from './drawing.js'
import { print, getSketchLabels, getSketchLabelValue } from './utils.js'

export class Dataset {
    constructor (path, numSamples) {
        this.path = path

        this.numSamples = numSamples
        this.numClasses = getSketchLabels().length

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

    /**
     * Generator function which allows Tensorflow to iterate on the input file one line at a time.
     * This is necessary considering the size of the input dataset.
     */
    async * dataGenerator () {
        while (this.sampleNum < this.numSamples) {
            const line = await this.it.next()
            const obj = JSON.parse(line.value)
            const val = { xs: tf.tensor3d(drawingToPixels(obj.drawing)), ys: tf.tensor1d(this.labelArray(getSketchLabelValue(obj.word))) }

            this.sampleNum++

            if (this.sampleNum !== 0 && this.sampleNum % 50000 === 0) {
                print(`${(this.sampleNum / this.numSamples * 100).toFixed(2)}% complete with processing dataset`)
            }

            if (this.sampleNum === this.numSamples) { return val }
            yield val
        }
    }

    load () {
        return tf.data.generator(this.dataGenerator.bind(this))
    }
}

/**
 * Shuffle all of the file's lines using the shuf command
 * @param {String} path Path to the file
 */
export async function shuffleFile (path) {
    await new Promise((resolve, reject) => {
        exec(`shuf ${path} -o ${path}`, (err, stdout, stderr) => {
            if (err) { return reject(err) }
            resolve()
        })
    })
}
