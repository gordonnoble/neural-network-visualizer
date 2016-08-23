const MyMath = require('./my_math.js');
const Matrix = require('./matrix.js');

let NeuralNetwork = function(numInputNodes, numHiddenNodes, numOutputNodes, learningRate) {
  this.numInputNodes = numInputNodes;
  this.numHiddenNodes = numHiddenNodes;
  this.numOutputNodes = numOutputNodes;
  this.learningRate = learningRate;

  let stdDev = Math.pow(this.numHiddenNodes, -0.5);
  this.wih = new Matrix(this.numHiddenNodes, this.numInputNodes);
  this.wih = this.wih.map( () =>
    MyMath.randAroundZero(stdDev)
  );

  stdDev = Math.pow(this.numOutputNodes, -0.5);
  this.who = new Matrix(this.numOutputNodes, this.numHiddenNodes);
  this.who = this.who.map( () =>
    MyMath.randAroundZero(stdDev)
  );
};

NeuralNetwork.prototype.query = function(inputs) {
  this.inputs = new Matrix(inputs).transpose();

  this.hiddenInputs = this.wih.dot(this.inputs);
  this.hiddenOutputs = this.hiddenInputs.map( x =>
    MyMath.sigmoid(x)
  );

  this.finalInputs = this.who.dot(this.hiddenOutputs);
  this.finalOutputs = this.finalInputs.map( x =>
    MyMath.sigmoid(x)
  );

  return this.finalOutputs;
};

NeuralNetwork.prototype.train = function(inputs, targets) {
  inputs = new Matrix(inputs).transpose();
  targets = new Matrix(targets).transpose();

  let hiddenInputs = this.wih.dot(inputs);
  let hiddenOutputs = hiddenInputs.map( x =>
    MyMath.sigmoid(x)
  );

  let finalInputs = this.who.dot(hiddenOutputs);
  let finalOutputs = finalInputs.map( x =>
    MyMath.sigmoid(x)
  );

  let outputErrors = targets.map( (x, i, j) => x - finalOutputs.get(i, j));
  let hiddenErrors = this.who.transpose().dot(outputErrors);

  let invFinalOut = finalOutputs.map( x => 1 - x );
  let whoCorrections = outputErrors.times(finalOutputs).times(invFinalOut);
  whoCorrections = whoCorrections.dot(hiddenOutputs.transpose()).map( x => x * this.learningRate );
  this.who = this.who.map( (x, i, j) => x + whoCorrections.get(i, j));

  let invHiddenOut = hiddenOutputs.map( x => 1 - x );
  let wihCorrections = hiddenErrors.times(hiddenOutputs).times(invHiddenOut);
  wihCorrections = wihCorrections.dot(inputs.transpose()).map( x => x * this.learningRate );
  this.wih = this.wih.map( (x, i, j) => x + wihCorrections.get(i, j));
};

NeuralNetwork.prototype.learn = function(data, callback) {
  let trainingDigits = data.split(/\r?\n/);

  trainingDigits.forEach( digit => {
    let allValues = digit.split(',').map( x => parseFloat(x));
    let inputs = allValues.slice(1, allValues.length).map( x => x / 255.0 * 0.99 + 0.01);

    let targets = [];
    let j = 0;
    while(j < 10) { targets.push(0.01); j++; }
    let idx = parseInt(allValues[0]);
    targets[idx] = 0.99;
    this.train(inputs, targets);
  });

  callback();
};

NeuralNetwork.prototype.interpret = function(digitCSV) {
  let allValues = digitCSV.split(',').map( x => parseFloat(x));
  let inputs = allValues.slice(1, allValues.length).map( x => x / 255.0 * 0.99 + 0.01);

  let outputs = this.query(inputs).toArray();
  this.chosenDigit = outputs.indexOf(Math.max(...outputs));
};

NeuralNetwork.prototype.prepSample = function(numSampleInputs, numSampleHiddenInputs) {
    this.sampleInputs = [];
    this.sampleHiddenInputs = [];
    this.sampleHiddenOutputs = [];
    this.sampleWIH = new Matrix(numSampleHiddenInputs, numSampleInputs);
    this.sampleWHO = new Matrix(this.numOutputNodes, numSampleHiddenInputs);

    let sampleInputIdxs = NeuralNetwork.randomIdxs(this.numInputNodes, numSampleInputs);
    let sampleHiddenIdxs = NeuralNetwork.randomIdxs(this.numHiddenNodes, numSampleHiddenInputs);

    let inputs = this.inputs.toArray();
    let hiddenInputs = this.hiddenInputs.toArray();
    let hiddenOutputs = this.hiddenOutputs.toArray();

    sampleInputIdxs.forEach( (iIdx, i) => {
      this.sampleInputs.push(inputs[iIdx]);

      sampleHiddenIdxs.forEach( (hIdx, j) => {
        this.sampleWIH.set(j, i, this.wih.get(hIdx, iIdx));
      });
    });

    sampleHiddenIdxs.forEach( (hIdx, i) => {
      this.sampleHiddenInputs.push(hiddenInputs[hIdx]);
      this.sampleHiddenOutputs.push(hiddenOutputs[hIdx]);

      [...Array(10).keys()].forEach( (oIdx, j) => {
        this.sampleWHO.set(j, i, this.who.get(oIdx, hIdx));
      });
    });
};

NeuralNetwork.randomIdxs = function(arrayLength, numIdxs) {
  let idxs = [];

  for(let i = 0; i < numIdxs; i++) {
    idxs.push(Math.floor(Math.random()*arrayLength));
  }

  return idxs;
};

module.exports = NeuralNetwork;
