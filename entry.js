const NeuralNetwork = require('./neural_network/neural_network.js');
const Visualizer = require('./visualization/visualizer.js');

document.addEventListener("DOMContentLoaded",
  () => {
    let trainingData = document.getElementById('training-data').innerHTML;
    let testData = document.getElementById('test-data').innerHTML;
    let netty = new NeuralNetwork(784, 100, 10, 0.1);
    // netty.learn(trainingData);

    let canvasEl = document.getElementById('canvas');
    let headerEl = document.getElementById('canvas-header');
    let visualizationEl = document.getElementById('visualization');

    let vizy = new Visualizer(canvasEl, headerEl, visualizationEl, netty, trainingData, testData);
  }
);
