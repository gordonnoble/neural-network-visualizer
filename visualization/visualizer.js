const Text = require ('./text.js');

const Visualizer = function(headerQuery, workSpaceQuery, neuralNetwork, trainingData, testData) {
  this.headerSpace = d3.select(headerQuery);
  this.workSpace = d3.select(workSpaceQuery);
  this.neuralNetwork = neuralNetwork;
  this.testDigits = testData.split(/\r?\n/);

  this.displayIntro();
  setTimeout(() => this.neuralNetwork.learn(trainingData, this.removeLoader.bind(this)), 500);
};

Visualizer.prototype.displayIntro = function() {
  let intro = this.workSpace.append('div').attr('id', 'intro');
  intro.node().innerHTML = Text.intro;

  this.drawLoader();
};

Visualizer.prototype.drawLoader = function() {
  let data = [0, 1, 2, 3, 4, 5, 6, 7, 8];

  d3.select('body')
    .append('div')
    .attr('id', 'training')
    .attr('class', 'sk-cube-grid')
    .selectAll('div')
    .data(data).enter()
    .append('div')
    .attr('class', d => `sk-cube sk-cube${d + 1}`);
};

Visualizer.prototype.removeLoader = function() {
  d3.select('#training').remove();

  d3.select('body').append('h3')
                      .attr('id', `onward`)
                      .attr('class', 'next-button hoverable')
                      .text('onward')
                      .on('click', this.displayNumberPicker.bind(this));
};

Visualizer.prototype.displayNumberPicker = function() {
  d3.select('#intro').remove();
  Visualizer.removeNextButton();

  let digitsBox = this.workSpace.append('div')
    .attr('id', 'digits-box')
    .attr('class', 'visual-box center');

  let nums = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  digitsBox.selectAll('div')
    .data(nums).enter()
    .append('div')
    .attr('id', d => d)
    .attr('class', 'digit hoverable')
    .text(d => d)
    .on('click', this.pickDigit.bind(this));

  digitsBox.append('div')
    .attr('id', 'draw-button')
    .attr('class', 'digit hoverable')
    .text('Draw One!')
    .on('click', this.drawNewImage.bind(this));


  this.titleSpace = this.headerSpace.append('h3').attr('id', 'title').node();

  this.titleSpace.innerHTML = Text.header1;
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

  this.appendNextButton(this.submitImage.bind(this), 'submit');
  this.titleSpace.innerHTML = Text.header1_5;
  d3.select('#digits-box').remove();
};

Visualizer.prototype.submitImage = function(event) {
  Visualizer.removeNextButton();

  this.centerImage();

  let newCsv = d3.selectAll('rect').data();
  newCsv = 'x,' + newCsv.join(',');

  this.neuralNetwork.interpret(newCsv);
  this.neuralNetwork.prepSample(20, 15);

  this.displayCSV(newCsv);
};

Visualizer.prototype.pickDigit = function(d) {
  d3.select('#digits-box').remove();

  let csv = this.testDigits[parseInt(d)];

  this.neuralNetwork.interpret(csv);
  this.neuralNetwork.prepSample(20, 15);

  this.displayCSV(csv);
};

Visualizer.prototype.displayCSV = function(csv) {
  if( d3.select('#csv-box')) { d3.select('#csv-box').remove(); }

  this.drawImage(csv.slice(2, csv.length),
    Visualizer.greyscaleMap255(),
    this.floatValue.bind(this),
    this.removeFloat.bind(this)
  );

  this.appendNextButton(this.displayScaledCSV);
  this.titleSpace.innerHTML = Text.header2;
};

Visualizer.prototype.displayScaledCSV = function() {
  Visualizer.removeNextButton();
  d3.select('#csv-box').remove();

  let scaledCSV = this.neuralNetwork.inputs.map( x => Math.floor(x * 100) / 100 ).join(',');

  this.drawImage(scaledCSV,
    Visualizer.greyscaleMap1(),
    this.floatValue.bind(this),
    this.removeFloat.bind(this)
  );

  this.appendNextButton(this.displayInputNodes);
  this.titleSpace.innerHTML = Text.header3;
};

