const NeuralNetwork = require('./neural_network/neural_network.js');
const Visualizer = require('./visualization/visualizer.js');

document.addEventListener("DOMContentLoaded",
  () => {
    let trainingData = document.getElementById('training-data').innerHTML;
    let testData = document.getElementById('test-data').innerHTML;
    let netty = new NeuralNetwork(784, 100, 10, 0.1);

    let vizy = new Visualizer('#header', '#work-space', netty, trainingData, testData);
  }
);
