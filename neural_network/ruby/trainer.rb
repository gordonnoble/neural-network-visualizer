require_relative 'neural_network'

# Sets up neural network for images with 784 pixels
input_nodes = 784
hidden_nodes = 100
output_nodes = 10
learning_rate = 0.1

netty = NeuralNetwork.new(input_nodes, hidden_nodes, output_nodes, learning_rate)


# Iterates through a set of 100 images five times to train the network
training_digits = File.readlines('../data/mnist_train_100.csv')

5.times do
	training_digits.each do |digit|
		all_values = digit.split(',').map{ |x| x.to_f }
		inputs = all_values[1..-1].map{ |x| x / 255.0 * 0.99 + 0.01 }

		targets = Array.new(output_nodes) { 0.01 }
		targets[all_values.first] = 0.99

		netty.train(inputs, targets)
	end
end


# Tests the network against 10 new images
test_digits = File.readlines('../data/mnist_test_10.csv')

correct = 0

test_digits.each do |digit|
	all_values = digit.split(',').map{ |x| x.to_f }
	inputs = all_values[1..-1].map{ |x| x / 255.0 * 0.99 + 0.01 }

	netty_output = netty.query(inputs).to_a
	max_node_output = netty_output.max
	netty_answer = netty_output.index(max_node_output)

	correct_answer = all_values[0].to_i

	correct += 1 if correct_answer == netty_answer
end

puts "Total correct: #{correct}"
puts "Accuracy: #{correct.to_f / test_digits.count}"

