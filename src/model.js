import * as tf from '@tensorflow/tfjs-node';
import { NUM_OUTPUT_CLASSES, getModelFilePath } from './utils.js'

const IMAGE_WIDTH = 64
const IMAGE_HEIGHT = 64
const IMAGE_CHANNELS = 3

export async function getModel() {
    try {
        const model = await tf.loadLayersModel(`file:///${getModelFilePath()}`)
        console.log(`use saved model ${getModelFilePath()} ...`)

        const optimizer = tf.train.adam();
        model.compile({
            optimizer: optimizer,
            loss: 'categoricalCrossentropy',
            metrics: ['accuracy'],
        });

        return model
    } catch {
        console.log("build new model ...")
        const model = tf.sequential()

        model.add(tf.layers.conv2d({
            inputShape: [IMAGE_WIDTH, IMAGE_HEIGHT, IMAGE_CHANNELS],
            kernelSize: 5,
            filters: 8,
            strides: 1,
            activation: 'relu',
            kernelInitializer: 'varianceScaling'
        }));

        model.add(tf.layers.maxPooling2d({ poolSize: [2, 2], strides: [2, 2] }));

        model.add(tf.layers.conv2d({
            kernelSize: 5,
            filters: 16,
            strides: 1,
            activation: 'relu',
            kernelInitializer: 'varianceScaling'
        }));
        model.add(tf.layers.maxPooling2d({ poolSize: [2, 2], strides: [2, 2] }));

        model.add(tf.layers.flatten());

        model.add(tf.layers.dense({
            units: NUM_OUTPUT_CLASSES,
            kernelInitializer: 'varianceScaling',
            activation: 'softmax'
        }));

        const optimizer = tf.train.adam();
        model.compile({
            optimizer: optimizer,
            loss: 'categoricalCrossentropy',
            metrics: ['accuracy'],
        });

        return model
    }
}

export default getModel