window.NeuralNetwork = require('./neural_network/neural_network.js');
window.Matrix = require('./neural_network/matrix.js');

document.addEventListener("DOMContentLoaded",
  () => {
    let trainingData = document.getElementById('training-data').innerHTML;
    let testData = document.getElementById('test-data').innerHTML;
    let netty = new NeuralNetwork(784, 100, 10, 0.1);
    netty.learn(trainingData);
    console.log("Ready!");
    let choice = netty.interpret(testData, 4);
    console.log(`Netty thinks the four is a ${choice}`);
  }
);
