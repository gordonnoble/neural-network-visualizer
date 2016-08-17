class Matrix
	include Enumerable

	attr_reader :width, :height

	def initialize(*args)
		@matrix = []

		if args.first.is_a?(Array)
			@width = args.first.count
			@height = 0

			args.each do |arg|
				raise "all rows must be the same size" if arg.count != @width
				@matrix << arg
				@height += 1
			end
		elsif args.first.is_a?(Fixnum)
			@height = args[0]
			@width = args[1]

			@matrix = Array.new(@height){ Array.new(@width) }
		end

		if block_given?
			@matrix = @matrix.map do |row|
				row.map do |el|
					yield
				end
			end
		end
	end

	def each
		i = 0; j = 0

		while i < @height
			while j < @width
				yield(self[i, j])
				j += 1
			end
			j = 0; i += 1
		end

		@matrix
	end

	def map
		i = 0; j = 0 
		result = Matrix.new(@height, @width)

		while i < @height
			while j < @width
				result[i, j] = yield(self[i, j])
				j += 1
			end
			j = 0; i += 1
		end

		result
	end

	def [](i, j)
		@matrix[i][j]
	end

	def []=(i, j, val)
		@matrix[i][j] = val
	end

	def to_s
		@matrix.each { |row| puts row.to_s }
	end

	def arithmetic(operator, arg)
		i = 0; j = 0
		result = Matrix.new(@height, @width)

		while i < @height
			while j < @width
				if arg.is_a?(Numeric)
					result[i, j] = self[i, j].send(operator, arg)
				elsif arg.is_a?(Matrix)
					result[i, j] = self[i, j].send(operator, arg[i, j])
				end
				j += 1
			end
			j = 0; i += 1
		end

		result
	end

	def +(arg)
		arithmetic(:+, arg)
	end

	def -(arg)
		arithmetic(:-, arg)
	end

	def *(arg)
		arithmetic(:*, arg)
	end

	def /(arg)
		arithmetic(:/, arg)
	end
	
	def dot(other)
		raise "incompatible matrices" unless self.width == other.height

		r_height = self.height
		r_width = other.width
		result = Matrix.new(r_height, r_width)

		i = 0; j = 0
		while i < r_height
			while j < r_width
				row = self.row(i)
				col = other.col(j)
				result[i, j] = sum_product(row, col)
				j += 1
			end
			j = 0; i += 1
		end

		result
	end

	def row(idx)
		@matrix[idx]
	end

	def col(idx)
		column = []
		
		i = 0
		while i < @height
			column << self[i, idx]
			i += 1
		end

		column
	end

	def sum_product(array1, array2)
		sum = 0
		array1.each_with_index { |el, i| sum += el * array2[i] }
		sum
	end

	def transpose
		result = Matrix.new(@width, @height)

		i = 0; j = 0
		
		while i < @height
			while j < @width
				result[j, i] = self[i, j]
				j += 1
			end
			j = 0; i += 1
		end

		result
	end

	def to_a
		result = []
		self.each{ |el| result << el }
		result
	end
end
