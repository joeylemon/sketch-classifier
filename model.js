import * as tf from '@tensorflow/tfjs';

const IMAGE_WIDTH = 256
const IMAGE_HEIGHT = 256
const IMAGE_CHANNELS = 3
const NUM_OUTPUT_CLASSES = 3;

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

export default model