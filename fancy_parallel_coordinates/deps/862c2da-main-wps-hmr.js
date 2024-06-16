webpackHotUpdatefancy_parallel_coordinates("main",{

/***/ "./src/lib/components/FancyParallelCoordinatesD3.js":
/*!**********************************************************!*\
  !*** ./src/lib/components/FancyParallelCoordinatesD3.js ***!
  \**********************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return FancyParallelCoordinatesD3; });
/* harmony import */ var d3__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! d3 */ "./node_modules/d3/src/index.js");
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }



var FancyParallelCoordinatesD3 = /*#__PURE__*/function () {
  function FancyParallelCoordinatesD3(el, props) {
    _classCallCheck(this, FancyParallelCoordinatesD3);

    this.update = this.update.bind(this);
    var margin = {
      top: 20,
      right: 0,
      bottom: 10,
      left: 0
    },
        width = props.dataWidth - margin.left - margin.right,
        height = props.height - margin.top - margin.bottom;
    var dimensions = props.data.map(function (_ref) {
      var label = _ref.label;
      return label;
    });
    this.parent = d3__WEBPACK_IMPORTED_MODULE_0__["select"](el).append("div").style("width", props.width).style("overflow-x", "scroll").style("-webkit-overflow-scrolling", "touch");
    this.svg = this.parent.append('svg').attr('width', width + margin.left + margin.right).attr('height', height + margin.top + margin.bottom).append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')'); // Create axes for data

    var scales = {};

    for (var i = 0; i < dimensions.length; i++) {
      scales[dimensions[i]] = d3__WEBPACK_IMPORTED_MODULE_0__["scaleLinear"]().domain(props.data[i].range).range([height, 0]);
    } // Create x-axes to lay out the y-axes


    var xScale = d3__WEBPACK_IMPORTED_MODULE_0__["scalePoint"]().range([0, width]).padding(1).domain(dimensions); // draw lines

    var values = [];
    props.data.map(function (d) {
      for (var _i = 0; _i < d.values.length; _i++) {
        if (values.length < d.values.length) {
          values.push({});
        }

        values[_i][d.label] = d.values[_i];
        values[_i]['id'] = _i;
      }
    });
    var foreground = this.svg.append("g").selectAll("path").data(values).enter().append("path").attr("d", path).style("fill", "none").style("stroke", function (d) {
      return d.id in props.selection ? "#005454" : "grey";
    }).style("opacity", 0.5); // Draw the axes

    var axes = this.svg.selectAll("myAxis").data(dimensions).enter().append('g') // move to right position
    .attr("transform", function (d) {
      return "translate(" + xScale(d) + ")";
    }) // build axes
    .each(function (d) {
      d3__WEBPACK_IMPORTED_MODULE_0__["select"](this).call(d3__WEBPACK_IMPORTED_MODULE_0__["axisLeft"]().scale(scales[d]));
    });
    axes.append("text").style("text-anchor", "middle").attr("y", -9).text(function (d) {
      return d;
    });
    axes.selectAll("path").style("stroke", "red");
    axes.selectAll("line").style("stroke", "green");
    this.svg.selectAll("text").style("fill", "purple"); // brushing

    axes.each(function (d) {
      d3__WEBPACK_IMPORTED_MODULE_0__["select"](this).call(scales[d].brush = d3__WEBPACK_IMPORTED_MODULE_0__["brushY"]().extent([[-10, 0], [10, height]]).on("start", brush).on("brush", brush).on("end", brush));
    }).selectAll("rect").attr("x", -8).attr("width", 16);
    var selections = new Map();

    function brush(_ref2, key) {
      var selection = _ref2.selection;
      if (selection === null) selections["delete"](key);else selections.set(key, selection.map(scales[key].invert));
      var selected = [];
      foreground.each(function (d) {
        var active = Array.from(selections).every(function (_ref3) {
          var _ref4 = _slicedToArray(_ref3, 2),
              key = _ref4[0],
              _ref4$ = _slicedToArray(_ref4[1], 2),
              max = _ref4$[0],
              min = _ref4$[1];

          return d[key] >= min && d[key] <= max;
        });
        d3__WEBPACK_IMPORTED_MODULE_0__["select"](this).style("stroke", active ? "#005454" : "grey");

        if (active) {
          d3__WEBPACK_IMPORTED_MODULE_0__["select"](this).raise();
          selected.push(d);
          props.setProps({
            selection: selection
          });
        }
      });
    } // Reordering for axes


    var dragging = {};

    function position(d) {
      var v = dragging[d];
      return v == null ? xScale(d) : v;
    }

    axes.call(d3__WEBPACK_IMPORTED_MODULE_0__["drag"]().on("start", function (event, d) {
      if (event.y > margin.top) {
        return;
      }

      dragging[d] = this.__origin__ = xScale(d);
      this.__dragged__ = false;
    }).on("drag", function (event, d) {
      if (!this.__origin__) {
        return;
      }

      dragging[d] = Math.min(width, Math.max(0, this.__origin__ += event.dx));
      foreground.attr("d", path);
      dimensions.sort(function (a, b) {
        return position(a) - position(b);
      });
      xScale.domain(dimensions);
      axes.attr("transform", function (d) {
        return "translate(" + position(d) + ")";
      });
      this.__dragged__ = true;
    }).on("end", function (event, d) {
      if (!this.__dragged__) {// no movement
      } else {
        //reorder
        d3__WEBPACK_IMPORTED_MODULE_0__["select"](this).transition().attr("transform", "translate(" + xScale(d) + ")"); // TODO: Add brush
      }

      xScale.domain(dimensions);
      delete this.__dragged__;
      delete this.__origin__;
      delete dragging[d];
    })); // Returns the path for a given data point.

    function path(d) {
      return d3__WEBPACK_IMPORTED_MODULE_0__["line"]()(dimensions.map(function (p) {
        return [xScale(p), scales[p](d[p])];
      }));
    }
  }

  _createClass(FancyParallelCoordinatesD3, [{
    key: "update",
    value: function update(props) {}
  }]);

  return FancyParallelCoordinatesD3;
}();



/***/ })

})
//# sourceMappingURL=862c2da-main-wps-hmr.js.map
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiI4NjJjMmRhLW1haW4td3BzLWhtci5qcyIsInNvdXJjZVJvb3QiOiIifQ==