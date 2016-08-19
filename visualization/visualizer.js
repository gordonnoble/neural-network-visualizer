const Matrix = require('../neural_network/matrix.js');

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
