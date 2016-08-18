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

	window.NeuralNetwork = __webpack_require__(1);
	window.Matrix = __webpack_require__(3);

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
	  inputs = new Matrix(inputs).transpose();

	  let hiddenInputs = this.wih.dot(inputs);
	  let hiddenOutputs = hiddenInputs.map( x =>
	    MyMath.sigmoid(x)
	  );

	  let finalInputs = this.who.dot(hiddenOutputs);
	  let finalOutputs = finalInputs.map( x =>
	    MyMath.sigmoid(x)
	  );

	  return finalOutputs;
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

	NeuralNetwork.prototype.interpret = function(data, idx) {
	  let testDigits = data.split(/\r?\n/);
	  let digit = testDigits[idx];

	  let allValues = digit.split(',').map( x => parseFloat(x));
	  let inputs = allValues.slice(1, allValues.length).map( x => x / 255.0 * 0.99 + 0.01);

	  let outputs = this.query(inputs).toArray();
	  let chosenDigit = outputs.indexOf(Math.max(...outputs));
	  return chosenDigit;
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


/***/ }
/******/ ]);