Visualizer.prototype.displayInputNodes = function() {
  Visualizer.removeNextButton();
  d3.select('#csv-box').remove();

  let inputNodesBox = this.workSpace.append('div')
                                        .attr('id', 'input-nodes-box')
                                        .attr('class', 'visual-box hide');

  let sampleNodeVals = this.neuralNetwork.sampleInputs;
  const greyscaleMap = d3.scaleLinear()
                          .domain([0.01, 0.99])
                          .range(["#F5F5F5", "#262626"]);

  let data = [...Array(20).keys()];

  inputNodesBox.append('div')
                .attr('class', 'node-list')
                .selectAll('div')
                .data(data).enter()
                .append('div')
                .attr('id', d => `i${d}`)
                .attr('class', 'input node')
                .attr('style', d => {
                  let bgColor = greyscaleMap(sampleNodeVals[d]);
                  let color = (sampleNodeVals[d] < 0.50) ? ('rgb(0,0,0)') : ('rgb(255,255,255)');
                  return `background-color:${bgColor};color:${color}`;
                })
                .append('p');

  this.appendNextButton(this.displayHiddenNodes);

  this.titleSpace.innerHTML = Text.header4;
  setTimeout(() => inputNodesBox.attr('class', 'visual-box center'), 0);
};

Visualizer.prototype.displayHiddenNodes = function() {
  d3.selectAll('p').remove();
  Visualizer.removeNextButton();

  let hiddenNodesBox = this.workSpace.append('div')
                                        .attr('id', 'hidden-nodes-box')
                                        .attr('class', 'visual-box hide');

  let data = [...Array(15).keys()];
  hiddenNodesBox.append('div')
                  .attr('class', 'node-list')
                  .selectAll('div')
                  .data(data).enter()
                  .append('div')
                  .attr('id', d => `h${d}`)
                  .attr('class', 'hidden node')
                  .attr('style', 'background-color:#FFFFFF;border:1px solid black');

  let sigmoidCallback = this.sigmoidNodes.bind(this,
    this.neuralNetwork.sampleHiddenOutputs,
    document.querySelectorAll('.node.hidden'),
    this.displayOutputNodes,
    Text.header7
  );

  let fireCallback = this.fireNodes.bind(this,
    this.neuralNetwork.sampleHiddenInputs,
    this.neuralNetwork.sampleHiddenOutputs,
    document.querySelectorAll('.node.hidden'),
    sigmoidCallback,
    Text.header6
  );

  this.appendNextButton(fireCallback);

  this.connectLayers('input', 'hidden', this.neuralNetwork.sampleWIH);

  this.titleSpace.innerHTML = Text.header5;
  d3.select('#input-nodes-box').attr('class', 'visual-box top');
  setTimeout(() => hiddenNodesBox.attr('class', 'visual-box center'), 0);
};

Visualizer.prototype.sigmoidNodes = function(outputVals, nodeSelection, nextCallback, text) {
  Visualizer.removeNextButton();

  nodeSelection.forEach( (node, idx) => {
    node.children[0].innerHTML = Math.floor(outputVals[idx] * 100) / 100;
  });

  this.appendNextButton(nextCallback);
  this.titleSpace.innerHTML = text;
};

Visualizer.prototype.displayOutputNodes = function() {
  Visualizer.removeNextButton();
  d3.selectAll('p').remove();

  let outputNodesBox = this.workSpace.append('div')
                                        .attr('id', 'output-nodes-box')
                                        .attr('class', 'visual-box hide');

  let data = [...Array(10).keys()];
  outputNodesBox.append('div')
                  .attr('class', 'node-list')
                  .selectAll('div')
                  .data(data).enter()
                  .append('div')
                  .attr('id', d => `o${d}`)
                  .attr('class', 'output node')
                  .attr('style', 'background-color:#FFFFFF;border:1px solid black');

  let sigmoidCallback = this.sigmoidNodes.bind(this,
    this.neuralNetwork.finalOutputs,
    document.querySelectorAll('.node.output'),
    this.clearTopLayers.bind(this),
    Text.header10
  );

  let fireCallback = this.fireNodes.bind(this,
    this.neuralNetwork.finalInputs,
    this.neuralNetwork.finalOutputs,
    document.querySelectorAll('.node.output'),
    sigmoidCallback,
    Text.header9
  );

  this.connectLayers('hidden', 'output', this.neuralNetwork.sampleWHO);

  this.appendNextButton(fireCallback);
  this.titleSpace.innerHTML = Text.header8;
  setTimeout(() => outputNodesBox.attr('class', 'visual-box bottom'));
};

