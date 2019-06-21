"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _model = require("./model/model");

var model = _interopRequireWildcard(_model);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

class Solver {

  constructor() {}

  solve() {
    return "hello";
  }

}
exports.default = Solver;