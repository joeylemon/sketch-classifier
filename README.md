# Sketch Classifier

A [Tensorflow.js](https://www.tensorflow.org/js) program to construct and train a convolutional neural network to classify sketches. This program is built to make use of Google's ["Quick, Draw!"](https://github.com/googlecreativelab/quickdraw-dataset) dataset. The model saved in this repository was trained on over 9 million drawings of 65 different types. To speed up the training process, this program uses the tfjs-node-gpu package to utilize Tensorflow's C binary and perform tensor operations on the GPU with CUDA.

## Background
Google's dataset is provided in the form of drawing strokes instead of images. Therefore, during the training of the model, these strokes are used to generate images on-the-fly to be fed into the network. Additionally, to provide the network with even more context on stroke patterns, each individual stroke is colored differently, as seen below. White is the first stroke, red is the second, blue is the third, etc.

<p align="center"><img src="https://i.imgur.com/skoPqCw.jpg" /></p>

Each image is scaled to 64x64 pixels before being fed into the network. Below is the summary of the simple network model used in this script.

| Layer  | Output Shape | Num Params |
| ------------- | ------------- | ------------- |
| conv2d_Conv2D1 (Conv2D)  | [null,60,60,4]  | 304  |
| max_pooling2d_MaxPooling2D1  | [null,30,30,4]  | 0  |
| conv2d_Conv2D2 (Conv2D)   | [null,26,26,8]   | 808  |
| max_pooling2d_MaxPooling2D2  | [null,13,13,8]  | 0  |
| flatten_Flatten1 (Flatten)  | [null,1352]  | 0  |
| dense_Dense1 (Dense)  | [null,19]  | 25707  |

## Data

Because of the massive amount of data provided by the "Quick, Draw!" dataset, data must be ingested and prepared in certain ways to prevent memory overflows. Tensorflow provides the tf.data.Dataset class, which serves to represent any arbitrary data to be passed into other Tensorflow methods. This Dataset class can be constructed in a way to use an iterator to hide the implementation of data retrieval as well as allow for a theoretically infinite amount of data to be retrieved. To build this class in this program, we use a Javascript generator function to natively create an iterable function. An example of this can be in the code snippet seen below:

```js
async * dataGenerator () {
    while (this.sampleNum < this.numSamples) {
        const line = await this.it.next()
        const obj = JSON.parse(line.value)
        const val = { xs: tf.tensor3d(drawingToPixels(obj.drawing)), ys: tf.tensor1d(this.labelArray(getSketchLabelValue(obj.word))) }

        if (this.sampleNum++ === this.numSamples) { return val }
        yield val
    }
}

load () {
    return tf.data.generator(this.dataGenerator.bind(this))
}
```

## Usage

First, download the sketches you wish to use to train the model to a directory named `sketches/`. The data is in the form of `.ndjson` files and can be downloaded from [Google Cloud Storage](https://console.cloud.google.com/storage/browser/quickdraw_dataset/full/simplified;tab=objects?prefix=&forceOnObjectsSortingFiltering=false).

Then, you must prepare the drawings into a single dataset file. This can be done with the prepare.js script:
```sh
> node prepare.js
```

This will create `train_data.ndjson` containing shuffled records from every dataset in `sketches/`. Now, you may run the training script with:
```sh
> node train.js
```

Tensorflow will output the training progress throughout the execution of the script. When the model has reached a satisfactory accuracy, you may predict a single random image from the `sketches/` directory using the following command:
```sh
> node predict.js
```

This script will output the probability of each label and also save the random drawing to `image.png` so you may view it.
