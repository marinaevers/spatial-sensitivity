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
    var _this = this;

    _classCallCheck(this, HorizonGraphD3);

    this.update = this.update.bind(this);
    this.summaryPlot = this.summaryPlot.bind(this);
    var margin = {
      top: 5,
      right: 60,
      bottom: 20,
      left: 30
    },
        width = props.width - margin.left - margin.right,
        height = props.height - margin.top - margin.bottom;
    this.margin = margin;
    this.width = width;
    this.height = height; // Construct scales and axes

    this.numberHorizons = Math.min(props.numberHorizons, props.y.length);
    var xDomain = d3__WEBPACK_IMPORTED_MODULE_0__["extent"](props.x);
    var yMax = Math.ceil(d3__WEBPACK_IMPORTED_MODULE_0__["max"](props.y.flat()));
    this.yDomain = [0, yMax];
    this.bands = Math.min(2, Math.ceil(d3__WEBPACK_IMPORTED_MODULE_0__["max"](props.y.slice(this.numberHorizons).flat()))); // number of bands for lowest plot

    var bands = yMax;
    var xRange = [margin.left, width - margin.right];
    this.xScale = d3__WEBPACK_IMPORTED_MODULE_0__["scaleLinear"](xDomain, xRange);
    var size = (height - margin.top - margin.bottom) / (this.numberHorizons + this.bands);
    this.size = size;
    var yScale = d3__WEBPACK_IMPORTED_MODULE_0__["scaleLinear"](this.yDomain, [this.size, size - bands * (size - props.padding)]); // A unique identifier for clip paths (to avoid conflicts).

    var uid = "O-".concat(Math.random().toString(16).slice(2));
    var I = d3__WEBPACK_IMPORTED_MODULE_0__["range"](props.x.length * this.numberHorizons);
    this.svg = d3__WEBPACK_IMPORTED_MODULE_0__["select"](el).append("svg").attr('width', width + margin.left + margin.right).attr('height', height + margin.top + margin.bottom).append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
    var g = this.svg.selectAll("g").data(d3__WEBPACK_IMPORTED_MODULE_0__["group"](I, function (i) {
      return props.names[Math.floor(i / props.x.length)];
    })).join("g").attr("transform", function (_, i) {
      return 'translate(0, ' + (i * size + margin.top) + ')';
    }); // Construct an area generator

    this.curve = d3__WEBPACK_IMPORTED_MODULE_0__["curveLinear"];
    var area = d3__WEBPACK_IMPORTED_MODULE_0__["area"]().curve(this.curve).x(function (i) {
      return _this.xScale(props.x[i % props.x.length]);
    }).y0(yScale(0)).y1(function (i) {
      return yScale(props.y[Math.floor(i / props.x.length)][i % props.x.length]);
    });
    var defs = g.append("defs");
    defs.append("clipPath").attr("id", function (_, i) {
      return "".concat(uid, "-clip-").concat(i);
    }).append("rect").attr("y", props.padding).attr("width", width).attr("height", size - props.padding);
    defs.append("path").attr("id", function (_, i) {
      return "".concat(uid, "-path-").concat(i);
    }).attr("d", function (_ref) {
      var _ref2 = _slicedToArray(_ref, 2),
          I = _ref2[1];

      return area(I);
    });
    var colors = [props.bgcolor].concat(d3__WEBPACK_IMPORTED_MODULE_0__["schemeReds"][Math.max(3, bands - 1)]);
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
    g.append("text").attr("x", margin.left).attr("y", (size + props.padding) / 2) //.attr("dy", "0.35em")
    .text(function (_ref3) {
      var _ref4 = _slicedToArray(_ref3, 1),
          name = _ref4[0];

      return name;
    }).attr("font-size", props.fontSize); // Color bar

    var legendProps = {
      title: "Sensitivity",
      tickSize: 6,
      width: 20,
      height: props.numberHorizons * this.size,
      // + tickSize,
      marginTop: margin.top,
      marginRight: 0,
      marginBottom: 0,
      // + tickSize,
      marginLeft: 20 //, ticks: width / 64

    }; // function ramp(color, n) {
    //     const canvas = document.createElement("canvas");
    //     canvas.width = 1;
    //     canvas.height = n;
    //     const context = canvas.getContext("2d");
    //     for (let i = 0; i < n; ++i) {
    //         context.fillStyle = color(i);
    //         context.fillRect(0, n - 1 - i, 1, 1);
    //     }
    //     console.log(context)
    //     return canvas;
    // }

    var n = Math.min(colors.length, bands);
    var colorScale = d3__WEBPACK_IMPORTED_MODULE_0__["scaleQuantize"]().domain([0, yMax]).range(colors.slice(0, n));
    var x = colorScale.copy();
    var colorBar = this.svg.append("g");
    colorBar.attr("transform", 'translate(' + (width - margin.right + legendProps.marginLeft) + ',' + (legendProps.marginTop + props.padding) + ')').selectAll("rect").data(d3__WEBPACK_IMPORTED_MODULE_0__["range"](n)).enter().append("rect").attr("y", function (d) {
      return legendProps.height / n * d;
    }).attr("x", 0).attr("width", legendProps.width).attr("height", legendProps.height / n).attr("fill", function (d) {
      return colors[n - 1 - d];
    }); //.attr("x", width)
    //.attr("y", legendProps.marginTop + props.padding);
    // colorBar.append("image")
    //     .attr("width", legendProps.width - legendProps.marginLeft - legendProps.marginRight)
    //     .attr("height", legendProps.height - legendProps.marginTop - legendProps.marginBottom + props.padding)
    //     .attr("preserveAspectRatio", "none")
    //     .attr("xlink:href", ramp(colorScale, n).toDataURL());

    var colorBarScale = d3__WEBPACK_IMPORTED_MODULE_0__["scaleLinear"]().domain([0, yMax]).range([legendProps.height, 0]);
    var legendAxis = d3__WEBPACK_IMPORTED_MODULE_0__["axisRight"]().scale(colorBarScale).ticks(n + 1);
    this.legendTitle = colorBar.append("g").style("font-size", props.fontSize).attr("transform", 'translate(' + legendProps.width + ',0)').call(legendAxis).call(function (g) {
      return g.select(".domain").remove();
    }).append("text").attr("x", -legendProps.height / 2).attr("y", -legendProps.width - 5).attr("fill", "black").attr("text-anchor", "middle").attr("font-size", props.fontSize).text(legendProps.title).attr("transform", "rotate(-90)");
    this.summaryPlot(props); // We initially generate a SVG group to keep our brushes' DOM elements in:

    var gBrushes = this.svg.append('g').attr("class", "brushes"); // We also keep the actual d3-brush functions and their IDs in a list:

    var brushes = [];
    var xScale = this.xScale;
    var ranges = [];

    function newBrush() {
      var brush = d3__WEBPACK_IMPORTED_MODULE_0__["brushX"]().extent([[margin.left, 0], [width - margin.right, height - margin.bottom]]).on("start", brushstart).on("brush", brushed).on("end", brushend);
      brushes.push({
        id: brushes.length,
        brush: brush
      });

      function brushstart(event) {
        // your stuff here
        if (event.sourceEvent.shiftKey) {
          gBrushes.selectAll(".brush").remove();
          brushes = [];
          ranges = [];
          this.deleted = true;
        }
      }

      function brushed() {// your stuff here
      }

      function brushend() {
        if (this.deleted) {
          newBrush();
        } else {
          // Figure out if our latest brush has a selection
          var lastBrushID = brushes[brushes.length - 1].id;
          var lastBrush = document.getElementById('brush-' + lastBrushID);
          var selection = d3__WEBPACK_IMPORTED_MODULE_0__["brushSelection"](lastBrush);
          ranges.push([xScale.invert(selection[0]), xScale.invert(selection[1])]);
          props.setProps({
            selectedRanges: ranges
          }); // If it does, that means we need another one

          if (selection && selection[0] !== selection[1]) {
            newBrush();
          }
        } // Always draw brushes


        drawBrushes();
      }
    }

    function drawBrushes() {
      var brushSelection = gBrushes.selectAll('.brush').data(brushes, function (d) {
        return d.id;
      }); // Set up new brushes

      brushSelection.enter().insert("g", '.brush').attr('class', 'brush').attr('id', function (brush) {
        return "brush-" + brush.id;
      }).each(function (brushObject) {
        //call the brush
        brushObject.brush(d3__WEBPACK_IMPORTED_MODULE_0__["select"](this));
      });
      /* REMOVE POINTER EVENTS ON BRUSH OVERLAYS
       *
       * This part is abbit tricky and requires knowledge of how brushes are implemented.
       * They register pointer events on a .overlay rectangle within them.
       * For existing brushes, make sure we disable their pointer events on their overlay.
       * This frees the overlay for the most current (as of yet with an empty selection) brush to listen for click and drag events
       * The moving and resizing is done with other parts of the brush, so that will still work.
       */

      brushSelection.each(function (brushObject) {
        d3__WEBPACK_IMPORTED_MODULE_0__["select"](this).attr('class', 'brush').selectAll('.overlay').style('pointer-events', function () {
          var brush = brushObject.brush;

          if (brushObject.id === brushes.length - 1 && brush !== undefined) {
            return 'all';
          } else {
            return 'none';
          }
        });
      });
      brushSelection.exit().remove();
      d3__WEBPACK_IMPORTED_MODULE_0__["select"]("rect.selection").style("fill", "#dbdbdb").style("stroke", "black").style("stroke-width", "3px");
    }

    newBrush();
    drawBrushes();
    /*        this.svg
                .call(d3.brushX()
                    .extent([[margin.left, -2], [width - margin.right, height + 2]]));*/

    /*        d3.select("rect.selection")
                .attr("fill", "#dbdbdb")
                .attr("stroke", "black")
                .attr("stroke-width", "3px")*/
  }

  _createClass(HorizonGraphD3, [{
    key: "update",
    value: function update(props) {//console.log("update");
    }
  }, {
    key: "summaryPlot",
    value: function summaryPlot(props) {
      var _this2 = this;

      var summaryPlot = this.svg.append("g"); // Create new I array with larger numbers
      // Create own yScale

      var yScale = d3__WEBPACK_IMPORTED_MODULE_0__["scaleLinear"]([0, d3__WEBPACK_IMPORTED_MODULE_0__["max"](props.y.slice(this.numberHorizons).flat())], [this.size * this.bands, props.padding]);
      var area = d3__WEBPACK_IMPORTED_MODULE_0__["area"]().curve(this.curve).x(function (i) {
        return _this2.xScale(props.x[i % props.x.length]);
      }).y0(yScale(0)).y1(function (i) {
        return yScale(props.y[Math.floor(i / props.x.length)][i % props.x.length]);
      });
      var xAxis = d3__WEBPACK_IMPORTED_MODULE_0__["axisBottom"](this.xScale);
      var yAxis = d3__WEBPACK_IMPORTED_MODULE_0__["axisLeft"](yScale).ticks(Math.max(2, this.bands));
      summaryPlot.attr("transform", function (_, i) {
        return "translate(0,".concat(_this2.size * _this2.numberHorizons + _this2.margin.top, ")");
      }).append("g").call(xAxis).attr("transform", function (_, i) {
        return "translate(0,".concat(_this2.size * _this2.bands, ")");
      }); // x-label

      summaryPlot.append("text").attr("text-anchor", "middle").attr("x", this.width / 2).attr("y", this.size * this.bands + this.margin.bottom + props.fontSize).attr("font-size", props.fontSize).text(props.xLabel);
      summaryPlot.append("text") //.attr("transform", "rotate(-90)")
      .attr("x", -(this.size * (this.bands + 1)) / 2).attr("y", -this.margin.left + props.fontSize).text("text-anchor", "middle").attr("font-size", props.fontSize).text(props.yLabel).attr("transform", "rotate(-90)");
      summaryPlot.append("g").call(yAxis).attr("transform", function (_, i) {
        return "translate(".concat(_this2.margin.left, ", 0)");
      });
      summaryPlot.selectAll("text").attr("font-size", props.fontSize);
      var I = d3__WEBPACK_IMPORTED_MODULE_0__["range"](props.x.length * this.numberHorizons, props.x.length * props.y.length);
      var summarySource = summaryPlot.selectAll(".area").data(d3__WEBPACK_IMPORTED_MODULE_0__["group"](I, function (i) {
        return props.names[Math.floor(i / props.x.length)];
      })).enter().append("g").attr("class", function (_, d) {
        return 'area ${i}';
      });
      var myColor = d3__WEBPACK_IMPORTED_MODULE_0__["scaleOrdinal"]().domain(props.names.slice(this.numberHorizons)).range(d3__WEBPACK_IMPORTED_MODULE_0__["schemeSet2"]);
      summarySource.append("path").attr("d", function (_ref5) {
        var _ref6 = _slicedToArray(_ref5, 2),
            I = _ref6[1];

        return area(I);
      }).attr("fill", function (d) {
        return myColor(d[0]);
      }).attr("opacity", 0.3); // Add lines

      var line = d3__WEBPACK_IMPORTED_MODULE_0__["line"]().curve(this.curve).x(function (i) {
        return _this2.xScale(props.x[i % props.x.length]);
      }).y(function (i) {
        return yScale(props.y[Math.floor(i / props.x.length)][i % props.x.length]);
      });
      summaryPlot.selectAll(".lines").data(d3__WEBPACK_IMPORTED_MODULE_0__["group"](I, function (i) {
        return props.names[Math.floor(i / props.x.length)];
      })).enter().append("g").append("path").attr("fill", "none").attr("stroke", function (d) {
        return myColor(d[0]);
      }).attr("d", function (_ref7) {
        var _ref8 = _slicedToArray(_ref7, 2),
            I = _ref8[1];

        return line(I);
      });
      var thresholdLine = d3__WEBPACK_IMPORTED_MODULE_0__["line"]().curve(this.curve).x(function (i) {
        return _this2.xScale(props.x[i % props.x.length]);
      }).y(function (i) {
        return yScale(1);
      });
      summaryPlot.append("g").append("path").attr("fill", "none").attr("stroke", "red").attr("d", thresholdLine(I.slice(0, props.x.length))); //legend

      var legend = summaryPlot.append("g").attr("transform", 'translate(' + (this.width - this.margin.right + 20) + ',' + props.legendOffset + ')');
      var legendEntries = props.names.slice(props.numberHorizons);
      legendEntries.push("Threshold");
      legend.selectAll("mylines").data(d3__WEBPACK_IMPORTED_MODULE_0__["group"](d3__WEBPACK_IMPORTED_MODULE_0__["range"](legendEntries.length), function (i) {
        return legendEntries[i];
      })).enter().append("rect").attr("width", 20).attr("height", 3).attr("y", function (d) {
        return d[1][0] * 20;
      }).attr("fill", function (d) {
        return myColor(d[0]);
      });
      legend.selectAll("mytext").data(d3__WEBPACK_IMPORTED_MODULE_0__["group"](d3__WEBPACK_IMPORTED_MODULE_0__["range"](legendEntries.length), function (i) {
        return legendEntries[i];
      })).enter().append("text").attr("y", function (d) {
        return d[1][0] * 20 + props.fontSize / 2;
      }).attr("x", 25).text(function (d) {
        return d[0];
      }).attr("font-size", props.fontSize);
    }
  }]);

  return HorizonGraphD3;
}();



/***/ })

})
//# sourceMappingURL=5b19f6d-main-wps-hmr.js.map
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiI1YjE5ZjZkLW1haW4td3BzLWhtci5qcyIsInNvdXJjZVJvb3QiOiIifQ==