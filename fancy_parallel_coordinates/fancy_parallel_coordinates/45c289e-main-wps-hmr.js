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
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }



var FancyParallelCoordinatesD3 = /*#__PURE__*/function () {
  function FancyParallelCoordinatesD3(el, props) {
    _classCallCheck(this, FancyParallelCoordinatesD3);

    this.update = this.update.bind(this);
    var margin = {
      top: 30,
      right: 100,
      bottom: 50,
      left: 50
    },
        width = props.width - margin.left - margin.right,
        height = props.height - margin.top - margin.bottom;
    var dimensions = props.data.map(function (_ref) {
      var label = _ref.label;
      return label;
    });
    d3__WEBPACK_IMPORTED_MODULE_0__["select"](el).append('canvas').attr('id', 'foreground');
    this.svg = d3__WEBPACK_IMPORTED_MODULE_0__["select"](el).append('svg').attr('width', width + margin.left + margin.right).attr('height', height + margin.top + margin.bottom).append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')'); // Create axes for data

    var scales = {};

    for (var i = 0; i < dimensions.length; i++) {
      scales[dimensions[i]] = d3__WEBPACK_IMPORTED_MODULE_0__["scaleLinear"]().domain(props.data[i].range).range([height, 0]);
    } // Foreground canvas for primary view


    var foreground = document.getElementById('foreground').getContext('2d');
    foreground.globalCompositeOperation = 'destination-over';
    foreground.strokeStyle = "rgba(0, 100, 160, 0.8)";
    foreground.lineWidth = 1.7;
    foreground.fillText("Loading...", width / 2, height / 2); // Create x-axes to lay out the y-axes

    var xScale = d3__WEBPACK_IMPORTED_MODULE_0__["scalePoint"]().range([0, width]).padding(1).domain(dimensions); // Draw the axes

    this.svg.selectAll("myAxis").data(dimensions).enter().append('g') // move to right position
    .attr("transform", function (d) {
      return "translate(" + xScale(d) + ")";
    }) // build axes
    .each(function (d) {
      d3__WEBPACK_IMPORTED_MODULE_0__["select"](this).call(d3__WEBPACK_IMPORTED_MODULE_0__["axisLeft"]().scale(scales[d]));
    }) // add title
    .append("text").style("text-anchor", "middle").attr("y", -9).text(function (d) {
      return d;
    }).style("fill", "black"); // render lines

    paths(props.data, foreground);
  }

  _createClass(FancyParallelCoordinatesD3, [{
    key: "update",
    value: function update(props) {}
  }]);

  return FancyParallelCoordinatesD3;
}(); // Draw a single polyline




function path(d, ctx) {
  ctx.beginPath();
  var x0 = xScale(0) - 15,
      y0 = scales[dimensions[0]](d[0].values); // left edge

  ctx.moveTo(x0, y0);
  dimensions.map(function (p, i) {
    var x = xScale(p),
        y = scales[p](d[i].values);
    var cp1x = x - 0.88 * (x - x0);
    var cp1y = y0;
    var cp2x = x - 0.12 * (x - x0);
    var cp2y = y;
    ctx.bezierCurveTo(cp1x, cp1y, cp2y, cp2y, x, y);
    x0 = x;
    y0 = y;
  });
  ctx.lineTo(x0 + 15, y0); // right edge

  ctx.stroke();
} // render polylines i to i+render_speed


function render_range(selection, i, max, opacity) {
  selection.slice(i, max).forEach(function (d) {
    path(d, foreground);
  });
} // render a set of polylines


function paths(selected, ctx, count) {
  var n = selected.length,
      i = 0,
      opacity = d3__WEBPACK_IMPORTED_MODULE_0__["min"]([2 / Math.pow(n, 0.3), 1]),
      timer = new Date().getTime(); // render all lines until finished

  function animloop() {
    if (i >= n) return true;
    var max = d3__WEBPACK_IMPORTED_MODULE_0__["min"]([i + render_speed, n]);
    render_range(selected, i, max, opacity);
    i = max;
    timer = optimize(timer); // adjusts render_speed
  }

  d3__WEBPACK_IMPORTED_MODULE_0__["timer"](animloop());
}

/***/ })

})
//# sourceMappingURL=45c289e-main-wps-hmr.js.map
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiI0NWMyODllLW1haW4td3BzLWhtci5qcyIsInNvdXJjZVJvb3QiOiIifQ==