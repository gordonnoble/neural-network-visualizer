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
    digit.id = i; digit.innerHTML = i;
    $(digit).on("click", this.pick.bind(this));
    digitsBox.appendChild(digit);
  }

  this.visualizationEl.appendChild(digitsBox);
};

Visualizer.prototype.pick = function(event) {
  let digit = parseInt(event.target.id);
  let digitCSV = this.testDigits[digit];
  this.neuralNetwork.interpret(digitCSV);
  this.neuralNetwork.prepSample(20, 15);
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

  Visualizer.appendChildren(CSVBox, digitEl, equalsEl, csvEl, coolEl);

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

  Visualizer.appendChildren(scaledCSVBox, scaledCSVEl, groovyEl);

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
  inputNodesList.className = "node-list";
  let sampleNodeVals = this.neuralNetwork.sampleInputs;

  for(let i = 0; i < 20; i++) {
    let nodeEl = document.createElement("div");
    nodeEl.className = "input-node";
    let inputValue = document.createElement("p");
    inputValue.innerHTML = (Math.floor(sampleNodeVals[i] * 100) / 100);
    nodeEl.appendChild(inputValue);
    inputNodesList.appendChild(nodeEl);
  }

  let radEl = this.makeNextButton("Rad", this.displayHiddenNodes);

  Visualizer.appendChildren(inputNodesBox, inputNodesList, radEl);
  this.visualizationEl.appendChild(inputNodesBox);

  this.headerEl.innerHTML = "the scaled values are supplied as the input to the first node layer (here's a small sample)";
  this.slideAndHide(document.getElementById("scaled-csv-box"));
  setTimeout(() => inputNodesBox.className = "visual-box center", 0);
};

Visualizer.prototype.displayHiddenNodes = function() {
  let hiddenNodesBox = document.createElement("div");
  hiddenNodesBox.id = "hidden-nodes-box";
  hiddenNodesBox.className = "visual-box hidden";

  let hiddenNodesList = document.createElement("div");
  hiddenNodesList.className = "node-list";

  for(let i = 0; i < 15; i ++) {
    let nodeEl = document.createElement("div");
    nodeEl.className = "hidden-node";
    hiddenNodesList.appendChild(nodeEl);
  }

  $(".input-node").each( (idx, node) =>
    $(node).hover(this.connectToHiddenNodes.bind(this), this.removeConnectionsToHiddenNodes.bind(this))
  );

  let dopeEl = this.makeNextButton("Dope", this.fireInputNodes);

  Visualizer.appendChildren(hiddenNodesBox, hiddenNodesList, dopeEl);
  this.visualizationEl.appendChild(hiddenNodesBox);

  this.headerEl.innerHTML = "the input layer is connected to a second layer of nodes, and each connection is weighted differently";
  document.getElementById("rad").remove();
  document.getElementById("input-nodes-box").className = "visual-box top";
  setTimeout(() => hiddenNodesBox.className = "visual-box center", 0);
};


Visualizer.prototype.fireInputNodes = function() {
  let hiddenInputs = this.neuralNetwork.sampleHiddenInputs;

  $(".hidden-node").each( (hiddenIdx, node) => {
    let value = document.createElement("p");
    value.innerHTML = (Math.floor(hiddenInputs[hiddenIdx] * 100) / 100);
    node.appendChild(value);
  });
};

Visualizer.prototype.connectToHiddenNodes = function(event) {
  let nodeEl = event.target;
  let x1 = nodeEl.getBoundingClientRect().left + ($(nodeEl).width() / 2);
  let y1 = nodeEl.getBoundingClientRect().bottom - ($(nodeEl).height() / 8);
  let inputIdx = $(nodeEl).index();
  let sampleWIH = this.neuralNetwork.sampleWIH;

  let wihEl = d3.select('body').append("svg");
  wihEl.attr("id", "wih");

  $('.hidden-node').each( (hiddenIdx, node) => {
    let x2 = node.getBoundingClientRect().left + ($(nodeEl).width() / 2);
    let y2 = node.getBoundingClientRect().top + ($(nodeEl).height() / 8);

    let color = Math.floor(sampleWIH.get(hiddenIdx, inputIdx) * 360) + 160;

    let path = wihEl.append("line")
                      .attr("x1", x1).attr("y1", y1)
                      .attr("x2", x2).attr("y2", y2)
                      .attr("stroke-width", 4)
                      .attr("stroke", `rgb(240,${color},75)`);
    path.attr("className", "wih-path");
  });
};

Visualizer.prototype.removeConnectionsToHiddenNodes = function(event) {
  document.getElementById('wih').remove();
};

Visualizer.prototype.slideAndHide = function(el) {
  el.className = "visual-box off-screen";
  setTimeout(() => el.remove(), 1000);
};

Visualizer.prototype.makeNextButton = function(buttonText, callback) {
  let button = document.createElement("div");
  button.className = "next-button hoverable";
  button.id = `${buttonText.toLowerCase()}`;
  button.innerHTML = buttonText;
  $(button).on("click", callback.bind(this));
  return button;
};

Visualizer.appendChildren = function(parent, ...children) {
  children.forEach(child => parent.appendChild(child));
};

module.exports = Visualizer;
