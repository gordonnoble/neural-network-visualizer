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

	// const Canvas = require('./visualization/canvas.js');
	const NeuralNetwork = __webpack_require__(1);
	const Visualizer = __webpack_require__(5);

	document.addEventListener("DOMContentLoaded",
	  () => {
	    let trainingData = document.getElementById('training-data').innerHTML;
	    let testData = document.getElementById('test-data').innerHTML;
	    let netty = new NeuralNetwork(784, 100, 10, 0.1);
	    // netty.learn(trainingData);

	    let canvasEl = document.getElementById('canvas');
	    let headerEl = document.getElementById('canvas-header');
	    let visualizationEl = document.getElementById('visualization');

	    let vizy = new Visualizer(canvasEl, headerEl, visualizationEl, netty, testData);
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
	  this.count = 0;

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
	  this.count++;
	  console.log(this.count);
	};

	NeuralNetwork.prototype.learn = function(data) {
	  let trainingDigits = data.split(/\r?\n/);

	  // let i = 0;
	  // while (i < 5) {
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
	  //   i++;
	  // }
	};

	NeuralNetwork.prototype.interpret = function(digitCSV) {
	  let allValues = digitCSV.split(',').map( x => parseFloat(x));
	  let inputs = allValues.slice(1, allValues.length).map( x => x / 255.0 * 0.99 + 0.01);

	  let outputs = this.query(inputs).toArray();
	  let chosenDigit = outputs.indexOf(Math.max(...outputs));
	  return chosenDigit;
	};

	NeuralNetwork.prototype.sampleInputs = function(numNodes) {
	    let sampleNodes = [];
	    let inputs = this.inputs.toArray();

	    for(let i = 0; i < numNodes; i++) {
	      let randIdx = Math.floor(Math.random()*inputs.length);
	      sampleNodes.push(inputs[randIdx]);
	    }
	    return sampleNodes;
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
/* 4 */,
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	const Matrix = __webpack_require__(3);

	const Visualizer = function(canvasEl, headerEl, visualizationEl, neuralNetwork, testData) {
	  this.canvasEl = canvasEl;
	  this.headerEl = headerEl;
	  this.visualizationEl = visualizationEl;
	  this.neuralNetwork = neuralNetwork;
	  this.testDigits = testData.split(/\r?\n/);

	  this.displayNumberPicker();
	};

	Visualizer.prototype.displayNumberPicker = function() {
	  this.headerEl.innerHTML = "pick a number";
	  let digits = document.createElement("div");
	  digits.id = "digits";
	  digits.className = "visual-box center";

	  for (let i = 0; i < 10; i++) {
	    let digit = document.createElement("div");
	    digit.className = "digit hoverable";
	    digit.id = i;
	    digit.innerHTML = i;
	    $(digit).on("click", this.pick.bind(this));
	    digits.appendChild(digit);
	  }

	  this.visualizationEl.appendChild(digits);
	};

	Visualizer.prototype.pick = function(event) {
	  let digit = parseInt(event.target.id);
	  let digitCSV = this.testDigits[digit];
	  this.neuralNetwork.interpret(digitCSV);
	  this.displayCSV(digit, digitCSV);
	};

	Visualizer.prototype.displayCSV = function(digit, digitCSV) {
	  let digitToCSV = document.createElement("div");
	  digitToCSV.className = "visual-box hidden";
	  digitToCSV.id = "digit-to-csv";

	  let digitEl = document.createElement("div");
	  digitEl.id = "digit";
	  digitEl.innerHTML = digit;

	  let equalsEl = document.createElement("div");
	  equalsEl.id = "equals";

	  let csvEl = document.createElement("div");
	  csvEl.id = "digitCSV";
	  csvEl.innerHTML = digitCSV.slice(2, digitCSV.length);

	  let cool = document.createElement("div");
	  cool.id = "cool";
	  cool.innerHTML = "cool";
	  cool.className = "hoverable";
	  $(cool).on("click", this.showScaledCSV.bind(this));

	  digitToCSV.appendChild(digitEl);
	  digitToCSV.appendChild(equalsEl);
	  digitToCSV.appendChild(csvEl);
	  digitToCSV.appendChild(cool);

	  this.visualizationEl.appendChild(digitToCSV);

	  this.headerEl.innerHTML = "each pixel's greyscale value, presented in a CSV format";
	  document.getElementById("digits").className = "visual-box top";
	  setTimeout(() => digitToCSV.className = "visual-box center", 0);

	  $(".digit").each( (idx, digit) => {
	    $(digit).off();
	    digit.className = "digit";
	  });
	};

	Visualizer.prototype.showScaledCSV = function() {
	  let scaledCSVContainerEl = document.createElement("div");
	  scaledCSVContainerEl.id = "scaledCSVContainer";
	  scaledCSVContainerEl.className = "visual-box hidden";

	  let scaledCSV = this.neuralNetwork.inputs.toArray().map( x => Math.floor(x * 100) / 100 ).join(",");
	  let scaledCSVEl = document.createElement("div");
	  scaledCSVEl.id = "scaledCSVEl";
	  scaledCSVEl.innerHTML = scaledCSV;

	  let groovyEl = document.createElement("div");
	  groovyEl.innerHTML = "Groovy";
	  groovyEl.id = "groovy";
	  groovyEl.className = "hoverable";
	  $(groovyEl).on("click", this.displayInputNodes.bind(this));

	  scaledCSVContainerEl.appendChild(scaledCSVEl);
	  scaledCSVContainerEl.appendChild(groovyEl);

	  this.headerEl.innerHTML = "each value is scaled between 0 and 1";
	  this.visualizationEl.appendChild(scaledCSVContainerEl);
	  this.slideAndHide(document.getElementById("digits"));
	  this.slideAndHide(document.getElementById("digit-to-csv"));
	  setTimeout(() => scaledCSVContainerEl.className = "visual-box center", 0);
	};

	Visualizer.prototype.displayInputNodes = function() {
	  let inputNodesContainerEl = document.createElement("div");
	  inputNodesContainerEl.id = "inputNodesContainer";
	  inputNodesContainerEl.className = "visual-box hidden";

	  let inputNodesEl = document.createElement("div");
	  inputNodesEl.id = "inputNodesEl";
	  let sampleNodeVals = this.neuralNetwork.sampleInputs(18);

	  for(let i = 0; i < 18; i++) {
	    let nodeEl = document.createElement("div");
	    nodeEl.className = "inputNode";
	    let inputValue = document.createElement("p");
	    inputValue.innerHTML = (Math.floor(sampleNodeVals[i] * 100) / 100);
	    nodeEl.appendChild(inputValue);
	    inputNodesEl.appendChild(nodeEl);
	  }
	  let radEl = document.createElement("div");
	  radEl.id = "rad";
	  radEl.className = "hoverable";
	  radEl.innerHTML = "Rad";

	  inputNodesContainerEl.appendChild(inputNodesEl);
	  inputNodesContainerEl.appendChild(radEl);

	  this.visualizationEl.appendChild(inputNodesContainerEl);


	  this.headerEl.innerHTML = "the scaled values are supplied as the input to the first node layer (here's a small sample)";
	  this.slideAndHide(document.getElementById("scaledCSVContainer"));
	  setTimeout(() => inputNodesContainerEl.className = "visual-box center", 0);
	};

	Visualizer.prototype.slideAndHide = function(el) {
	  el.className = "visual-box off-screen";
	  setTimeout(() => el.remove(), 1000);
	};

	module.exports = Visualizer;


/***/ }
/******/ ]);