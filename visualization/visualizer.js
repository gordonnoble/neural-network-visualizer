const Matrix = require('../neural_network/matrix.js');

const Visualizer = function(canvasEl, headerEl, visualizationEl, neuralNetwork, trainingData, testData) {
  this.canvasEl = canvasEl;
  this.visualizationEl = visualizationEl;
  this.neuralNetwork = neuralNetwork;
  this.testDigits = testData.split(/\r?\n/);

  this.beginTraining(trainingData);
};

Visualizer.prototype.beginTraining = function(trainingData) {
  $("#title").html("one minute while the neural network trains...");
  let thinkingEl = this.drawLoadingElement();

  let startVisualization = function() {
    thinkingEl.remove();
    this.displayNumberPicker();
  };

  setTimeout( () => this.neuralNetwork.learn(trainingData, startVisualization.bind(this)), 200);
};

Visualizer.prototype.drawLoadingElement = function() {
  let thinkingEl = document.createElement("div");
  thinkingEl.className = "sk-cube-grid";

  [...Array(9).keys()].forEach( idx => {
    let squareEl = document.createElement("div");
    squareEl.className = `sk-cube sk-cube${idx + 1}`;
    thinkingEl.appendChild(squareEl);
  });

  document.querySelector('body').appendChild(thinkingEl);
  return thinkingEl;
};

Visualizer.prototype.displayNumberPicker = function() {
  $("#canvas-header h1").html("ok, pick a number");
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

  $("#title").html("each pixel's greyscale value, presented in a CSV format");
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

  $("#title").html("each value is scaled between 0 and 1");
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
    nodeEl.className = "input node";
    nodeEl.id = `i${i}`;
    let inputValue = document.createElement("p");
    inputValue.innerHTML = Math.floor(sampleNodeVals[i] * 100) / 100;
    let color = 200 - Math.floor(sampleNodeVals[i] * 200);
    $(nodeEl).attr("style", `background-color:rgb(${color},${color},${color})`);
    nodeEl.appendChild(inputValue);
    inputNodesList.appendChild(nodeEl);
  }

  let radEl = this.makeNextButton("Rad", this.displayHiddenNodes);

  Visualizer.appendChildren(inputNodesBox, inputNodesList);
  this.visualizationEl.appendChild(inputNodesBox);
  $("#canvas-header").append(radEl);

  $("#title").html("the scaled values are supplied as the input to the first node layer\n(here's a small sample)");
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
    nodeEl.className = "hidden node";
    nodeEl.id = `h${i}`;
    $(nodeEl).attr("style", "background-color:#FFFFFF;border:1px solid black");
    hiddenNodesList.appendChild(nodeEl);
  }

  let dopeEl = this.makeNextButton("Dope", this.fireInputNodes);

  Visualizer.appendChildren(hiddenNodesBox, hiddenNodesList);
  this.visualizationEl.appendChild(hiddenNodesBox);
  $("#canvas-header").append(dopeEl);

  this.connectLayers('input', 'hidden', this.neuralNetwork.sampleWIH);

  $("#title").html("the input layer is connected to a second layer of nodes via weighted connections");
  document.getElementById("input-nodes-box").className = "visual-box top";
  setTimeout(() => hiddenNodesBox.className = "visual-box center", 0);
};


Visualizer.prototype.fireInputNodes = function() {
  $("#dope").remove();

  let hiddenInputs = this.neuralNetwork.sampleHiddenInputs;

  let selection = $(".node.hidden");
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

  let awesomeEl = this.makeNextButton("Awesome", this.sigmoidHiddenNodes);
  $("#canvas-header").append(awesomeEl);

  $("#title").html("each node in the second layer sums the weighted inputs from the first layer");
};

Visualizer.prototype.sigmoidHiddenNodes = function() {
  $("#awesome").remove();

  let hiddenOutputs = this.neuralNetwork.sampleHiddenOutputs;

  $(".node.hidden").each( (idx, node) => {
    node.children[0].innerHTML = Math.floor(hiddenOutputs[idx] * 100) / 100;
  });

  let niceEl = this.makeNextButton("Nice", this.showOutputNodes);
  $("#canvas-header").append(niceEl);

  $("#title").html("each value is then scaled between 0 and 1 using the sigmoid function");
};

Visualizer.prototype.showOutputNodes = function() {
  $("#nice").remove();
  $("p").remove();

  let outputNodesBox = document.createElement("div");
  outputNodesBox.id = "output-nodes-box";
  outputNodesBox.className = "visual-box hidden";

  let outputNodesList = document.createElement("div");
  outputNodesList.className = "node-list";

  for(let i = 0; i < 10; i ++) {
    let nodeEl = document.createElement("div");
    nodeEl.className = "output node";
    nodeEl.id = `o${i}`;
    $(nodeEl).attr("style", "background-color:#FFFFFF;border:1px solid black");
    outputNodesList.appendChild(nodeEl);
  }

  let swellEl = this.makeNextButton("Swell", this.fireHiddenNodes);

  Visualizer.appendChildren(outputNodesBox, outputNodesList);
  this.visualizationEl.appendChild(outputNodesBox);
  $("#canvas-header").append(swellEl);

  this.connectLayers('hidden', 'output', this.neuralNetwork.sampleWHO);

  $("#title").html("a third and final layer of nodes is connected to the second");
  setTimeout(() => outputNodesBox.className = "visual-box bottom", 0);
};


