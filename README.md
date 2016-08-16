# NeuralNetworkVisualizer
A program to visualize the steps a simple neural network walks through to interpret a handwritten number.
The neural network will be a JavaScript implementation of the python neural network here: https://github.com/makeyourownneuralnetwork/makeyourownneuralnetwork

## MVP
- [ ] Ability to pick a handwritten digit from 0 to 9
- [ ] Display of CSV interpretation of image
- [ ] Visualization of CSV values affecting first node layer's value
- [ ] Hover over first layer node to show it's linked nodes and a visualization of their weights (color map or thickness)
- [ ] Fire first layer and see middle node layers nodes' values
- [ ] Fire middle layer and see final layer's nodes' values
- [ ] Visualization of most-fired node correctly associated with a digit

## Technologies, APIs
The JavaScript neural network will need a good math library for matrices, the sigmoid function, and random numbers on a curve. Fortunately there are plenty of those. E.g. http://mathjs.org/index.html, http://glmatrix.net/

## Wireframes
![number-picker]
![number-to-csv]
![first-layer]
![first-layer-hover]
![second-layer]
![second-layer-hover]
![final-layer-output]


[number-picker]: ./wireframes/number_picker.pdf
[number-to-csv]: ./wireframes/number_to_csv.pdf
[first-layer]: ./wireframes/first_layer.pdf
[first-layer-hover]: ./wireframes/first_layer_hover.pdf
[second-layer]: ./wireframes/second_layer.pdf
[second-layer-hover]: ./wireframes/second_layer_hover.pdf
[final-layer-output]: ./wireframes/final_output_layer.pdf

## Backend
None

## Implementation Timeline
Phase 1.0: JavaScript neural network
Phase 1.1: Number picker and number to csv visualization
Phase 2.0: First layer visualization
Phase 2.1: First layer hover visualization and firing
Phase 3.0: Middle layer visualization
Phase 3.1: Middle layer hover visualization, firing, and final output layer



