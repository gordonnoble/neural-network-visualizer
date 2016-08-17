require_relative 'gaussian'
require './matrix.rb'
require 'byebug'

class NeuralNetwork
	include Gaussian

	def initialize(input_nodes, hidden_nodes, output_nodes, learning_rate)
		@input_nodes, @hidden_nodes, @output_nodes = input_nodes, hidden_nodes, output_nodes
		@learning_rate = learning_rate

		@sig_f = lambda do |x|
			1.0 / (1.0 + Math::E**(-x.to_f))
		end

		stddev = @hidden_nodes**(-0.5)
		@wih = Matrix.new(@hidden_nodes, @input_nodes){ rand_around_zero(stddev) }
		stddev = @output_nodes**(-0.5)
		@who = Matrix.new(@output_nodes, @hidden_nodes){ rand_around_zero(stddev) }
	end

	def query(inputs)
		inputs = Matrix.new(inputs).transpose

		hidden_inputs = @wih.dot(inputs)
		hidden_outputs = hidden_inputs.map{ |x| @sig_f.call(x) }

		final_inputs = @who.dot(hidden_outputs)
		final_outputs = final_inputs.map{ |x| @sig_f.call(x) }
	end

	def train(inputs, targets)
		inputs = Matrix.new(inputs).map{ |x| x.to_f }.transpose
		targets = Matrix.new(targets).map{ |x| x.to_f }.transpose

		hidden_inputs = @wih.dot(inputs)
		hidden_outputs = hidden_inputs.map{ |x| @sig_f.call(x) }

		final_inputs = @who.dot(hidden_outputs)
		final_outputs = final_inputs.map{ |x| @sig_f.call(x) }

		output_errors = targets - final_outputs
		hidden_errors = @who.transpose.dot(output_errors)

		inv_final_out = final_outputs.map{ |x| 1 - x }
		@who += (output_errors * final_outputs * inv_final_out).dot(hidden_outputs.transpose) * @learning_rate
		inv_hidden_out = hidden_outputs.map{ |x| 1 - x }
		@wih += (hidden_errors * hidden_outputs * inv_hidden_out).dot(inputs.transpose) * @learning_rate
	end
end