Visualizer.prototype.fireHiddenNodes = function() {
  $("#swell").remove();

  let finalInputs = this.neuralNetwork.finalInputs.toArray();;
  let selection = $(".node.output");
  let i = 0;

  let firing = setInterval( () => {
    $(selection[i - 1]).trigger('mouseout');
    if (i === selection.length) { window.clearInterval(firing); }
    let value = document.createElement("p");
    value.innerHTML = (Math.floor(finalInputs[i] * 100) / 100);
    let color = Math.floor(finalInputs[i] * 360) + 160;
    $(selection[i]).trigger('mouseover');
    $(selection[i]).attr("style", `background-color:rgb(240,${color},75)`);
    selection[i].appendChild(value);
    i++;
  }, 500);

  let stellarEl = this.makeNextButton("Stellar", this.sigmoidOutputNodes);
  $("#canvas-header").append(stellarEl);

  $("#title").html("each node in the third layer sums the weighted inputs from the second layer");
};

Visualizer.prototype.sigmoidOutputNodes = function() {
  $("#stellar").remove();

  let finalOutputs = this.neuralNetwork.finalOutputs.toArray();

  $(".node.output").each( (idx, node) => {
    node.children[0].innerHTML = Math.floor(finalOutputs[idx] * 100) / 100;
  });

  let fantasticEl = this.makeNextButton("Fantastic", this.clearTopLayers.bind(this));
  $("#canvas-header").append(fantasticEl);

  $("#title").html("again, each value is scaled between 0 and 1 using the sigmoid function");
};

Visualizer.prototype.clearTopLayers = function() {
  $("#fantastic").remove();

  this.slideAndHide(document.getElementById("input-nodes-box"));
  this.slideAndHide(document.getElementById("hidden-nodes-box"), this.showAnswer);
  $(".node.output").off();
  $("#output-nodes-box").attr('class', 'visual-box center');
};

Visualizer.prototype.showAnswer = function() {
  let digits = document.createElement("div");
  digits.id = "answer-digits";
  let digitY = $("#output-nodes-box").get(0).getBoundingClientRect().bottom;

  [...Array(10).keys()].forEach( idx => {
    let digit = document.createElement("div");
    digit.className = "answer-digit";
    digit.innerHTML = idx;
    let digitX = $(`#o${idx}`).get(0).getBoundingClientRect().left;
    $(digit).attr("style", `top:${digitY}px;left:${digitX}px`);
    digits.appendChild(digit);
  });

  let chosenDigit = this.neuralNetwork.chosenDigit;
  let chosenNodeCoords = this.answerNode().get(0).getBoundingClientRect();
  let chosenX = chosenNodeCoords.left;
  let chosenY = chosenNodeCoords.top;

  let arrowBox = document.createElement("div");
  arrowBox.id = "arrow-box";
  let arrowEl = document.createElement("div");
  arrowEl.className = "arrow";
  arrowEl.innerHTML = `I think that was a ${chosenDigit}`;
  arrowBox.appendChild(arrowEl);
  $(arrowBox).attr("style", `top:${chosenY}px;left:${chosenX}px;transform:translateY(-200%) translateX(-40%)`);

  $('body').append(digits);
  $('body').append(arrowBox);

  $("#title").html("the highest-value node corresponds to the answer");
};

Visualizer.prototype.answerNode = function() {
  let answer = this.neuralNetwork.chosenDigit;
  return $(`#o${answer}`);
};

Visualizer.prototype.connectLayers = function(firstClass, secondClass, weightsMatrix) {
  let weightsEl = d3.select('body').append("svg");
  weightsEl.attr("class", "weights-matrix");

  $(`.node.${firstClass}`).each( (idxI, nodeI) => {
    $(nodeI).hover(this.drawPaths, this.hidePaths);

    $(`.node.${secondClass}`).each( (idxJ, nodeJ) => {
      $(nodeJ).hover(this.drawPaths, this.hidePaths);

      let color = Math.floor(weightsMatrix.get(idxJ, idxI) * 360) + 160;

      let path = weightsEl.append("line")
        .attr("stroke-width", 4)
        .attr("stroke", `rgb(240,${color},75)`)
        .data([`${firstClass[0]}${idxI} ${secondClass[0]}${idxJ}`]).enter();
    });
  });
};

Visualizer.prototype.drawPaths = function(event) {
  let source = event.target;
  if (source.id === "" ) { source = source.parentElement; }
  let x1 = source.getBoundingClientRect().left + ($(source).width() / 2);
  let y1 = source.getBoundingClientRect().bottom - ($(source).height() / 2);

  let regexp = new RegExp("\\b(" + source.id + ")\\b");
  let paths = d3.selectAll('line').filter( d => d.match(regexp) );
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

  let regexp = new RegExp("\\b(" + source.id + ")\\b");
  let paths = d3.selectAll('line').filter( d => d.match(regexp) );
  paths.each( (d, i, paths) => {
    d3.select(paths[i]).attr("stroke-width", 0);
  });
};

Visualizer.prototype.slideAndHide = function(el, callback) {
  el.className = "visual-box off-screen";

  setTimeout(() => {
    el.remove();

    if (callback !== undefined) {
      callback.call(this);
    }
  }, 1000);
};

Visualizer.prototype.makeNextButton = function(buttonText, callback) {
  let button = document.createElement("h1");
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
