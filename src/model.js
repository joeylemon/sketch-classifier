import * as tf from '@tensorflow/tfjs-node-gpu'
import { print, getSketchLabels, getModelFilePath } from './utils.js'
import { IMAGE_SIZE, IMAGE_SCALE } from './drawing.js'

export const MODEL_IMAGE_SIZE = IMAGE_SIZE * IMAGE_SCALE
const IMAGE_CHANNELS = 3

/**
 * Attempt to load a saved model from utils.getModelFilePath().
 * If no saved model is found, construct a new one.
 * @returns {Promise<tf.Sequential>} The Tensorflow model
 */
export async function getModel () {
    try {
        const model = await tf.loadLayersModel(`file:///${getModelFilePath()}`)
        print(`use saved model ${getModelFilePath()} ...`)

        const optimizer = tf.train.adam()
        model.compile({
            optimizer: optimizer,
            loss: 'categoricalCrossentropy',
            metrics: ['accuracy']
        })

        return model
    } catch {
        print(`no model found at ${getModelFilePath()}`)
        print('build new model ...')
        const model = tf.sequential()

        model.add(tf.layers.conv2d({
            inputShape: [MODEL_IMAGE_SIZE, MODEL_IMAGE_SIZE, IMAGE_CHANNELS],
            kernelSize: 3,
            filters: 4,
            strides: 1,
            activation: 'relu',
            kernelInitializer: 'varianceScaling'
        }))

        model.add(tf.layers.maxPooling2d({ poolSize: [2, 2], strides: [2, 2] }))

        model.add(tf.layers.conv2d({
            kernelSize: 3,
            filters: 8,
            strides: 1,
            activation: 'relu',
            kernelInitializer: 'varianceScaling'
        }))
        model.add(tf.layers.maxPooling2d({ poolSize: [2, 2], strides: [2, 2] }))

        model.add(tf.layers.conv2d({
            kernelSize: 3,
            filters: 16,
            strides: 1,
            activation: 'relu',
            kernelInitializer: 'varianceScaling'
        }))
        model.add(tf.layers.maxPooling2d({ poolSize: [2, 2], strides: [2, 2] }))

        model.add(tf.layers.flatten())

        model.add(tf.layers.dense({
            units: getSketchLabels().length,
            kernelInitializer: 'varianceScaling',
            activation: 'softmax'
        }))

        const optimizer = tf.train.adam()
        model.compile({
            optimizer: optimizer,
            loss: 'categoricalCrossentropy',
            metrics: ['accuracy']
        })

        return model
    }
}

export default getModel
