/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	const NeuralNetwork = __webpack_require__(1);
	const Visualizer = __webpack_require__(4);

	document.addEventListener("DOMContentLoaded",
	  () => {
	    let trainingData = document.getElementById('training-data').innerHTML;
	    let testData = document.getElementById('test-data').innerHTML;
	    let netty = new NeuralNetwork(784, 100, 10, 0.1);

	    let vizy = new Visualizer('#header', '#title', '#work-space', netty, trainingData, testData);
	  }
	);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	const MyMath = __webpack_require__(2);
	const Matrix = __webpack_require__(3);

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


/***/ },
/* 2 */
/***/ function(module, exports) {

	const MyMath = {
	  randAroundZero(stdDev) {
	    let theta = 2 * Math.PI * Math.random();
	    let rho = Math.sqrt(-2 * Math.log(1 - Math.random()));
	    let scale = stdDev * rho;
	    return scale * Math.cos(theta);
	  },
	  sigmoid(x) {
	    let pow = Math.pow(Math.E, -x);
	    return (1.0 / (1.0 + pow));
	  }
	};

	module.exports = MyMath;


/***/ },
/* 3 */
/***/ function(module, exports) {

	const Matrix = function() {
	  this.matrix = [];

	  if (arguments[0] instanceof Array) {
	    this.width = arguments[0].length;
	    this.height = 0;

	    let i = 0;
	    while(i < arguments.length) {
	      this.matrix.push(arguments[i]);
	      this.height++;
	      i++;
	    }
	  } else if (typeof(arguments[0]) === 'number' ) {
	    this.height = arguments[0];
	    this.width = arguments[1];

	    let i = 0;
	    while (i < this.height) {
	      this.matrix.push([]);
	      i++;
	    }
	  }
	};

	Matrix.prototype.set = function(i, j, val) {
	  this.matrix[i][j] = val;
	};

	Matrix.prototype.get = function(i, j) {
	  return this.matrix[i][j];
	};

	Matrix.prototype.each = function(callback) {
	  let i = 0; let j = 0;

	  while (i < this.height) {
	    while (j < this.width) {
	      callback(this.matrix[i][j], i, j);
	      j++;
	    }
	    j = 0; i++;
	  }

	  return this.matrix;
	};

	Matrix.prototype.map = function(callback) {
	  let result = new Matrix(this.height, this.width);

	  let i = 0; let j = 0;
	  while (i < this.height) {
	    while (j < this.width) {
	      result.set(i, j, callback(this.matrix[i][j], i, j));
	      j++;
	    }
	    j = 0; i++;
	  }

	  return result;
	};

	Matrix.prototype.row = function(idx) {
	  return this.matrix[idx];
	};

	Matrix.prototype.col = function(idx) {
	  let column = [];

	  let i = 0;
	  while (i < this.height) {
	    column.push(this.matrix[i][idx]);
	    i++;
	  }

	  return column;
	};

	Matrix.prototype.dot = function(other) {
	  if (this.width !== other.height) {
	    throw "Incompatible matrices.";
	  }

	  let resultHeight = this.height;
	  let resultWidth = other.width;
	  let result = new Matrix(resultHeight, resultWidth);

	  let i = 0; let j = 0;
	  while (i < resultHeight) {
	    while (j < resultWidth) {
	      let row = this.row(i);
	      let col = other.col(j);
	      result.set(i, j, Matrix.sumProduct(row, col));
	      j++;
	    }
	    j = 0; i++;
	  }

	  return result;
	};

	Matrix.sumProduct = function(arr1, arr2) {
	  let sum = 0;

	  arr1.forEach( (val, idx) =>
	    sum += (arr1[idx] * arr2[idx])
	  );

	  return sum;
	};

	Matrix.prototype.transpose = function() {
	  let result = new Matrix(this.width, this.height);

	  let i = 0; let j = 0;
	  while (i < this.height) {
	    while (j < this.width) {
	      result.set(j, i, this.get(i, j));
	      j++;
	    }
	    j = 0; i++;
	  }

	  return result;
	};

	Matrix.prototype.times = function(other) {
	  let result = new Matrix(this.height, this.width);

	  let i = 0; let j = 0;
	  while (i < this.height) {
	    while (j < this.width) {
	      result.set(i, j, this.get(i, j) * other.get(i, j));
	      j++;
	    }
	    j = 0; i++;
	  }

	  return result;
	};

	Matrix.prototype.toArray = function() {
	  let arr = [];

	  this.each( x => arr.push(x) );

	  return arr;
	};

	module.exports = Matrix;


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	const Matrix = __webpack_require__(3);

	const Visualizer = function(headerQuery, titleQuery, workSpaceQuery, neuralNetwork, trainingData, testData) {
	  this.headerSpace = $(headerQuery);
	  this.titleSpace = $(titleQuery);
	  this.workSpace = $(workSpaceQuery);
	  this.neuralNetwork = neuralNetwork;
	  this.testDigits = testData.split(/\r?\n/);

	  this.beginTraining(trainingData);
	};

	Visualizer.prototype.beginTraining = function(trainingData) {
	  this.titleSpace.html('one minute, getting up to speed...');
	  let thinkingEl = this.drawLoadingElement();

	  let startVisualization = function() {
	    thinkingEl.remove();
	    this.displayNumberPicker();
	  };

	  setTimeout( () => this.neuralNetwork.learn(trainingData, startVisualization.bind(this)), 200);
	};

	Visualizer.prototype.drawLoadingElement = function() {
	  let thinkingEl = document.createElement('div');
	  thinkingEl.className = 'sk-cube-grid';

	  [...Array(9).keys()].forEach( idx => {
	    let squareEl = document.createElement('div');
	    squareEl.className = `sk-cube sk-cube${idx + 1}`;
	    thinkingEl.appendChild(squareEl);
	  });

	  document.querySelector('body').appendChild(thinkingEl);
	  return thinkingEl;
	};

	Visualizer.prototype.displayNumberPicker = function() {
	  this.titleSpace.html('ok, pick a number');
	  let digitsBox = document.createElement('div');
	  digitsBox.id = 'digits-box';
	  digitsBox.className = 'visual-box center';

	  for (let i = 0; i < 10; i++) {
	    let digit = document.createElement('div');
	    digit.className = 'digit hoverable';
	    digit.id = i; digit.innerHTML = i;
	    $(digit).on('click', this.pick.bind(this));
	    digitsBox.appendChild(digit);
	  }

	  this.workSpace.append(digitsBox);
	};

	Visualizer.prototype.pick = function(event) {
	  let digit = parseInt(event.target.id);
	  let digitCSV = this.testDigits[digit];
	  this.neuralNetwork.interpret(digitCSV);
	  this.neuralNetwork.prepSample(20, 15);
	  this.displayCSV(digit, digitCSV);
	};

	Visualizer.prototype.displayCSV = function(digit, digitCSV) {
	  let CSVBox = document.createElement('div');
	  CSVBox.className = 'visual-box hidden';
	  CSVBox.id = 'csv-box';

	  let digitEl = document.createElement('div');
	  digitEl.id = 'digit';
	  digitEl.innerHTML = digit;

	  let equalsEl = document.createElement('div');
	  equalsEl.id = 'equals';

	  let colorFunc = function(pixelVal) {
	    return Math.floor(255 - pixelVal);
	  };
	  let csvEl = Visualizer.makeCSVEl(digitCSV.slice(2, digitCSV.length), colorFunc);

	  let coolEl = this.makeNextButton('Cool', this.showScaledCSV);

	  Visualizer.injectElements(CSVBox, digitEl, equalsEl, csvEl);
	  this.headerSpace.append(coolEl);
	  this.workSpace.append(CSVBox);

	  this.titleSpace.html('we break each image down into greyscale values between 0 and 255');
	  this.slideAndHide(document.getElementById('digits-box'));
	  setTimeout(() => CSVBox.className = 'visual-box center', 0);
	};

	Visualizer.prototype.showScaledCSV = function() {
	  Visualizer.removeNextButton();

	  let scaledCSVBox = document.createElement('div');
	  scaledCSVBox.id = 'csv-box';
	  scaledCSVBox.className = 'visual-box hidden';

	  let colorFunc = function(pixelVal) {
	    return Math.floor(255 - (255 * pixelVal));
	  };
	  let scaledCSV = this.neuralNetwork.inputs.toArray().map( x => Math.floor(x * 100) / 100 ).join(',');
	  let scaledCSVEl = Visualizer.makeCSVEl(scaledCSV, colorFunc);

	  let groovyEl = this.makeNextButton('Groovy', this.displayInputNodes);

	  Visualizer.injectElements(scaledCSVBox, scaledCSVEl);
	  this.headerSpace.append(groovyEl);

	  this.titleSpace.html('each value is scaled between 0 and 1 (exclusive)');
	  this.workSpace.append(scaledCSVBox);
	  this.fadeAndHide(document.getElementById('csv-box'));
	  setTimeout(() => scaledCSVBox.className = 'visual-box center', 0);
	};

	Visualizer.prototype.displayInputNodes = function() {
	  Visualizer.removeNextButton();
	  let inputNodesBox = document.createElement('div');
	  inputNodesBox.id = 'input-nodes-box';
	  inputNodesBox.className = 'visual-box hidden';

	  let inputNodesList = document.createElement('div');
	  inputNodesList.className = 'node-list';
	  let sampleNodeVals = this.neuralNetwork.sampleInputs;

	  for(let i = 0; i < 20; i++) {
	    let nodeEl = document.createElement('div');
	    nodeEl.className = 'input node';
	    nodeEl.id = `i${i}`;
	    let inputValue = document.createElement('p');
	    inputValue.innerHTML = Math.floor(sampleNodeVals[i] * 100) / 100;
	    let color = 200 - Math.floor(sampleNodeVals[i] * 200);
	    $(nodeEl).attr('style', `background-color:rgb(${color},${color},${color})`);
	    nodeEl.appendChild(inputValue);
	    inputNodesList.appendChild(nodeEl);
	  }

	  let radEl = this.makeNextButton('Rad', this.displayHiddenNodes);

	  Visualizer.injectElements(inputNodesBox, inputNodesList);
	  this.workSpace.append(inputNodesBox);
	  this.headerSpace.append(radEl);

	  this.titleSpace.html('each value is mapped to an input node \n(here\'s a small sample)');
	  this.fadeAndHide(document.getElementById('csv-box'));
	  setTimeout(() => inputNodesBox.className = 'visual-box center', 0);
	};

	Visualizer.prototype.displayHiddenNodes = function() {
	  $('p').remove();
	  Visualizer.removeNextButton();

	  let hiddenNodesBox = document.createElement('div');
	  hiddenNodesBox.id = 'hidden-nodes-box';
	  hiddenNodesBox.className = 'visual-box hidden';

	  let hiddenNodesList = document.createElement('div');
	  hiddenNodesList.className = 'node-list';

	  for(let i = 0; i < 15; i ++) {
	    let nodeEl = document.createElement('div');
	    nodeEl.className = 'hidden node';
	    nodeEl.id = `h${i}`;
	    $(nodeEl).attr('style', 'background-color:#FFFFFF;border:1px solid black');
	    hiddenNodesList.appendChild(nodeEl);
	  }

	  let dopeEl = this.makeNextButton('Dope', this.fireInputNodes);

	  Visualizer.injectElements(hiddenNodesBox, hiddenNodesList);
	  this.workSpace.append(hiddenNodesBox);
	  this.headerSpace.append(dopeEl);

	  this.connectLayers('input', 'hidden', this.neuralNetwork.sampleWIH);

	  this.titleSpace.html('the input layer is connected to a second layer of nodes via weighted connections');
	  document.getElementById('input-nodes-box').className = 'visual-box top';
	  setTimeout(() => hiddenNodesBox.className = 'visual-box center', 0);
	};


	Visualizer.prototype.fireInputNodes = function() {
	  Visualizer.removeNextButton();
	  let awesomeEl = this.makeNextButton('Awesome', this.sigmoidHiddenNodes);

	  let hiddenInputs = this.neuralNetwork.sampleHiddenInputs;
	  let selection = $('.node.hidden');
	  let i = 0;

	  let firing = setInterval( () => {
	    $(selection[i - 1]).trigger('mouseout');
	    if (i === selection.length) {
	      window.clearInterval(firing);
	      this.headerSpace.append(awesomeEl);
	    }
	    let value = document.createElement('p');
	    value.innerHTML = (Math.floor(hiddenInputs[i] * 100) / 100);
	    let color = Math.floor(hiddenInputs[i] * 360) + 160;
	    $(selection[i]).trigger('mouseover');
	    $(selection[i]).attr('style', `background-color:rgb(240,${color},75)`);
	    selection[i].appendChild(value);
	    i++;
	  }, 300);


	  this.titleSpace.html('each node in the second layer sums the weighted inputs from the first layer');
	};

	Visualizer.prototype.sigmoidHiddenNodes = function() {
	  Visualizer.removeNextButton();

	  let hiddenOutputs = this.neuralNetwork.sampleHiddenOutputs;

	  $('.node.hidden').each( (idx, node) => {
	    node.children[0].innerHTML = Math.floor(hiddenOutputs[idx] * 100) / 100;
	  });

	  let niceEl = this.makeNextButton('Nice', this.showOutputNodes);
	  this.headerSpace.append(niceEl);

	  this.titleSpace.html('each value is then scaled between 0 and 1 using the sigmoid function');
	};

	Visualizer.prototype.showOutputNodes = function() {
	  Visualizer.removeNextButton();
	  $('p').remove();

	  let outputNodesBox = document.createElement('div');
	  outputNodesBox.id = 'output-nodes-box';
	  outputNodesBox.className = 'visual-box hidden';

	  let outputNodesList = document.createElement('div');
	  outputNodesList.className = 'node-list';

	  for(let i = 0; i < 10; i ++) {
	    let nodeEl = document.createElement('div');
	    nodeEl.className = 'output node';
	    nodeEl.id = `o${i}`;
	    $(nodeEl).attr('style', 'background-color:#FFFFFF;border:1px solid black');
	    outputNodesList.appendChild(nodeEl);
	  }

	  let swellEl = this.makeNextButton('Swell', this.fireHiddenNodes);

	  Visualizer.injectElements(outputNodesBox, outputNodesList);
	  this.workSpace.append(outputNodesBox);
	  this.headerSpace.append(swellEl);

	  this.connectLayers('hidden', 'output', this.neuralNetwork.sampleWHO);

	  this.titleSpace.html('a third and final layer of nodes is connected to the second');
	  setTimeout(() => outputNodesBox.className = 'visual-box bottom', 0);
	};


	Visualizer.prototype.fireHiddenNodes = function() {
	  Visualizer.removeNextButton();
	  let stellarEl = this.makeNextButton('Stellar', this.sigmoidOutputNodes);

	  let finalInputs = this.neuralNetwork.finalInputs.toArray();
	  let selection = $('.node.output');
	  let i = 0;

	  let firing = setInterval( () => {
	    $(selection[i - 1]).trigger('mouseout');
	    if (i === selection.length) {
	      window.clearInterval(firing);
	      this.headerSpace.append(stellarEl);
	    }
	    let value = document.createElement('p');
	    value.innerHTML = (Math.floor(finalInputs[i] * 100) / 100);
	    let color = Math.floor(finalInputs[i] * 360) + 160;
	    $(selection[i]).trigger('mouseover');
	    $(selection[i]).attr('style', `background-color:rgb(240,${color},75)`);
	    selection[i].appendChild(value);
	    i++;
	  }, 300);

	  this.titleSpace.html('each node in the third layer sums the weighted inputs from the second layer');
	};

	Visualizer.prototype.sigmoidOutputNodes = function() {
	  Visualizer.removeNextButton();

	  let finalOutputs = this.neuralNetwork.finalOutputs.toArray();

	  $('.node.output').each( (idx, node) => {
	    node.children[0].innerHTML = Math.floor(finalOutputs[idx] * 100) / 100;
	  });

	  let fantasticEl = this.makeNextButton('Fantastic', this.clearTopLayers.bind(this));
	  this.headerSpace.append(fantasticEl);

	  this.titleSpace.html('again, each value is scaled between 0 and 1 using the sigmoid function');
	};

	Visualizer.prototype.clearTopLayers = function() {
	  Visualizer.removeNextButton();

	  this.slideAndHide(document.getElementById('input-nodes-box'));
	  this.slideAndHide(document.getElementById('hidden-nodes-box'), this.showAnswer);
	  $('.node.output').off();
	  $('#output-nodes-box').attr('class', 'visual-box center');
	};

	Visualizer.prototype.showAnswer = function() {
	  let digits = document.createElement('div');
	  digits.id = 'answer-digits';
	  let digitY = $('#output-nodes-box').get(0).getBoundingClientRect().bottom;

	  [...Array(10).keys()].forEach( idx => {
	    let digit = document.createElement('div');
	    digit.className = 'answer-digit';
	    digit.innerHTML = idx;
	    let digitX = $(`#o${idx}`).get(0).getBoundingClientRect().left;
	    $(digit).attr('style', `top:${digitY}px;left:${digitX}px`);
	    digits.appendChild(digit);
	  });

	  let chosenDigit = this.neuralNetwork.chosenDigit;
	  let chosenNodeCoords = this.answerNode().get(0).getBoundingClientRect();
	  let chosenX = chosenNodeCoords.left;
	  let chosenY = chosenNodeCoords.top;

	  let arrowBox = document.createElement('div');
	  arrowBox.id = 'arrow-box';
	  let arrowEl = document.createElement('div');
	  arrowEl.className = 'arrow';
	  arrowEl.innerHTML = `I think that was a ${chosenDigit}`;
	  arrowBox.appendChild(arrowEl);
	  $(arrowBox).attr('style', `top:${chosenY}px;left:${chosenX}px;transform:translateY(-200%) translateX(-40%)`);

	  let againEl = this.makeNextButton('Again!', this.reset.bind(this));

	  $('body').append(digits);
	  $('body').append(arrowBox);
	  this.headerSpace.append(againEl);
	  this.titleSpace.html('in a properly trained neural network, one node fires significantly more than the rest');
	};

	Visualizer.prototype.reset = function() {
	  $('.weights-matrix').remove();
	  $('#arrow-box').remove();
	  $('#answer-digits').remove();
	  $('#output-nodes-box').remove();
	  $('.next-button').remove();

	  this.displayNumberPicker();
	};

	Visualizer.prototype.answerNode = function() {
	  let answer = this.neuralNetwork.chosenDigit;
	  return $(`#o${answer}`);
	};

	Visualizer.makeCSVEl = function(csv, colorFunc) {
	  csv = csv.split(",");
	  let csvEl = document.createElement('div');
	  csvEl.className = "csv-box";

	  let row = document.createElement('div');
	  row.className = 'csv-row';
	  csv.forEach( (pixelVal, i) => {
	    if (i % 28 === 0 && i > 0) {
	      csvEl.appendChild(row);
	      row = document.createElement('div');
	      row.className = "csv-row";
	    }

	    pixelVal = Math.floor(parseFloat(pixelVal) * 100) / 100;
	    let rowItem = document.createElement('div');
	    rowItem.className = "csv-row-item";
	    rowItem.innerHTML = pixelVal;
	    let bgColor = colorFunc(parseFloat(pixelVal));
	    let color = (bgColor < 200) ? '#FFFFFF' : '#000000';
	    $(rowItem).attr('style', `background-color:rgb(${bgColor},${bgColor},${bgColor});color:${color}`);
	    row.appendChild(rowItem);
	  });

	  return csvEl;
	};

	Visualizer.prototype.connectLayers = function(firstClass, secondClass, weightsMatrix) {
	  let weightsEl = d3.select('body').append('svg');
	  weightsEl.attr('class', 'weights-matrix');

	  $(`.node.${firstClass}`).each( (idxI, nodeI) => {
	    $(nodeI).hover(this.drawPaths, this.hidePaths);

	    $(`.node.${secondClass}`).each( (idxJ, nodeJ) => {
	      $(nodeJ).hover(this.drawPaths, this.hidePaths);

	      let color = Math.floor(weightsMatrix.get(idxJ, idxI) * 360) + 160;

	      let path = weightsEl.append('line')
	        .attr('stroke-width', 4)
	        .attr('stroke', `rgb(240,${color},75)`)
	        .data([`${firstClass[0]}${idxI} ${secondClass[0]}${idxJ}`]).enter();
	    });
	  });
	};

	Visualizer.prototype.drawPaths = function(event) {
	  let source = event.target;
	  if (source.id === '' ) { source = source.parentElement; }
	  let x1 = source.getBoundingClientRect().left + ($(source).width() / 2);
	  let y1 = source.getBoundingClientRect().bottom - ($(source).height() / 2);

	  let regexp = new RegExp('\\b(' + source.id + ')\\b');
	  let paths = d3.selectAll('line').filter( d => d.match(regexp) );
	  paths.each( (d, i, paths) => {
	    let targetId = d.split(' ').filter( el => el !== source.id)[0];
	    let target = $(`#${targetId}`)[0];

	    let x2 = target.getBoundingClientRect().left + ($(target).width() / 2);
	    let y2 = target.getBoundingClientRect().top + ($(target).height() / 2);
	    d3.select(paths[i]).attr('x1', x1).attr('y1', y1).attr('x2', x2).attr('y2', y2).attr('stroke-width', 4);
	  });
	};

	Visualizer.prototype.hidePaths = function(event) {
	  let source = event.target;
	  if (source.id === '' ) { source = source.parentElement; }

	  let regexp = new RegExp('\\b(' + source.id + ')\\b');
	  let paths = d3.selectAll('line').filter( d => d.match(regexp) );
	  paths.each( (d, i, paths) => {
	    d3.select(paths[i]).attr('stroke-width', 0);
	  });
	};

	Visualizer.prototype.slideAndHide = function(el, callback) {
	  el.className = 'visual-box off-screen';

	  setTimeout(() => {
	    el.remove();

	    if (callback !== undefined) {
	      callback.call(this);
	    }
	  }, 1000);
	};

	Visualizer.prototype.fadeAndHide = function(el, callback) {
	  el.className = 'visual-box hidden';

	  setTimeout(() => {
	    el.remove();

	    if (callback !== undefined) {
	      callback.call(this);
	    }
	  }, 1000);
	};

	Visualizer.prototype.makeNextButton = function(buttonText, callback) {
	  let button = document.createElement('h1');
	  button.className = 'next-button hoverable';
	  button.id = `${buttonText.toLowerCase()}`;
	  button.innerHTML = buttonText;
	  $(button).on('click', callback.bind(this));
	  return button;
	};

	Visualizer.removeNextButton = function() {
	  $('.next-button').remove();
	};

	Visualizer.injectElements = function(parent, ...children) {
	  children.forEach(child => parent.appendChild(child));
	};

	module.exports = Visualizer;


/***/ }
/******/ ]);