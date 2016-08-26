/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
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
	
	    let vizy = new Visualizer('#header', '#work-space', netty, trainingData, testData);
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
	const Text = __webpack_require__ (5);
	
	const Visualizer = function(headerQuery, workSpaceQuery, neuralNetwork, trainingData, testData) {
	  this.headerSpace = $(headerQuery);
	  this.workSpace = $(workSpaceQuery);
	  this.neuralNetwork = neuralNetwork;
	  this.testDigits = testData.split(/\r?\n/);
	
	  this.displayIntro();
	  // this.removeLoader();
	  setTimeout(() => this.neuralNetwork.learn(trainingData, this.removeLoader.bind(this)), 5000);
	};
	
	Visualizer.prototype.drawLoader = function() {
	  let training = document.createElement("div");
	  training.id = "training";
	  training.className = "sk-cube-grid";
	
	  [...Array(9).keys()].forEach( idx => {
	    let squareEl = document.createElement("div");
	    squareEl.className = `sk-cube sk-cube${idx + 1}`;
	  training.appendChild(squareEl);
	  });
	
	  $('body').append(training);
	};
	
	Visualizer.prototype.removeLoader = function() {
	  $('#training').remove();
	
	  let onward = this.nextButton(this.displayNumberPicker.bind(this), 'onward');
	  $('body').append(onward);
	};
	
	Visualizer.prototype.displayIntro = function() {
	  let intro = document.createElement('div');
	  intro.id = 'intro';
	
	  intro.innerHTML = Text.intro;
	
	  this.drawLoader();
	  this.workSpace.append(intro);
	};
	
	Visualizer.prototype.displayNumberPicker = function() {
	  $('#intro').remove();
	  Visualizer.removeNextButton();
	
	  let digitsBox = document.createElement('div');
	  digitsBox.id = 'digits-box';
	  digitsBox.className = 'visual-box center';
	
	  for (let i = 0; i < 10; i++) {
	    let digit = document.createElement('div');
	    digit.className = 'digit hoverable';
	    digit.id = i; digit.innerHTML = i;
	    $(digit).on('click', this.pickDigit.bind(this));
	    digitsBox.appendChild(digit);
	  }
	
	  let draw = document.createElement('div');
	  draw.id = 'draw-button';
	  draw.className = 'digit hoverable';
	  draw.innerHTML = 'Draw One!';
	  $(draw).on('click', this.drawNewImage.bind(this));
	  digitsBox.appendChild(draw);
	
	  this.titleSpace = document.createElement('h3');
	  this.titleSpace.id = "title";
	  this.titleSpace.innerHTML = Text.header1;
	  this.headerSpace.append(this.titleSpace);
	  this.workSpace.append(digitsBox);
	};
	
	Visualizer.prototype.drawNewImage = function() {
	  let csv = new Array(784).fill(0).join(',');
	
	  window.mouseDown = 0;
	  document.body.onmousedown = function() {
	    window.mouseDown++;
	  };
	  document.body.onmouseup = function() {
	    window.mouseDown--;
	  };
	
	  this.drawImage(csv,
	    Visualizer.greyscaleMap255(),
	    Visualizer.drawPixel,
	    function(){}
	  );
	
	  this.headerSpace.append(this.nextButton(this.submitImage.bind(this), 'submit'));
	  this.titleSpace.innerHTML = Text.header1_5;
	  $('#digits-box').remove();
	};
	
	Visualizer.prototype.submitImage = function(event) {
	  Visualizer.removeNextButton();
	
	  let csv = d3.selectAll('rect').data();
	  this.centerImage(csv);
	  let newCsv = d3.selectAll('rect').data();
	  newCsv = 'x,' + newCsv.join(',');
	
	  this.neuralNetwork.interpret(newCsv);
	  this.neuralNetwork.prepSample(20, 15);
	
	  this.displayCSV(newCsv);
	};
	
	Visualizer.prototype.pickDigit = function(event) {
	  $('#digits-box').remove();
	
	  let csv = this.testDigits[parseInt(event.target.id)];
	
	  this.neuralNetwork.interpret(csv);
	  this.neuralNetwork.prepSample(20, 15);
	
	  this.displayCSV(csv);
	};
	
	Visualizer.prototype.displayCSV = function(csv) {
	  if( $('#csv-box')) { $('#csv-box').remove(); }
	
	  this.drawImage(csv.slice(2, csv.length),
	    Visualizer.greyscaleMap255(),
	    Visualizer.floatValue,
	    Visualizer.removeFloat
	  );
	
	  this.headerSpace.append(this.nextButton(this.displayScaledCSV));
	  this.titleSpace.innerHTML = Text.header2;
	};
	
	Visualizer.prototype.displayScaledCSV = function() {
	  Visualizer.removeNextButton();
	  $('#csv-box').remove();
	
	  let scaledCSV = this.neuralNetwork.inputs.toArray().map( x => Math.floor(x * 100) / 100 ).join(',');
	
	  this.drawImage(scaledCSV,
	    Visualizer.greyscaleMap1(),
	    Visualizer.floatValue,
	    Visualizer.removeFloat
	  );
	
	  this.headerSpace.append(this.nextButton(this.displayInputNodes));
	  this.titleSpace.innerHTML = Text.header3;
	};
	
	
	Visualizer.prototype.displayInputNodes = function() {
	  Visualizer.removeNextButton();
	  $('#csv-box').remove();
	
	  let inputNodesBox = document.createElement('div');
	  inputNodesBox.id = 'input-nodes-box';
	  inputNodesBox.className = 'visual-box hide';
	
	  let inputNodesList = document.createElement('div');
	  inputNodesList.className = 'node-list';
	  let sampleNodeVals = this.neuralNetwork.sampleInputs;
	  const greyscaleMap = d3.scaleLinear()
	                          .domain([0.01, 0.99])
	                          .range(["#F5F5F5", "#262626"]);
	
	  for(let i = 0; i < 20; i++) {
	    let node = document.createElement('div');
	    node.className = 'input node';
	    node.id = `i${i}`;
	    let bgColor = greyscaleMap(sampleNodeVals[i]);
	    let color = (sampleNodeVals[i] < 0.50) ? ('rgb(0,0,0)') : ('rgb(255,255,255)');
	    $(node).attr('style', `background-color:${bgColor};color:${color}`);
	
	    let inputValue = document.createElement('p');
	    inputValue.innerHTML = Math.floor(sampleNodeVals[i] * 100) / 100;
	    node.appendChild(inputValue);
	    inputNodesList.appendChild(node);
	  }
	
	  inputNodesBox.appendChild(inputNodesList);
	  this.workSpace.append(inputNodesBox);
	  this.headerSpace.append(this.nextButton(this.displayHiddenNodes));
	
	  this.titleSpace.innerHTML = Text.header4;
	  setTimeout(() => inputNodesBox.className = 'visual-box center', 0);
	};
	
	Visualizer.prototype.displayHiddenNodes = function() {
	  $('p').remove();
	  Visualizer.removeNextButton();
	
	  let hiddenNodesBox = document.createElement('div');
	  hiddenNodesBox.id = 'hidden-nodes-box';
	  hiddenNodesBox.className = 'visual-box hide';
	
	  let hiddenNodesList = document.createElement('div');
	  hiddenNodesList.className = 'node-list';
	
	  for(let i = 0; i < 15; i ++) {
	    let node = document.createElement('div');
	    node.className = 'hidden node';
	    node.id = `h${i}`;
	    $(node).attr('style', 'background-color:#FFFFFF;border:1px solid black');
	    hiddenNodesList.appendChild(node);
	  }
	
	  hiddenNodesBox.appendChild(hiddenNodesList);
	  this.workSpace.append(hiddenNodesBox);
	
	  let sigmoidCallback = this.sigmoidNodes.bind(this,
	    this.neuralNetwork.sampleHiddenOutputs,
	    $('.node.hidden'),
	    this.displayOutputNodes,
	    Text.header7
	  );
	
	  let fireCallback = this.fireNodes.bind(this,
	    this.neuralNetwork.sampleHiddenInputs,
	    this.neuralNetwork.sampleHiddenOutputs,
	    $('.node.hidden'),
	    sigmoidCallback,
	    Text.header6
	  );
	
	  this.headerSpace.append(this.nextButton(fireCallback));
	
	  this.connectLayers('input', 'hidden', this.neuralNetwork.sampleWIH);
	
	  this.titleSpace.innerHTML = Text.header5;
	  document.getElementById('input-nodes-box').className = 'visual-box top';
	  setTimeout(() => hiddenNodesBox.className = 'visual-box center', 0);
	};
	
	Visualizer.prototype.sigmoidNodes = function(outputVals, nodeSelection, nextCallback, text) {
	  Visualizer.removeNextButton();
	
	  nodeSelection.each( (idx, node) => {
	    node.children[0].innerHTML = Math.floor(outputVals[idx] * 100) / 100;
	  });
	
	  this.headerSpace.append(this.nextButton(nextCallback));
	  this.titleSpace.innerHTML = text;
	};
	
	Visualizer.prototype.displayOutputNodes = function() {
	  Visualizer.removeNextButton();
	  $('p').remove();
	
	  let outputNodesBox = document.createElement('div');
	  outputNodesBox.id = 'output-nodes-box';
	  outputNodesBox.className = 'visual-box hide';
	
	  let outputNodesList = document.createElement('div');
	  outputNodesList.className = 'node-list';
	
	  for(let i = 0; i < 10; i ++) {
	    let node = document.createElement('div');
	    node.className = 'output node';
	    node.id = `o${i}`;
	    $(node).attr('style', 'background-color:#FFFFFF;border:1px solid black');
	    outputNodesList.appendChild(node);
	  }
	
	  outputNodesBox.appendChild(outputNodesList);
	  this.workSpace.append(outputNodesBox);
	
	  let sigmoidCallback = this.sigmoidNodes.bind(this,
	    this.neuralNetwork.finalOutputs.toArray(),
	    $('.node.output'),
	    this.clearTopLayers.bind(this),
	    Text.header10
	  );
	
	  let fireCallback = this.fireNodes.bind(this,
	    this.neuralNetwork.finalInputs.toArray(),
	    this.neuralNetwork.finalOutputs.toArray(),
	    $('.node.output'),
	    sigmoidCallback,
	    Text.header9
	  );
	
	  this.headerSpace.append(this.nextButton(fireCallback));
	
	  this.connectLayers('hidden', 'output', this.neuralNetwork.sampleWHO);
	
	  this.titleSpace.innerHTML = Text.header8;
	  setTimeout(() => outputNodesBox.className = 'visual-box bottom', 0);
	};
	
	Visualizer.prototype.clearTopLayers = function() {
	  Visualizer.removeNextButton();
	  $('#input-nodes-box').remove();
	  $('#hidden-nodes-box').remove();
	  $('.node.output').off();
	  $('#output-nodes-box').attr('class', 'visual-box center');
	  setTimeout(() => this.displayAnswer(), 300);
	};
	
	Visualizer.prototype.displayAnswer = function() {
	  this.headerSpace.append(this.nextButton(this.reset.bind(this), 'again!'));
	  this.titleSpace.innerHTML = Text.header11;
	
	  let digits = document.createElement('div');
	  digits.id = 'answer-digits';
	  digits.className = 'hide';
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
	  arrowBox.className = 'hide';
	  let arrow = document.createElement('div');
	  arrow.className = 'arrow';
	  let article = (chosenDigit == 8) ? ('an') : ('a');
	  arrow.innerHTML = `I think that was ${article} ${chosenDigit}`;
	  arrowBox.appendChild(arrow);
	  $(arrowBox).attr('style', `top:${chosenY}px;left:${chosenX}px;transform:translateY(-200%) translateX(-40%)`);
	
	  $('body').append(digits);
	  $('body').append(arrowBox);
	  setTimeout(() => digits.className = '', 10);
	  setTimeout(() => arrowBox.className = '', 10);
	};
	
	Visualizer.prototype.reset = function() {
	  $('.weights-matrix').remove();
	  $('#arrow-box').remove();
	  $('#answer-digits').remove();
	  $('#output-nodes-box').remove();
	  $('.next-button').remove();
	  this.titleSpace.remove();
	
	  this.displayNumberPicker();
	};
	
	Visualizer.prototype.answerNode = function() {
	  let answer = this.neuralNetwork.chosenDigit;
	  return $(`#o${answer}`);
	};
	
	Visualizer.prototype.drawImage = function(csv, colorFunc, mouseOverFunc, mouseOutFunc) {
	  csv = csv.split(",").map( val => parseFloat(val) );
	  let image = d3.select('#work-space')
	                  .append("svg")
	                  .attr("height", 450)
	                  .attr("width", 300)
	                  .attr("id", 'csv-box');
	
	  let xFunc = function(d, i) {
	    return (12 * (i % 28));
	  };
	  let yFunc = function(d, i) {
	    return (16*Math.floor(i / 28));
	  };
	  image.selectAll('rect')
	      .data(csv)
	      .enter()
	      .append('rect')
	      .attr('class', 'pixel')
	      .attr("x", (d, i) => xFunc(d, i))
	      .attr("y", (d, i) => yFunc(d, i))
	      .attr("height", 16)
	      .attr("width", 12)
	      .style("fill", d => colorFunc(d))
	      .on('mouseover', (d, i, rect) => mouseOverFunc(d, i, rect))
	      .on('mouseout', (d, i, rect) => mouseOutFunc(d, i, rect));
	};
	
	Visualizer.floatValue = function(d, i, rect) {
	  d3.select(rect[i]).attr('stroke-width', 2).attr('width', 11).attr('height', 15).attr('stroke', '#FF3333');
	  let text = document.createElement('div');
	  text.innerHTML = d;
	  text.className = 'value-callout';
	  $('#work-space').append(text);
	};
	
	Visualizer.removeFloat = function(d, i, rect) {
	  d3.select(rect[i]).attr('stroke-width', 0).attr('width', 12).attr('height', 16);
	  $('.value-callout').remove();
	};
	
	Visualizer.drawPixel = function(d, i, rect) {
	  if (window.mouseDown === 0) { return; }
	
	  let color = Math.floor(Math.random() * 30);
	  d3.select(rect[i])
	  .style('fill', `rgb(${color},${color},${color})`)
	  .data([ 255 - color ]);
	};
	
	Visualizer.prototype.connectLayers = function(firstClass, secondClass, weightsMatrix) {
	  let weights = d3.select('body').append('svg');
	  weights.attr('class', 'weights-matrix');
	
	  let scale = d3.scaleLinear().domain([-0.5, 0.5]).range([0, 1]);
	  $(`.node.${firstClass}`).each( (idxI, nodeI) => {
	    $(nodeI).hover(this.drawPaths, this.hidePaths);
	
	    $(`.node.${secondClass}`).each( (idxJ, nodeJ) => {
	      $(nodeJ).hover(this.drawPaths, this.hidePaths);
	
	      let color = d3.interpolateInferno(scale(weightsMatrix.get(idxJ, idxI)));
	      let path = weights.append('line')
	        .attr('stroke-width', 4)
	        .attr('stroke', color)
	        .data([{ node1: nodeI.id, node2: nodeJ.id }]);
	    });
	  });
	};
	
	Visualizer.prototype.drawPaths = function(event) {
	  let source = event.target;
	  if (source.id === '' ) { source = source.parentElement; }
	  let x1 = source.getBoundingClientRect().left + ($(source).width() / 2);
	  let y1 = source.getBoundingClientRect().bottom - ($(source).height() / 2);
	
	  let paths = d3.selectAll('line').filter( d =>
	    (d.node1 === source.id  || d.node2 === source.id)
	  );
	
	  paths.each( (d, i, paths) => {
	    let targetId = (d.node1 === source.id) ? (d.node2) : (d.node1);
	    let target = $(`#${targetId}`)[0];
	
	    let x2 = target.getBoundingClientRect().left + ($(target).width() / 2);
	    let y2 = target.getBoundingClientRect().top + ($(target).height() / 2);
	    d3.select(paths[i]).attr('x1', x1).attr('y1', y1).attr('x2', x2).attr('y2', y2).attr('stroke-width', 4);
	  });
	};
	
	Visualizer.prototype.hidePaths = function(event) {
	  let source = event.target;
	  if (source.id === '' ) { source = source.parentElement; }
	
	  let paths = d3.selectAll('line').filter( d =>
	    (d.node1 === source.id  || d.node2 === source.id)
	  );
	
	  paths.each( (d, i, paths) => {
	    d3.select(paths[i]).attr('stroke-width', 0);
	  });
	};
	
	Visualizer.prototype.fireNodes = function(inputVals, outputVals, nodeSelection, nextCallback, title) {
	  Visualizer.removeNextButton();
	  let next = this.nextButton(nextCallback);
	  let i = 0;
	
	  let firing = setInterval( () => {
	    $(nodeSelection[i - 1]).trigger('mouseout');
	
	    if (i === nodeSelection.length) {
	      window.clearInterval(firing);
	      this.headerSpace.append(next);
	    } else {
	      let value = document.createElement('p');
	      value.innerHTML = (Math.floor(inputVals[i] * 100) / 100);
	      let color = d3.interpolateInferno(outputVals[i]);
	
	      $(nodeSelection[i]).trigger('mouseover');
	      $(nodeSelection[i]).attr('style', `background-color:${color}`);
	      nodeSelection[i].appendChild(value);
	    }
	
	    i++;
	  }, 300);
	
	  this.titleSpace.innerHTML = title;
	};
	
	Visualizer.prototype.centerImage = function(csv) {
	  let xSum = 0, ySum = 0;
	
	  csv.forEach( (val, i) => {
	    let x = i % 28 - 14;
	    let y = Math.floor(i / 28) - 14;
	    xSum += val * x;
	    ySum += val * y;
	  });
	
	  xCenter = Math.floor((xSum / csv.length) / 255);
	  yCenter = Math.floor((ySum / csv.length) / 255);
	
	  newCSV = [];
	
	  d3.selectAll('rect').each( (d, i, rect) => {
	    let newX =  i % 28 + xCenter;
	    let newY = Math.floor(i / 28) + yCenter;
	    let newI = newY * 28 + newX;
	    let color = (newI < 0 || newI > 783) ? (0) : (d3.select(rect[newI]).data()[0]);
	    newCSV[i] = color;
	  });
	
	  $('#csv-box').remove();
	
	  this.drawImage(newCSV.join(','),
	    Visualizer.greyscaleMap255(),
	    function() {},
	    function() {}
	  );
	};
	
	Visualizer.greyscaleMap255 = function() {
	  return d3.scaleLinear()
	            .domain([0, 255])
	            .range(["#FFFFFF", "#000000"]);
	};
	
	Visualizer.greyscaleMap1 = function() {
	  return d3.scaleLinear()
	            .domain([0.01, 0.99])
	            .range(["#FFFFFF", "#000000"]);
	};
	
	Visualizer.prototype.nextButton = function(callback, buttonText) {
	  buttonText = (buttonText === undefined) ? ('cool') : (buttonText);
	  let button = document.createElement('h3');
	  button.className = 'next-button hoverable';
	  button.id = `${buttonText.toLowerCase()}`;
	  button.innerHTML = buttonText;
	  $(button).on('click', callback.bind(this));
	  return button;
	};
	
	Visualizer.removeNextButton = function() {
	  $('.next-button').remove();
	};
	
	module.exports = Visualizer;


