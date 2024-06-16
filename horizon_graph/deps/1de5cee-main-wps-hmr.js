webpackHotUpdatehorizon_graph("main",{

/***/ "./src/lib/components/HorizonGraphD3.js":
/*!**********************************************!*\
  !*** ./src/lib/components/HorizonGraphD3.js ***!
  \**********************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return HorizonGraphD3; });
!(function webpackMissingModule() { var e = new Error("Cannot find module 'd3'"); e.code = 'MODULE_NOT_FOUND'; throw e; }());
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }



var HorizonGraphD3 = /*#__PURE__*/function () {
  function HorizonGraphD3(el, props) {
    _classCallCheck(this, HorizonGraphD3);

    console.log("Constructor");
    this.update = this.update.bind(this);
    var margin = {
      top: 30,
      right: 100,
      bottom: 50,
      left: 50
    },
        width = props.dataWidth - margin.left - margin.right,
        height = props.height - margin.top - margin.bottom; // Construct scales and axes

    var xDomain = !(function webpackMissingModule() { var e = new Error("Cannot find module 'd3'"); e.code = 'MODULE_NOT_FOUND'; throw e; }())(props.x);
    var yDomain = [0, !(function webpackMissingModule() { var e = new Error("Cannot find module 'd3'"); e.code = 'MODULE_NOT_FOUND'; throw e; }())(props.y)];
    var xRange = [margin.left, width - margin.right];
    var xScale = !(function webpackMissingModule() { var e = new Error("Cannot find module 'd3'"); e.code = 'MODULE_NOT_FOUND'; throw e; }())(xDomain, xRange);
    var size = height / props.names.length;
    var yScale = !(function webpackMissingModule() { var e = new Error("Cannot find module 'd3'"); e.code = 'MODULE_NOT_FOUND'; throw e; }())(yDomain, [size, size - props.bands * (size - props.padding)]);
    var xAxis = !(function webpackMissingModule() { var e = new Error("Cannot find module 'd3'"); e.code = 'MODULE_NOT_FOUND'; throw e; }())(xScale); // A unique identifier for clip paths (to avoid conflicts).

    var uid = "O-".concat(Math.random().toString(16).slice(2));
    console.log(el);
    this.svg = !(function webpackMissingModule() { var e = new Error("Cannot find module 'd3'"); e.code = 'MODULE_NOT_FOUND'; throw e; }())(el).append("svg").style("width", width).style("height", height);
    var g = svg.selectAll("g").data(names).join("g").attr("transform", function (_, i) {
      return 'translate(0, ${i*size + marginTop})';
    }); // Construct an area generator

    var curve = !(function webpackMissingModule() { var e = new Error("Cannot find module 'd3'"); e.code = 'MODULE_NOT_FOUND'; throw e; }());
    var area = !(function webpackMissingModule() { var e = new Error("Cannot find module 'd3'"); e.code = 'MODULE_NOT_FOUND'; throw e; }())().curve(curve).x(function (i) {
      return xScale(props.x);
    }).y0(yScale(0)).y1(function (i) {
      return yScale(props.y[i]);
    });
    var defs = g.append("defs");
    defs.append("clipPath").attr("id", function (_, i) {
      return "".concat(uid, "-clip-").concat(i);
    }).append("rect").attr("y", padding).attr("width", width).attr("height", size - props.padding);
    defs.append("path").attr("id", function (_, i) {
      return "".concat(uid, "-path-").concat(i);
    }).attr("d", function (_ref) {
      var _ref2 = _slicedToArray(_ref, 2),
          I = _ref2[1];

      return area(I);
    });
    var colors = !(function webpackMissingModule() { var e = new Error("Cannot find module 'd3'"); e.code = 'MODULE_NOT_FOUND'; throw e; }())[Math.max(3, props.bands)];
    g.attr("clip-path", function (_, i) {
      return "url(".concat(new URL("#".concat(uid, "-clip-").concat(i), location), ")");
    }).selectAll("use").data(function (d, i) {
      return new Array(props.bands).fill(i);
    }).join("use").attr("fill", function (_, i) {
      return colors[i + Math.max(0, 3 - props.bands)];
    }).attr("transform", function (_, i) {
      return "translate(0,".concat(i * size, ")");
    }).attr("xlink:href", function (i) {
      return "".concat(new URL("#".concat(uid, "-path-").concat(i), location));
    });
    g.append("text").attr("x", margin.left).attr("y", (size + props.padding) / 2).attr("dy", "0.35em").text(function (_ref3) {
      var _ref4 = _slicedToArray(_ref3, 1),
          name = _ref4[0];

      return name;
    });
  }

  _createClass(HorizonGraphD3, [{
    key: "update",
    value: function update(props) {}
  }]);

  return HorizonGraphD3;
}();



/***/ })

})
//# sourceMappingURL=1de5cee-main-wps-hmr.js.map
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiIxZGU1Y2VlLW1haW4td3BzLWhtci5qcyIsInNvdXJjZVJvb3QiOiIifQ==