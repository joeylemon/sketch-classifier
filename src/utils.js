import path from 'path'
import fs from 'fs'
import readline from 'readline'

let sketchNames = []
const sketchLabelDict = {}

/**
 * Get the array of sketch labels to train the model with
 * @returns {Array<String>} Array of sketch labels
 */
export function getSketchLabels () {
    if (sketchNames.length === 0) {
        const files = fs.readdirSync('./sketches')
        sketchNames = files.map(name => /full_simplified_(\w+).ndjson/.exec(name)[1])
    }

    return sketchNames
}

/**
 * Get the numeric value [0...n] of the sketch name
 * @param {String} sketchName Sketch label value
 * @returns The numeric label value
 */
export function getSketchLabelValue (sketchName) {
    sketchName = sketchName.toLowerCase().replace(/ /g, '_')

    if (!sketchLabelDict[sketchName]) {
        const labels = getSketchLabels()

        if (!labels.includes(sketchName)) {
            throw new Error(`the list of sketch labels does not include given label ${sketchName}`)
        }

        for (let i = 0; i < labels.length; i++) {
            sketchLabelDict[labels[i]] = i
        }
    }

    return sketchLabelDict[sketchName]
}

/**
 * Get the absolute file path to the saved model directory
 * @returns {String}
 */
export function getModelDirectoryPath () {
    return path.resolve('./model').replace('C:\\', '').split(path.sep).join(path.posix.sep)
}

/**
 * Get the absolute file path to the saved model JSON file
 * @returns {String}
 */
export function getModelFilePath () {
    return getModelDirectoryPath() + path.sep + 'model.json'
}

/**
 * Count the number of lines in the file efficiently with a read stream
 * @param {String} path Path to the file
 * @returns {Promise<Number>} The line count
 */
export async function getFileLineCount (path) {
    const rl = readline.createInterface({
        input: fs.createReadStream(path),
        crlfDelay: Infinity
    })

    let lineCount = 0

    // eslint-disable-next-line
    for await (const line of rl) { lineCount++ }

    return lineCount
}

/**
 * Get the current time in HH:MM:SS format
 * @returns {String} The current time
 */
export function getCurrentTime () {
    const ny = new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })
    const d = new Date(ny)
    const [hours, mins, secs] = [d.getHours(), d.getMinutes(), d.getSeconds()]
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

/**
 * Custom log function with timestamp
 */
export function print (...args) {
    console.log(getCurrentTime(), ...args)
}