Visualizer.prototype.clearTopLayers = function() {
  Visualizer.removeNextButton();
  d3.select('#input-nodes-box').remove();
  d3.select('#hidden-nodes-box').remove();
  document.querySelectorAll('.node.output').forEach( node => {
    d3.select(node).on('mouseover', () => {});
    d3.select(node).on('mouseout', () => {});
  });
  d3.select('#output-nodes-box').attr('class', 'visual-box center');
  setTimeout(() => this.displayAnswer(), 300);
};

Visualizer.prototype.displayAnswer = function() {
  this.appendNextButton(this.reset.bind(this), 'again!');
  this.titleSpace.innerHTML = Text.header11;

  let digits = d3.select('body').append('div')
                                  .attr('id', 'answer-digits')
                                  .attr('class', 'hide');

  let digitY = d3.select('#output-nodes-box').node().getBoundingClientRect().bottom;

  let data = [...Array(10).keys()];

  digits.selectAll('div')
          .data(data).enter()
          .append('div')
          .attr('class', 'answer-digit')
          .text(d => d)
          .attr('style', (d) => {
            let digitX = d3.select(`#o${d}`).node().getBoundingClientRect().left;
            return `top:${digitY}px;left:${digitX}px`;
          });

  let chosenDigit = this.neuralNetwork.chosenDigit;
  let chosenNodeCoords = this.answerNode().getBoundingClientRect();
  let chosenX = chosenNodeCoords.left;
  let chosenY = chosenNodeCoords.top;

  let arrowBox = d3.select('body').append('div')
                                    .attr('id', 'arrow-box')
                                    .attr('class', 'hide');

  arrowBox.append('div')
            .attr('class', 'arrow')
            .text( () => {
              let article = (chosenDigit == 8) ? ('an') : ('a');
              return `I think that was ${article} ${chosenDigit}`;
            })
            .attr('style', `top:${chosenY}px;left:${chosenX}px;transform:translateY(-200%) translateX(-40%)`);

  setTimeout(() => digits.attr('class', ''), 10);
  setTimeout(() => arrowBox.attr('class', ''), 10);
};

Visualizer.prototype.reset = function() {
  d3.selectAll('.weights-matrix').remove();
  d3.select('#arrow-box').remove();
  d3.select('#answer-digits').remove();
  d3.select('#output-nodes-box').remove();
  d3.selectAll('.next-button').remove();
  this.titleSpace.remove();

  this.displayNumberPicker();
};

Visualizer.prototype.answerNode = function() {
  let answer = this.neuralNetwork.chosenDigit;
  return d3.select(`#o${answer}`).node();
};

