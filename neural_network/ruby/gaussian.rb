module Gaussian
	def rand_around_zero(stddev)
		rand = lambda {Kernel.rand}
		theta = 2 * Math::PI * rand.call
	  rho = Math.sqrt(-2 * Math.log(1 - rand.call))
	  scale = stddev * rho
		scale * Math.cos(theta)
	end
end
