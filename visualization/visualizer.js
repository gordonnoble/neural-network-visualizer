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
  let digitsBox = document.createElement("div");
  digitsBox.id = "digits-box";
  digitsBox.className = "visual-box center";

  for (let i = 0; i < 10; i++) {
    let digit = document.createElement("div");
    digit.className = "digit hoverable";
    digit.id = i;
    digit.innerHTML = i;
    $(digit).on("click", this.pick.bind(this));
    digitsBox.appendChild(digit);
  }

  this.visualizationEl.appendChild(digitsBox);
};

Visualizer.prototype.pick = function(event) {
  let digit = parseInt(event.target.id);
  let digitCSV = this.testDigits[digit];
  this.neuralNetwork.interpret(digitCSV);
  this.displayCSV(digit, digitCSV);
};

Visualizer.prototype.displayCSV = function(digit, digitCSV) {
  let CSVBox = document.createElement("div");
  CSVBox.className = "visual-box hidden";
  CSVBox.id = "csv-box";

  let digitEl = document.createElement("div");
  digitEl.id = "digit";
  digitEl.innerHTML = digit;

  let equalsEl = document.createElement("div");
  equalsEl.id = "equals";

  let csvEl = document.createElement("div");
  csvEl.id = "digit-csv";
  csvEl.innerHTML = digitCSV.slice(2, digitCSV.length);

  let coolEl = this.makeNextButton("Cool", this.showScaledCSV);

  CSVBox.appendChild(digitEl);
  CSVBox.appendChild(equalsEl);
  CSVBox.appendChild(csvEl);
  CSVBox.appendChild(coolEl);

  this.visualizationEl.appendChild(CSVBox);

  this.headerEl.innerHTML = "each pixel's greyscale value, presented in a CSV format";
  document.getElementById("digits-box").className = "visual-box top";
  setTimeout(() => CSVBox.className = "visual-box center", 0);

  $(".digit").each( (idx, digit) => {
    $(digit).off();
    digit.className = "digit";
  });
};

Visualizer.prototype.showScaledCSV = function() {
  let scaledCSVBox = document.createElement("div");
  scaledCSVBox.id = "scaled-csv-box";
  scaledCSVBox.className = "visual-box hidden";

  let scaledCSV = this.neuralNetwork.inputs.toArray().map( x => Math.floor(x * 100) / 100 ).join(",");
  let scaledCSVEl = document.createElement("div");
  scaledCSVEl.id = "scaled-csv";
  scaledCSVEl.innerHTML = scaledCSV;

  let groovyEl = this.makeNextButton("Groovy", this.displayInputNodes);

  scaledCSVBox.appendChild(scaledCSVEl);
  scaledCSVBox.appendChild(groovyEl);

  this.headerEl.innerHTML = "each value is scaled between 0 and 1";
  this.visualizationEl.appendChild(scaledCSVBox);
  this.slideAndHide(document.getElementById("digits-box"));
  this.slideAndHide(document.getElementById("csv-box"));
  setTimeout(() => scaledCSVBox.className = "visual-box center", 0);
};

Visualizer.prototype.displayInputNodes = function() {
  let inputNodesBox = document.createElement("div");
  inputNodesBox.id = "input-nodes-box";
  inputNodesBox.className = "visual-box hidden";

  let inputNodesList = document.createElement("div");
  inputNodesList.id = "input-nodes-list";
  let sampleNodeVals = this.neuralNetwork.sampleInputs(20);

  for(let i = 0; i < 20; i++) {
    let nodeEl = document.createElement("div");
    nodeEl.className = "inputNode";
    let inputValue = document.createElement("p");
    inputValue.innerHTML = (Math.floor(sampleNodeVals[i] * 100) / 100);
    nodeEl.appendChild(inputValue);
    inputNodesList.appendChild(nodeEl);
  }

  let radEl = this.makeNextButton("Rad", () => console.log("Rad indeed"));

  inputNodesBox.appendChild(inputNodesList);
  inputNodesBox.appendChild(radEl);

  this.visualizationEl.appendChild(inputNodesBox);


  this.headerEl.innerHTML = "the scaled values are supplied as the input to the first node layer (here's a small sample)";
  this.slideAndHide(document.getElementById("scaled-csv-box"));
  setTimeout(() => inputNodesBox.className = "visual-box center", 0);
};

Visualizer.prototype.displayHiddenNodes = function() {
};

Visualizer.prototype.slideAndHide = function(el) {
  el.className = "visual-box off-screen";
  setTimeout(() => el.remove(), 1000);
};

Visualizer.prototype.makeNextButton = function(buttonText, callback) {
  let button = document.createElement("div");
  button.className = "next-button hoverable";
  button.innerHTML = buttonText;
  $(button).on("click", callback.bind(this));
  return button;
};

module.exports = Visualizer;
