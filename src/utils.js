import * as tf from '@tensorflow/tfjs-node-gpu'
import path from 'path'
import fs from 'fs'
import readline from 'readline'

let sketchNames = []
let sketchLabelDict = {}

/**
 * Shuffle two arrays in the same way
 * @param {Array} arr1
 * @param {Array} arr2
 */
export function shuffle (arr1, arr2) {
    if (arr1.length !== arr2.length) { throw new Error(`array sizes do not match for shuffle: ${arr1.length} vs ${arr2.length}`) }

    let index = arr1.length
    let rnd, tmp1, tmp2

    while (index) {
        rnd = Math.floor(Math.random() * index)
        index -= 1
        tmp1 = arr1[index]
        tmp2 = arr2[index]
        arr1[index] = arr1[rnd]
        arr2[index] = arr2[rnd]
        arr1[rnd] = tmp1
        arr2[rnd] = tmp2
    }
}

/**
 * Shuffle a single array
 * @param {Array} array
 */
function shuffleOne (array) {
    let currentIndex = array.length; let randomIndex

    while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex)
        currentIndex--;

        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]]
    }

    return array
}

/**
 * Randomly split the dataset into training and testing
 * @param {Array} x Features array
 * @param {Array} y Labels array
 * @param {Number} trainSize The ratio of the training set size
 * @returns {Array} Tensors of the training and testing sets
 */
export function trainTestSplit (x, y, trainSize = 0.8) {
    const numClasses = getSketchLabels().length
    const numTrain = Math.ceil(x.length * trainSize)
    shuffle(x, y)

    const [trainX, trainY] = [x.slice(0, numTrain), y.slice(0, numTrain)]
    const [testX, testY] = [x.slice(numTrain), y.slice(numTrain)]

    return [tf.tensor4d(trainX), tf.oneHot(tf.tensor1d(trainY, 'int32'), numClasses), tf.tensor4d(testX), tf.oneHot(tf.tensor1d(testY, 'int32'), numClasses)]
}

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
    sketchName = sketchName.replace(/ /g, '_')

    if (!sketchLabelDict[sketchName]) {
        const labels = getSketchLabels()
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
 * Get a sorted array of random numbers between 0 and max
 * @param {Number} max Maximum value of a random number
 * @param {Number} n Length of array
 * @returns An array of random numbers
 */
export function getRandomNumbers (max, n) {
    const randNums = new Array(n)
    for (let i = 0; i < n; i++) {
        randNums[i] = Math.floor(Math.random() * max)
    }
    return randNums.sort((a, b) => a - b)
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