Visualizer.prototype.drawImage = function(csv, colorFunc, mouseOverFunc, mouseOutFunc) {
  imageData = numeric.parseCSV(csv)[0];

  let image = this.workSpace.append("svg")
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
      .data(imageData)
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

Visualizer.prototype.floatValue = function(d, i, rect) {
  d3.select(rect[i])
      .attr('stroke-width', 2)
      .attr('width', 11)
      .attr('height', 15)
      .attr('stroke', '#FF3333');

  this.workSpace.append('div')
                    .text(d)
                    .attr('class', 'value-callout');
};

Visualizer.prototype.removeFloat = function(d, i, rect) {
  d3.select(rect[i])
      .attr('stroke-width', 0)
      .attr('width', 12)
      .attr('height', 16);

  d3.select('.value-callout').remove();
};

Visualizer.drawPixel = function(d, i, rect) {
  if (window.mouseDown === 0) { return; }

  d3.select(rect[i]).each( (d, i , rect) => {
    let color = Math.floor(Math.random() * 30);
    d3.select(rect[0]).style('fill', `rgb(${color},${color},${color})`);
    d3.select(rect[0]).data([ 255 - color ]);
  });
};

Visualizer.prototype.connectLayers = function(firstClass, secondClass, weightsMatrix) {
  let weights = d3.select('body').append('svg')
                                    .attr('class', 'weights-matrix');

  let scale = d3.scaleLinear().domain([-0.5, 0.5]).range([0, 1]);

  d3.selectAll(`.node.${firstClass}`).each( (d, idxI, nodesI) => {
    d3.select(nodesI[idxI]).on('mouseover', this.drawPaths)
                            .on('mouseout', this.hidePaths);

    d3.selectAll(`.node.${secondClass}`).each( (d, idxJ, nodesJ) => {
      d3.select(nodesJ[idxJ]).on('mouseover', this.drawPaths)
                              .on('mouseout', this.hidePaths);

      let color = d3.interpolateInferno(scale(weightsMatrix[idxJ][idxI]));
      weights.append('line')
              .attr('stroke-width', 4)
              .attr('stroke', color)
              .data([{ node1: nodesI[idxI].id, node2: nodesJ[idxJ].id }]);
    });
  });
};

Visualizer.prototype.drawPaths = function(d, i, node) {
  let source = node[0];
  if (source.id === '' ) { source = source.parentElement; }
  let boundingRect = source.getBoundingClientRect();
  let x1 = boundingRect.left + boundingRect.width / 2;
  let y1 = boundingRect.bottom - boundingRect.height / 2;

  let paths = d3.selectAll('line').filter( d =>
    (d.node1 === source.id  || d.node2 === source.id)
  );

  paths.each( (d, i, paths) => {
    let targetId = (d.node1 === source.id) ? (d.node2) : (d.node1);
    let target = d3.select(`#${targetId}`).node();

    let boundingRect = target.getBoundingClientRect();
    let x2 = boundingRect.left + boundingRect.width / 2;
    let y2 = boundingRect.top + boundingRect.height / 2;

    d3.select(paths[i])
        .attr('x1', x1)
        .attr('y1', y1)
        .attr('x2', x2)
        .attr('y2', y2)
        .attr('stroke-width', 4);
  });
};

Visualizer.prototype.hidePaths = function(d, i, node) {

  let source = node[0];
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
  let i = 0;
  let len = nodeSelection.length;

  let firing = setInterval( () => {
    d3.select(nodeSelection[i - 1]).each( (d, i, node) => this.hidePaths(d, i, node));

    if (i === len) {
      window.clearInterval(firing);
      this.appendNextButton(nextCallback);
    } else {
      d3.select(nodeSelection[i])
          .attr('style', () => {
            let color = d3.interpolateInferno(outputVals[i]);
            return `background-color:${color}`;
          })
          .append('p')
          .text( () => Math.floor(inputVals[i] * 100) / 100);

      d3.select(nodeSelection[i]).each( (d, i, node) => this.drawPaths(d, i, node));
    }

    i++;
  }, 300);

  this.titleSpace.innerHTML = title;
};

Visualizer.prototype.centerImage = function() {
  for(let i = 0; i < 5; i++) {
      let xSum = 0, ySum = 0;
      let imageData = d3.selectAll('rect').data();

      imageData.forEach( (val, i) => {
        let x = i % 28 - 14;
        let y = Math.floor(i / 28) - 14;
        xSum += val * x;
        ySum += val * y;
      });

      xCenter = Math.floor((xSum / imageData.length) / 255);
      yCenter = Math.floor((ySum / imageData.length) / 255);

      newCSV = [];

      d3.selectAll('rect').each( (d, i, rect) => {
        let newX =  i % 28 + xCenter;
        let newY = Math.floor(i / 28) + yCenter;
        let newI = newY * 28 + newX;
        let color = (newI < 0 || newI > 783) ? (0) : (d3.select(rect[newI]).data()[0]);
        newCSV[i] = color;
      });

      d3.select('#csv-box').remove();

      this.drawImage(newCSV.join(','),
      Visualizer.greyscaleMap255(),
      function() {},
      function() {}
    );
  }
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

Visualizer.prototype.appendNextButton = function(callback, buttonText) {
  buttonText = (buttonText === undefined) ? ('cool') : (buttonText);
  this.headerSpace.append('h3')
                      .attr('class', 'next-button hoverable')
                      .attr('id', `${buttonText.toLowerCase()}`)
                      .text(buttonText)
                      .on('click', callback.bind(this));
};

Visualizer.removeNextButton = function() {
  d3.select('.next-button').remove();
};

module.exports = Visualizer;
