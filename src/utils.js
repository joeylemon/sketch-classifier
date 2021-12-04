import * as tf from '@tensorflow/tfjs-node';
import path from 'path'
import fs from 'fs'
import readline from 'readline'

export const SKETCH_NAMES = ['bus', 'car', 'castle', 'coffee_cup', 'compass', 'cookie', 'crab', 'fork', 'golf_club', 'ice_cream', 'key', 'moon', 'octopus', 'paintbrush', 'parachute', 'pizza', 'shark', 'shovel', 'train']
export const NUM_OUTPUT_CLASSES = SKETCH_NAMES.length

/**
 * Shuffle two arrays in the same way
 * @param {Array} arr1
 * @param {Array} arr2
 */
export function shuffle(arr1, arr2) {
    if (arr1.length !== arr2.length)
        throw new Error(`array sizes do not match for shuffle: ${arr1.length} vs ${arr2.length}`)

    var index = arr1.length;
    var rnd, tmp1, tmp2;

    while (index) {
        rnd = Math.floor(Math.random() * index);
        index -= 1;
        tmp1 = arr1[index];
        tmp2 = arr2[index];
        arr1[index] = arr1[rnd];
        arr2[index] = arr2[rnd];
        arr1[rnd] = tmp1;
        arr2[rnd] = tmp2;
    }
}

/**
 * Randomly split the dataset into training and testing
 * @param {Array} x Features array
 * @param {Array} y Labels array
 * @param {Number} trainSize The ratio of the training set size
 * @returns {Array} Tensors of the training and testing sets
 */
export function trainTestSplit(x, y, trainSize = 0.8) {
    const num_train = Math.ceil(x.length * trainSize)
    const num_test = x.length - num_train
    shuffle(x, y)

    const [trainX, trainY] = [x.slice(0, num_train), y.slice(0, num_train)]
    const [testX, testY] = [x.slice(num_train), y.slice(num_train)]

    return [tf.tensor4d(trainX), tf.oneHot(tf.tensor1d(trainY, 'int32'), NUM_OUTPUT_CLASSES), tf.tensor4d(testX), tf.oneHot(tf.tensor1d(testY, 'int32'), NUM_OUTPUT_CLASSES)]
}

/**
 * Get the absolute file path to the saved model directory
 * @returns {String}
 */
export function getModelDirectoryPath() {
    return path.resolve('./model').replace('C:\\', '').split(path.sep).join(path.posix.sep)
}

/**
 * Get the absolute file path to the saved model JSON file
 * @returns {String}
 */
export function getModelFilePath() {
    return getModelDirectoryPath() + path.sep + 'model.json'
}

/**
 * Count the number of lines in the file efficiently with a read stream
 * @param {String} path Path to the file
 * @returns {Promise<Number>} The line count
 */
export async function getFileLineCount(path) {
    const rl = readline.createInterface({
        input: fs.createReadStream(path),
        crlfDelay: Infinity
    })

    let lineCount = 0
    for await (const line of rl)
        lineCount++

    return lineCount
}

/**
 * Get a sorted array of random numbers between 0 and max
 * @param {Number} max Maximum value of a random number
 * @param {Number} n Length of array
 * @returns An array of random numbers
 */
export function getRandomNumbers(max, n) {
    const randNums = new Array(n)
    for (let i = 0; i < n; i++) {
        randNums[i] = Math.floor(Math.random() * max)
    }
    return randNums.sort((a, b) => a - b)
}