const Matrix = require('../neural_network/matrix.js');
const Text = require ('./text.js');

const Visualizer = function(headerQuery, workSpaceQuery, neuralNetwork, trainingData, testData) {
  this.headerSpace = $(headerQuery);
  this.workSpace = $(workSpaceQuery);
  this.neuralNetwork = neuralNetwork;
  this.testDigits = testData.split(/\r?\n/);

  this.displayIntro();
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
    $(digit).on('click', this.pick.bind(this));
    digitsBox.appendChild(digit);
  }

  this.titleSpace = document.createElement('h3');
  this.titleSpace.id = "title";
  this.titleSpace.innerHTML = Text.header1;
  this.headerSpace.append(this.titleSpace);
  this.workSpace.append(digitsBox);
};

Visualizer.prototype.pick = function(event) {
  let digit = parseInt(event.target.id);
  let csv = this.testDigits[digit];

  this.neuralNetwork.interpret(csv);
  this.neuralNetwork.prepSample(20, 15);

  this.displayCSV(digit, csv);
};

Visualizer.prototype.displayCSV = function(digit, digitCSV) {
  const greyscaleMap = d3.scaleLinear()
                          .domain([0, 255])
                          .range(["#FFFFFF", "#000000"]);

  Visualizer.drawImage(digitCSV.slice(2, digitCSV.length), greyscaleMap);

  this.headerSpace.append(this.nextButton(this.displayScaledCSV));
  this.titleSpace.innerHTML = Text.header2;
  $('#digits-box').remove();
};

Visualizer.prototype.displayScaledCSV = function() {
  Visualizer.removeNextButton();
  $('#csv-box').remove();

  let scaledCSV = this.neuralNetwork.inputs.toArray().map( x => Math.floor(x * 100) / 100 ).join(',');

  const greyscaleMap = d3.scaleLinear()
                          .domain([0.01, 0.99])
                          .range(["#FFFFFF", "#000000"]);

  Visualizer.drawImage(scaledCSV, greyscaleMap);

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

  Visualizer.injectElements(hiddenNodesBox, hiddenNodesList);
  this.workSpace.append(hiddenNodesBox);
  this.headerSpace.append(this.nextButton(this.fireInputNodes));

  this.connectLayers('input', 'hidden', this.neuralNetwork.sampleWIH);

  this.titleSpace.innerHTML = Text.header5;
  document.getElementById('input-nodes-box').className = 'visual-box top';
  setTimeout(() => hiddenNodesBox.className = 'visual-box center', 0);
};


Visualizer.prototype.fireInputNodes = function() {
  Visualizer.removeNextButton();
  let awesome = this.nextButton(this.sigmoidHiddenNodes);
  let hiddenOutputs = this.neuralNetwork.sampleHiddenOutputs;
  let hiddenInputs = this.neuralNetwork.sampleHiddenInputs;
  let selection = $('.node.hidden');
  let i = 0;

  let firing = setInterval( () => {
    $(selection[i - 1]).trigger('mouseout');
    if (i === selection.length) {
      window.clearInterval(firing);
      this.headerSpace.append(awesome);
    }
    let value = document.createElement('p');
    value.innerHTML = (Math.floor(hiddenInputs[i] * 100) / 100);
    let color = d3.interpolateInferno(hiddenOutputs[i]);

    $(selection[i]).trigger('mouseover');
    $(selection[i]).attr('style', `background-color:${color}`);
    selection[i].appendChild(value);
    i++;
  }, 300);


  this.titleSpace.innerHTML = Text.header6;
};

Visualizer.prototype.sigmoidHiddenNodes = function() {
  Visualizer.removeNextButton();

  let hiddenOutputs = this.neuralNetwork.sampleHiddenOutputs;

  $('.node.hidden').each( (idx, node) => {
    node.children[0].innerHTML = Math.floor(hiddenOutputs[idx] * 100) / 100;
  });

  this.headerSpace.append(this.nextButton(this.displayOutputNodes));
  this.titleSpace.innerHTML = Text.header7;
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

  Visualizer.injectElements(outputNodesBox, outputNodesList);
  this.workSpace.append(outputNodesBox);
  this.headerSpace.append(this.nextButton(this.fireHiddenNodes));

  this.connectLayers('hidden', 'output', this.neuralNetwork.sampleWHO);

  this.titleSpace.innerHTML = Text.header8;
  setTimeout(() => outputNodesBox.className = 'visual-box bottom', 0);
};


Visualizer.prototype.fireHiddenNodes = function() {
  Visualizer.removeNextButton();
  let stellar = this.nextButton(this.sigmoidOutputNodes);
  let finalOutputs = this.neuralNetwork.finalOutputs.toArray();
  let finalInputs = this.neuralNetwork.finalInputs.toArray();
  let selection = $('.node.output');
  let i = 0;

  let firing = setInterval( () => {
    $(selection[i - 1]).trigger('mouseout');
    if (i === selection.length) {
      window.clearInterval(firing);
      this.headerSpace.append(stellar);
    }
    let value = document.createElement('p');
    value.innerHTML = (Math.floor(finalInputs[i] * 100) / 100);
    let color = d3.interpolateInferno(finalOutputs[i]);
    $(selection[i]).trigger('mouseover');
    $(selection[i]).attr('style', `background-color:${color}`);
    selection[i].appendChild(value);
    i++;
  }, 300);

  this.titleSpace.innerHTML = Text.header9;
};

Visualizer.prototype.sigmoidOutputNodes = function() {
  Visualizer.removeNextButton();

  let finalOutputs = this.neuralNetwork.finalOutputs.toArray();

  $('.node.output').each( (idx, node) => {
    node.children[0].innerHTML = Math.floor(finalOutputs[idx] * 100) / 100;
  });

  this.headerSpace.append(this.nextButton(this.clearTopLayers.bind(this)));
  this.titleSpace.innerHTML = Text.header10;
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
  arrow.innerHTML = `I think that was a ${chosenDigit}`;
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

Visualizer.drawImage = function(csv, colorFunc) {
  csv = csv.split(",").map( val => parseFloat(val) );
  let image = d3.select('#work-space')
                  .append("svg")
                  .attr("height", 450)
                  .attr("width", 300)
                  .attr("id", 'csv-box');

  let xFunc = function(d, i) {
    return Math.floor(12*(i % 28));
  };
  let yFunc = function(d, i) {
    return (16*Math.floor(i / 28));
  };
  image.selectAll('rect')
      .data(csv)
      .enter()
      .append('rect')
      .attr("x", (d, i) => xFunc(d, i))
      .attr("y", (d, i) => yFunc(d, i))
      .attr("height", 16)
      .attr("width", 12)
      .style("fill", d => colorFunc(d))
      .on('mouseover', (d, i, rect) => Visualizer.floatValue(d, i, rect))
      .on('mouseout', (d, i, rect) => Visualizer.removeFloat(d, i, rect));
};

Visualizer.floatValue = function(d, i, rect) {
  d3.select(rect[i]).attr('stroke-width', 2).attr('width', 11).attr('height', 15).attr('stroke', '#FF3333');
  let text = document.createElement('div');
  text.innerHTML = d;
  text.className = 'value-callout';
  $('body').append(text);
};

Visualizer.removeFloat = function(d, i, rect) {
  d3.select(rect[i]).attr('stroke-width', 0).attr('width', 12).attr('height', 16);
  $('.value-callout').remove();
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

Visualizer.injectElements = function(parent, ...children) {
  children.forEach(child => parent.appendChild(child));
};

module.exports = Visualizer;
