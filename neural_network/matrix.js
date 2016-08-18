const Matrix = function() {
  this.matrix = [];

  if (arguments[0] instanceof Array) {
    this.width = arguments[0].length;
    this.height = 0;

    let i = 0;
    while(i < arguments.length) {
      this.matrix.push(arguments[i]);
      this.height++;
      i++;
    }
  } else if (typeof(arguments[0]) === 'number' ) {
    this.height = arguments[0];
    this.width = arguments[1];

    let i = 0;
    while (i < this.height) {
      this.matrix.push([]);
      i++;
    }
  }
};

Matrix.prototype.set = function(i, j, val) {
  this.matrix[i][j] = val;
};

Matrix.prototype.get = function(i, j) {
  return this.matrix[i][j];
};

Matrix.prototype.each = function(callback) {
  let i = 0; let j = 0;

  while (i < this.height) {
    while (j < this.width) {
      callback(this.matrix[i][j], i, j);
      j++;
    }
    j = 0; i++;
  }

  return this.matrix;
};

Matrix.prototype.map = function(callback) {
  let result = new Matrix(this.height, this.width);

  let i = 0; let j = 0;
  while (i < this.height) {
    while (j < this.width) {
      result.set(i, j, callback(this.matrix[i][j], i, j));
      j++;
    }
    j = 0; i++;
  }

  return result;
};

Matrix.prototype.row = function(idx) {
  return this.matrix[idx];
};

Matrix.prototype.col = function(idx) {
  let column = [];

  let i = 0;
  while (i < this.height) {
    column.push(this.matrix[i][idx]);
    i++;
  }

  return column;
};

Matrix.prototype.dot = function(other) {
  if (this.width !== other.height) {
    throw "Incompatible matrices.";
  }

  let resultHeight = this.height;
  let resultWidth = other.width;
  let result = new Matrix(resultHeight, resultWidth);

  let i = 0; let j = 0;
  while (i < resultHeight) {
    while (j < resultWidth) {
      let row = this.row(i);
      let col = other.col(j);
      result.set(i, j, Matrix.sumProduct(row, col));
      j++;
    }
    j = 0; i++;
  }

  return result;
};

Matrix.sumProduct = function(arr1, arr2) {
  let sum = 0;

  arr1.forEach( (val, idx) =>
    sum += (arr1[idx] * arr2[idx])
  );

  return sum;
};

Matrix.prototype.transpose = function() {
  let result = new Matrix(this.width, this.height);

  let i = 0; let j = 0;
  while (i < this.height) {
    while (j < this.width) {
      result.set(j, i, this.get(i, j));
      j++;
    }
    j = 0; i++;
  }

  return result;
};

Matrix.prototype.times = function(other) {
  let result = new Matrix(this.height, this.width);

  let i = 0; let j = 0;
  while (i < this.height) {
    while (j < this.width) {
      result.set(i, j, this.get(i, j) * other.get(i, j));
      j++;
    }
    j = 0; i++;
  }

  return result;
};

Matrix.prototype.toArray = function() {
  let arr = [];

  this.each( x => arr.push(x) );

  return arr;
};

module.exports = Matrix;
