const MyMath = require('./my_math.js');
const Numeric = require('Numeric');

let NeuralNetwork = function(numInputNodes, numHiddenNodes, numOutputNodes, learningRate) {
  this.numInputNodes = numInputNodes;
  this.numHiddenNodes = numHiddenNodes;
  this.numOutputNodes = numOutputNodes;
  this.learningRate = learningRate;

  let stdDev = Math.pow(this.numHiddenNodes, -0.5);
  this.wih = Numeric.rep([this.numHiddenNodes, this.numInputNodes], 0);
  this.wih = this.wih.map( row =>
    row.map( x => MyMath.randAroundZero(stdDev))
  );

  stdDev = Math.pow(this.numOutputNodes, -0.5);
  this.who = Numeric.rep([this.numOutputNodes, this.numHiddenNodes], 0);
  this.who = this.who.map( row =>
    row.map( x => MyMath.randAroundZero(stdDev))
  );
};

NeuralNetwork.prototype.query = function(inputs) {
  this.inputs = Numeric.transpose([inputs]);

  this.hiddenInputs = Numeric.dot(this.wih, this.inputs);
  this.hiddenOutputs = this.hiddenInputs.map( row =>
    row.map(x => MyMath.sigmoid(x))
  );

  this.finalInputs = Numeric.dot(this.who, this.hiddenOutputs);
  this.finalOutputs = this.finalInputs.map( row =>
    row.map(x => MyMath.sigmoid(x))
  );

  return this.finalOutputs;
};

NeuralNetwork.prototype.train = function(inputs, targets) {
  inputs = Numeric.transpose([inputs]);
  targets = Numeric.transpose([targets]);

  let hiddenInputs = Numeric.dot(this.wih, inputs);
  let hiddenOutputs = hiddenInputs.map( row =>
    row.map(x => MyMath.sigmoid(x))
  );

  let finalInputs = Numeric.dot(this.who, hiddenOutputs);
  let finalOutputs = finalInputs.map( row =>
    row.map(x => MyMath.sigmoid(x))
  );

  let outputErrors = Numeric.sub(targets, finalOutputs);
  let hiddenErrors = Numeric.dot(Numeric.transpose(this.who), outputErrors);

  let invFinalOut = Numeric.sub(1, finalOutputs);
  let whoCorrections = Numeric.mul(Numeric.mul(outputErrors, finalOutputs), invFinalOut);
  whoCorrections = Numeric.mul(Numeric.dot(whoCorrections, Numeric.transpose(hiddenOutputs)), this.learningRate);
  this.who = Numeric.add(this.who, whoCorrections);

  let invHiddenOut = Numeric.sub(1, hiddenOutputs);
  let wihCorrections = Numeric.mul(Numeric.mul(hiddenErrors, hiddenOutputs), invHiddenOut);
  wihCorrections = Numeric.mul(Numeric.dot(wihCorrections, Numeric.transpose(inputs)), this.learningRate);
  this.wih = Numeric.add(this.wih, wihCorrections);
};

NeuralNetwork.prototype.learn = function(data, callback) {
  let trainingDigits = data.split(/\r?\n/);

  trainingDigits.forEach( digit => {
    let allValues = Numeric.parseCSV(digit)[0];
    let inputs = allValues.slice(1, allValues.length).map( x => x / 255.0 * 0.99 + 0.01);

    let targets = new Array(10).fill(0.01);
    targets[allValues[0]] = 0.99;
    this.train(inputs, targets);
  });

  callback();
};

NeuralNetwork.prototype.interpret = function(digitCSV) {
  let allValues = Numeric.parseCSV(digitCSV)[0];
  let inputs = allValues.slice(1, allValues.length).map( x => x / 255.0 * 0.99 + 0.01);

  let outputs = Numeric.transpose(this.query(inputs))[0];
  this.chosenDigit = outputs.indexOf(Math.max(...outputs));
};

NeuralNetwork.prototype.prepSample = function(numSampleInputs, numSampleHiddenInputs) {
    this.sampleInputs = [];
    this.sampleHiddenInputs = [];
    this.sampleHiddenOutputs = [];
    this.sampleWIH = Numeric.rep([numSampleHiddenInputs, numSampleInputs], 0);
    this.sampleWHO = Numeric.rep([this.numOutputNodes, numSampleHiddenInputs], 0);

    let sampleInputIdxs = NeuralNetwork.randomIdxs(this.numInputNodes, numSampleInputs);
    let sampleHiddenIdxs = NeuralNetwork.randomIdxs(this.numHiddenNodes, numSampleHiddenInputs);

    sampleInputIdxs.forEach( (iIdx, i) => {
      this.sampleInputs.push(this.inputs[iIdx]);

      sampleHiddenIdxs.forEach( (hIdx, j) => {
        this.sampleWIH[j][i] = this.wih[hIdx][iIdx];
      });
    });

    let hiddenInputs = Numeric.transpose(this.hiddenInputs)[0];
    let hiddenOutputs = Numeric.transpose(this.hiddenOutputs)[0];

    sampleHiddenIdxs.forEach( (hIdx, i) => {
      this.sampleHiddenInputs.push(hiddenInputs[hIdx]);
      this.sampleHiddenOutputs.push(hiddenOutputs[hIdx]);

      [...Array(10).keys()].forEach( (oIdx, j) => {
        this.sampleWHO[j][i] = this.who[oIdx][hIdx];
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
