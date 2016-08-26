const Text = {
  intro: "Hi, I'm a neural network. I'm going to show you how I identify handwritten numbers. Before we begin, let me tell you a bit about myself. Fundamentally I'm just a bunch of connected \"nodes\". Each node knows two things: it's own number value and its children nodes. Every node has the ability to \"fire\", at which point the node's value is transmitted to all child nodes. Not all connections are equal, though. Some are weighted more heavily than others.<br><br>\
  \
  My nodes are organized into three layers. The first layer is for taking in information, in my case pixel data, and it's by far the largest with about 800 nodes. The second layer is much smaller at 100 nodes, and it serves to aggregate firing from the first layer. My final layer has exactly 10 nodes, and each one corresponds to a digit zero through nine. After a little training (it's happening right now!) I adjust the connections between nodes so that one node in the final layer wins out, and that's my guess at which digit I'm looking at. Sounding a little abstract? Perfect! That's why I'm here. Onward!",

  header1: "First you'll need to pick a number.",

  header1_5: "Click and drag to draw your digit. Write big!",

  header2: "Great, here's your image. It has 784 pixels (28x28), each with a greyscale value. <br>\
  Hover over a pixel's to see its value.",

  header3: "I like values between 0 and 1, so I've scaled each pixel value. Hover again!",

  header4: "For each of the 784 pixels, I have a node in my first layer.<br>\
  Each node takes in a single pixel's value. Here's a small sample.",

  header5: "I have 100 nodes in my second layer, so again this is just a sample. Hover over a node to see its connections.<br>\
  Connection are weighted between 0.5 and -0.5, visualized as a yellow-orange-red-blue scale.",

  header6: "Fire! Each node in the second layer sums the weighted inputs from the first layer.",

  header7: "To keep me in my happy place, I've scaled everything between 0 and 1 again.",

  header8: "Alright, let's bring out the third and final layer. Hover to see those connections.",

  header9: "Fire! Just like last time, each node sums its inputs.",

  header10: "One more time, I'll scale everything down.",

  header11: "See how one node stands out? All that chatter between nodes in the first two layers had the effect of activating that one node in the final layer and silencing the rest."

};

module.exports = Text;
