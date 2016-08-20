const Matrix = require('../neural_network/matrix.js');

const Visualizer = function(canvasEl, headerEl, visualizationEl, neuralNetwork, testData) {
  this.canvasEl = canvasEl;
  this.visualizationEl = visualizationEl;
  this.neuralNetwork = neuralNetwork;
  this.testDigits = testData.split(/\r?\n/);

  this.displayNumberPicker();
};

Visualizer.prototype.displayNumberPicker = function() {
  $("#canvas-header h1").html("pick a number");
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

  Visualizer.appendChildren(CSVBox, digitEl, equalsEl, csvEl);
  $("#canvas-header").append(coolEl);

  this.visualizationEl.appendChild(CSVBox);

  $("#canvas-header h1").html("each pixel's greyscale value, presented in a CSV format");
  Visualizer.prototype.slideAndHide(document.getElementById("digits-box"));
  setTimeout(() => CSVBox.className = "visual-box center", 0);

  $(".digit").each( (idx, digit) => {
    $(digit).off();
    digit.className = "digit";
  });
};

Visualizer.prototype.showScaledCSV = function() {
  $("#cool").remove();

  let scaledCSVBox = document.createElement("div");
  scaledCSVBox.id = "scaled-csv-box";
  scaledCSVBox.className = "visual-box hidden";

  let scaledCSV = this.neuralNetwork.inputs.toArray().map( x => Math.floor(x * 100) / 100 ).join(",");
  let scaledCSVEl = document.createElement("div");
  scaledCSVEl.id = "scaled-csv";
  scaledCSVEl.innerHTML = scaledCSV;

  let groovyEl = this.makeNextButton("Groovy", this.displayInputNodes);

  Visualizer.appendChildren(scaledCSVBox, scaledCSVEl);
  $("#canvas-header").append(groovyEl);

  $("#canvas-header h1").html("each value is scaled between 0 and 1");
  this.visualizationEl.appendChild(scaledCSVBox);
  this.slideAndHide(document.getElementById("csv-box"));
  setTimeout(() => scaledCSVBox.className = "visual-box center", 0);
};

Visualizer.prototype.displayInputNodes = function() {
  $("#groovy").remove();

  let inputNodesBox = document.createElement("div");
  inputNodesBox.id = "input-nodes-box";
  inputNodesBox.className = "visual-box hidden";

  let inputNodesList = document.createElement("div");
  inputNodesList.className = "node-list";
  let sampleNodeVals = this.neuralNetwork.sampleInputs;

  for(let i = 0; i < 20; i++) {
    let nodeEl = document.createElement("div");
    nodeEl.className = "input-node";
    nodeEl.id = `i${i}`;
    let inputValue = document.createElement("p");
    inputValue.innerHTML = (Math.floor(sampleNodeVals[i] * 100) / 100);
    let color = Math.floor(sampleNodeVals[i] * 255);
    $(nodeEl).attr("style", `background-color:rgb(240,${color},75)`);
    nodeEl.appendChild(inputValue);
    inputNodesList.appendChild(nodeEl);
  }

  let radEl = this.makeNextButton("Rad", this.displayHiddenNodes);

  Visualizer.appendChildren(inputNodesBox, inputNodesList);
  this.visualizationEl.appendChild(inputNodesBox);
  $("#canvas-header").append(radEl);

  $("#canvas-header h1").html("the scaled values are supplied as the input to the first node layer (here's a small sample)");
  this.slideAndHide(document.getElementById("scaled-csv-box"));
  setTimeout(() => inputNodesBox.className = "visual-box center", 0);
};

Visualizer.prototype.displayHiddenNodes = function() {
  $("p").remove();
  $("#rad").remove();

  let hiddenNodesBox = document.createElement("div");
  hiddenNodesBox.id = "hidden-nodes-box";
  hiddenNodesBox.className = "visual-box hidden";

  let hiddenNodesList = document.createElement("div");
  hiddenNodesList.className = "node-list";

  for(let i = 0; i < 15; i ++) {
    let nodeEl = document.createElement("div");
    nodeEl.className = "hidden-node";
    nodeEl.id = `h${i}`;
    $(nodeEl).attr("style", "background-color:#FFFFFF;border:1px solid black");
    hiddenNodesList.appendChild(nodeEl);
  }

  let dopeEl = this.makeNextButton("Dope", this.fireInputNodes);

  Visualizer.appendChildren(hiddenNodesBox, hiddenNodesList);
  this.visualizationEl.appendChild(hiddenNodesBox);
  $("#canvas-header").append(dopeEl);

  this.connectInputToHidden();

  $("#canvas-header h1").html("the input layer is connected to a second layer of nodes, and each connection is weighted differently");
  document.getElementById("input-nodes-box").className = "visual-box top";
  setTimeout(() => hiddenNodesBox.className = "visual-box center", 0);
};


Visualizer.prototype.fireInputNodes = function() {
  $("#dope").remove();

  let hiddenInputs = this.neuralNetwork.sampleHiddenInputs;

  let selection = $(".hidden-node");
  let i = 0;

  let firing = setInterval( () => {
    $(selection[i - 1]).trigger('mouseout');
    if (i === selection.length) { window.clearInterval(firing); }
    let value = document.createElement("p");
    value.innerHTML = (Math.floor(hiddenInputs[i] * 100) / 100);
    let color = Math.floor(hiddenInputs[i] * 360) + 160;
    $(selection[i]).trigger('mouseover');
    $(selection[i]).attr("style", `background-color:rgb(240,${color},75)`);
    selection[i].appendChild(value);
    i++;
  }, 500);

  this.showOutputNodes();
};

Visualizer.prototype.showOutputNodes = function() {
  
};

Visualizer.prototype.connectInputToHidden = function() {
  let sampleWIH = this.neuralNetwork.sampleWIH;
  let wihEl = d3.select('body').append("svg");
  wihEl.attr("id", "wih");

  $('.input-node').each( (iIdx, iNode) => {
    $(iNode).hover(this.drawPaths, this.hidePaths);

    $('.hidden-node').each( (hIdx, hNode) => {
      $(hNode).hover(this.drawPaths, this.hidePaths);

      let color = Math.floor(sampleWIH.get(hIdx, iIdx) * 360) + 160;

      let path = wihEl.append("line")
        .attr("stroke-width", 4)
        .attr("stroke", `rgb(240,${color},75)`)
        .data([`i${iIdx} h${hIdx}`]).enter();
    });
  });

};

Visualizer.prototype.drawPaths = function(event) {
  let source = event.target;
  if (source.id === "" ) { source = source.parentElement; }
  let x1 = source.getBoundingClientRect().left + ($(source).width() / 2);
  let y1 = source.getBoundingClientRect().bottom - ($(source).height() / 2);

  let paths = d3.selectAll('line').filter( d => d.includes(source.id) );
  paths.each( (d, i, paths) => {
    let targetId = d.split(" ").filter( el => el !== source.id)[0];
    let target = $(`#${targetId}`)[0];

    let x2 = target.getBoundingClientRect().left + ($(target).width() / 2);
    let y2 = target.getBoundingClientRect().top + ($(target).height() / 2);
    d3.select(paths[i]).attr("x1", x1).attr("y1", y1).attr("x2", x2).attr("y2", y2).attr("stroke-width", 4);
  });
};

Visualizer.prototype.hidePaths = function(event) {
  let source = event.target;
  if (source.id === "" ) { source = source.parentElement; }

  let paths = d3.selectAll('line').filter( d => d.includes(source.id) );
  paths.each( (d, i, paths) => {
    d3.select(paths[i]).attr("stroke-width", 0);
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
