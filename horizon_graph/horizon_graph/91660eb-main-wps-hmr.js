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
/* harmony import */ var d3__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! d3 */ "./node_modules/d3/src/index.js");
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }



var HorizonGraphD3 = /*#__PURE__*/function (_Component) {
  _inherits(HorizonGraphD3, _Component);

  var _super = _createSuper(HorizonGraphD3);

  function HorizonGraphD3(el, props) {
    var _this;

    _classCallCheck(this, HorizonGraphD3);

    _this.update = _this.update.bind(_assertThisInitialized(_this));
    var margin = {
      top: 10,
      right: 10,
      bottom: 10,
      left: 10
    },
        width = props.width - margin.left - margin.right,
        height = props.height - margin.top - margin.bottom; // Construct scales and axes

    var xDomain = d3__WEBPACK_IMPORTED_MODULE_0__["extent"](props.x);
    var yMax = Math.ceil(d3__WEBPACK_IMPORTED_MODULE_0__["max"](props.y.flat()));
    var yDomain = [0, yMax];
    var bands = yMax;
    var xRange = [margin.left, width - margin.right];
    var xScale = d3__WEBPACK_IMPORTED_MODULE_0__["scaleLinear"](xDomain, xRange);
    var size = (height - margin.top - margin.bottom) / props.names.length;
    var yScale = d3__WEBPACK_IMPORTED_MODULE_0__["scaleLinear"](yDomain, [size, size - bands * (size - props.padding)]);
    var xAxis = d3__WEBPACK_IMPORTED_MODULE_0__["axisBottom"](xScale); // A unique identifier for clip paths (to avoid conflicts).

    var uid = "O-".concat(Math.random().toString(16).slice(2));
    var I = d3__WEBPACK_IMPORTED_MODULE_0__["range"](props.x.length * props.y.length);
    _this.svg = d3__WEBPACK_IMPORTED_MODULE_0__["select"](el).append("svg").style("width", width).style("height", height);

    var g = _this.svg.selectAll("g").data(d3__WEBPACK_IMPORTED_MODULE_0__["group"](I, function (i) {
      return props.names[Math.floor(i / props.x.length)];
    })).join("g").attr("transform", function (_, i) {
      return 'translate(0, ' + (i * size + margin.top) + ')';
    }); // Construct an area generator


    var curve = d3__WEBPACK_IMPORTED_MODULE_0__["curveLinear"];
    var area = d3__WEBPACK_IMPORTED_MODULE_0__["area"]().curve(curve).x(function (i) {
      return xScale(props.x[i % props.x.length]);
    }).y0(yScale(0)).y1(function (i) {
      return yScale(props.y[Math.floor(i / props.x.length)][i % props.x.length]);
    });
    var defs = g.append("defs");
    defs.append("clipPath").attr("id", function (_, i) {
      return "".concat(uid, "-clip-").concat(i);
    }).append("rect").style("y", props.padding).style("width", width).style("height", size - props.padding);
    defs.append("path").attr("id", function (_, i) {
      return "".concat(uid, "-path-").concat(i);
    }).attr("d", function (_ref) {
      var _ref2 = _slicedToArray(_ref, 2),
          I = _ref2[1];

      return area(I);
    });
    var colors = [props.bgcolor].concat(d3__WEBPACK_IMPORTED_MODULE_0__["schemeReds"][Math.max(3, bands - 1)]);
    console.log(colors);
    console.log(bands);
    console.log("new");
    g.attr("clip-path", function (_, i) {
      return "url(".concat(new URL("#".concat(uid, "-clip-").concat(i), location), ")");
    }).selectAll("use").data(function (d, i) {
      return new Array(bands).fill(i);
    }).join("use").attr("fill", function (_, i) {
      return colors[i];
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
    return _possibleConstructorReturn(_this);
  }

  _createClass(HorizonGraphD3, [{
    key: "update",
    value: function update(props) {}
  }]);

  return HorizonGraphD3;
}(Component);



/***/ })

})
//# sourceMappingURL=91660eb-main-wps-hmr.js.map
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiI5MTY2MGViLW1haW4td3BzLWhtci5qcyIsInNvdXJjZVJvb3QiOiIifQ==