/***/ },
/* 5 */
/***/ function(module, exports) {

	const Text = {
	  intro: "Hi, I'm a neural network. I'm going to show you how I identify handwritten numbers. Before we begin, let me tell you a bit about myself. Fundamentally I'm just a bunch of connected \"nodes\". Each node knows two things: it's own number value and its children nodes. Every node has the ability to \"fire\", at which point the node's value is transmitted to all child nodes. Not all connections are equal, though. Some are weighted more heavily than others.<br><br>\
	  \
	  My nodes are organized into three layers. The first layer is for taking in information, in my case pixel data, and it's by far the largest with about 800 nodes. The second layer is much smaller at 100 nodes, and it serves to aggregate firing from the first layer. My final layer has exactly 10 nodes, and each one corresponds to a digit zero through nine. After a little training (it's happening right now!) I adjust the connections between nodes so that one node in the final layer wins out, and that's my guess at which digit I'm looking at. Sounding a little abstract? Perfect! That's why I'm here. Onward!",
	
	  header1: "First you'll need to pick a number.",
	
	  header1_5: "Click and drag to draw your digit. Write big!",
	
	  header2: "Great, here's your image. It has 784 pixels (28x28), each with a greyscale value. <br>\
	  Hover over a pixel's to see its value.",
	
	  header3: "I like values between 0 and 1, so I've scaled each pixel value. Hover again!",
	
	  header4: "For each of the 784 pixels, I have a node in my first layer.<br>\
	  Each node takes in a single pixel's value. Here's a small sample.",
	
	  header5: "I have 100 nodes in my second layer, so again this is just a sample. Hover over a node to see its connections.<br>\
	  Connection are weighted between 0.5 and -0.5, visualized as a yellow-orange-red-blue scale.",
	
	  header6: "Fire! Each node in the second layer sums the weighted inputs from the first layer.",
	
	  header7: "To keep me in my happy place, I've scaled everything between 0 and 1 again.",
	
	  header8: "Alright, let's bring out the third and final layer. Hover to see those connections.",
	
	  header9: "Fire! Just like last time, each node sums its inputs.",
	
	  header10: "One more time, I'll scale everything down.",
	
	  header11: "See how one node stands out? All that chatter between nodes in the first two layers had the effect of activating that one node in the final layer and silencing the rest."
	
	};
	
	module.exports = Text;


/***/ }
/******/ ]);
//# sourceMappingURL=bundle.js.map