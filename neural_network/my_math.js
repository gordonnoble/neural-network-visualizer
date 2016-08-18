const MyMath = {
  randAroundZero(stdDev) {
    let theta = 2 * Math.PI * Math.random();
    let rho = Math.sqrt(-2 * Math.log(1 - Math.random()));
    let scale = stdDev * rho;
    return scale * Math.cos(theta);
  },
  sigmoid(x) {
    let pow = Math.pow(Math.E, -x);
    return (1.0 / (1.0 + pow));
  }
};

module.exports = MyMath;
