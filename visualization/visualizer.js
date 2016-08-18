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
  $(cool).on("click", this.displayInputNodes.bind(this));

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

Visualizer.prototype.displayInputNodes = function() {
  let inputNodesEl = document.createElement("div");
  inputNodesEl.className = "visual-box hidden";
  let sampleNodeVals = this.neuralNetwork.sampleInputs(20);

  for(let i = 0; i < 20; i++) {
    // let nodeEl = document.createElement("svg");
    // nodeEl.className = "inputNode";
    // $(nodeEl).attr("version", "1.1");
    // $(nodeEl).attr("xmlns", "http://www.w3.org/2000/svg");
    //
    // $(nodeEl).attr("width", "120");
    // $(nodeEl).attr("height", "120");
    //
    // let circle = document.createElement("circle");
    // $(circle).attr("cx", "60");
    // $(circle).attr("cy", "60");
    // $(circle).attr("r", "50");
    // $(circle).attr("stroke-width", "2");
    // $(circle).attr("stroke", "black");
    // circle.innerHTML = sampleNodeVals[i];
    // nodeEl.appendChild(circle);
    // inputNodesEl.appendChild(nodeEl);
    $(inputNodesEl).append("<svg width='100' height='100'><circle cx='50' cy='50' r='40' stroke='black' stroke-width='1' fill='red' /></svg>");
  }

  this.visualizationEl.appendChild(inputNodesEl);
  this.slideAndHide(document.getElementById("digits"));
    this.slideAndHide(document.getElementById("digit-to-csv"));
  setTimeout(() => inputNodesEl.className = "visual-box center", 0);
};

Visualizer.prototype.slideAndHide = function(el) {
  el.className = "visual-box off-screen";
  setTimeout(() => el.remove(), 1000);
};

module.exports = Visualizer;
