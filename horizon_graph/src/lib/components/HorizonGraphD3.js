import * as d3 from 'd3'

export default class HorizonGraphD3 {
    constructor(el, props) {
        this.update = this.update.bind(this);
        this.summaryPlot = this.summaryPlot.bind(this);

        var margin = {top: 5, right: 60, bottom: 20, left: 25}, width = props.width - margin.left - margin.right,
            height = props.height - margin.top - margin.bottom;
        this.margin = margin;
        this.width = width;
        this.height = height;

        d3.select(el).selectAll("*").remove();

        // Construct scales and axes
        this.numberHorizons = Math.min(props.numberHorizons, props.y.length);
        const xDomain = d3.extent(props.x);
        const yMax = Math.ceil(d3.max(props.y.flat()));
        this.yDomain = [0, yMax];
        this.bands;
        if (props.numberHorizons < props.y.length) {
            this.bands = Math.max(1, Math.ceil(d3.max(props.y.slice(this.numberHorizons).flat())));
        } else {
            this.bands = 0;
        } // number of bands for lowest plot
        const bands = yMax/props.threshold;
        const xRange = [margin.left, width - margin.right];
        this.xScale = d3.scaleLinear(xDomain, xRange);
        const size = (height - margin.top - margin.bottom) / (this.numberHorizons + this.bands);
        this.size = size;
        const yScale = d3.scaleLinear(this.yDomain, [this.size, size - bands * (size - props.padding)]);


        // A unique identifier for clip paths (to avoid conflicts).
        const uid = `O-${Math.random().toString(16).slice(2)}`;

        const I = d3.range(props.x.length * this.numberHorizons);

        this.svg = d3.select(el).append("svg")
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
        var svg = this.svg;
        svg
            .call(d3.zoom().on("zoom", function (d) {
                if(d.sourceEvent.type === "wheel") {
                    svg.attr("transform", d.transform)
                }
                })
            )

        const g = this.svg.selectAll("g")
            .data(d3.group(I, i => props.names[Math.floor(i / props.x.length)]))
            .join("g")
            .attr("transform", (_, i) => 'translate(0, ' + (i * size + margin.top) + ')');

        // Construct an area generator
        this.curve = d3.curveLinear
        const area = d3.area()
            .curve(this.curve)
            .x(i => {
                return this.xScale(props.x[i % props.x.length]);
            })
            .y0(yScale(0))
            .y1(i => {
                return yScale(props.y[Math.floor(i / props.x.length)][i % props.x.length]);
            });

        const defs = g.append("defs");

        defs.append("clipPath")
            .attr("id", (_, i) => `${uid}-clip-${i}`)
            .append("rect")
            .attr("y", props.padding)
            .attr("width", width)
            .attr("height", size - props.padding);

        defs.append("path")
            .attr("id", (_, i) => `${uid}-path-${i}`)
            .attr("d", ([, I]) => area(I));

        const colors = [props.bgcolor].concat(d3.schemeReds[Math.max(3, bands - 1)]);

        g
            .attr("clip-path", (_, i) => `url(${new URL(`#${uid}-clip-${i}`, location)})`)
            .selectAll("use")
            .data((d, i) => new Array(bands).fill(i))
            .join("use")
            .attr("fill", (_, i) => colors[i])
            .attr("transform", (_, i) => `translate(0,${i * size})`)
            .attr("xlink:href", (i) => `${new URL(`#${uid}-path-${i}`, location)}`);

        g.append("text")
            .attr("x", margin.left)
            .attr("y", (size + props.padding) / 2)
            //.attr("dy", "0.35em")
            .text(([name]) => name)
            .attr("font-size", props.fontSize);

        // Color bar
        const legendProps = {
            title: "Sensitivity", tickSize: 6, width: 20, height: props.numberHorizons * this.size,// + tickSize,
            marginTop: margin.top, marginRight: 0, marginBottom: 0,// + tickSize,
            marginLeft: 20//, ticks: width / 64
        };

        // function ramp(color, n) {
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

        const n = Math.min(colors.length, bands);
        var colorScale = d3.scaleQuantize()
            .domain([0, yMax])
            .range(colors.slice(0, n));

        let x = colorScale.copy();
        var colorBar = this.svg.append("g");
        colorBar
            .attr("transform", 'translate(' + (width - margin.right + legendProps.marginLeft) + ',' + (legendProps.marginTop + props.padding) + ')')
            .selectAll("rect")
            .data(d3.range(n))
            .enter()
            .append("rect")
            .attr("y", (d) => {
                return legendProps.height / n * d;
            })
            .attr("x", 0)
            .attr("width", legendProps.width)
            .attr("height", legendProps.height / n)
            .attr("fill", (d) => colors[n - 1 - d]);
        //.attr("x", width)
        //.attr("y", legendProps.marginTop + props.padding);

        // colorBar.append("image")
        //     .attr("width", legendProps.width - legendProps.marginLeft - legendProps.marginRight)
        //     .attr("height", legendProps.height - legendProps.marginTop - legendProps.marginBottom + props.padding)
        //     .attr("preserveAspectRatio", "none")
        //     .attr("xlink:href", ramp(colorScale, n).toDataURL());

        var colorBarScale = d3.scaleLinear()
            .domain([0, yMax])
            .range([legendProps.height, 0]);
        var legendAxis = d3.axisRight()
            .scale(colorBarScale)
            .ticks(n + 1);
        this.legendTitle = colorBar.append("g")
            .style("font-size", props.fontSize)
            .attr("transform", 'translate(' + (legendProps.width) + ',0)')
            .call(legendAxis)
            .call(g => g.select(".domain").remove())
            .append("text")
            .attr("x", -legendProps.height / 2)
            .attr("y", -legendProps.width - 5)
            .attr("fill", "black")
            .attr("text-anchor", "middle")
            .attr("font-size", props.fontSize)
            .text(legendProps.title)
            .attr("transform", "rotate(-90)");


        if (props.numberHorizons < props.y.length) {
            console.log("Hier!");
            this.summaryPlot(props);
        }

        // We initially generate a SVG group to keep our brushes' DOM elements in:
        var gBrushes = this.svg.append('g')
            .attr("class", "brushes");

        // We also keep the actual d3-brush functions and their IDs in a list:
        var brushes = [];

        var xScale = this.xScale;
        var ranges = [];

        function newBrush() {
            var brush = d3.brushX()
                .extent([[margin.left, 0], [width - margin.right, height - margin.bottom]])
                .on("start", brushstart)
                .on("brush", brushed)
                .on("end", brushend);

            brushes.push({id: brushes.length, brush: brush});

            function brushstart(event) {
                // your stuff here
                if (event.sourceEvent.shiftKey) {
                    gBrushes.selectAll(".brush")
                        .remove();
                    brushes = [];
                    ranges = [];
                    this.deleted = true;
                }
            }

            function brushed() {
                // your stuff here
            }


            function brushend() {
                if (this.deleted) {
                    newBrush();
                } else {

                    // Figure out if our latest brush has a selection
                    var lastBrushID = brushes[brushes.length - 1].id;
                    var lastBrush = document.getElementById('brush-' + lastBrushID);
                    var selection = d3.brushSelection(lastBrush);

                    ranges.push([xScale.invert(selection[0]), xScale.invert(selection[1])]);
                    console.log(ranges);
                    props.setProps({selectedRanges: ranges, redraw: false, numBrushes: ranges.length});

                    // If it does, that means we need another one
                    if (selection && selection[0] !== selection[1]) {
                        newBrush();
                    }
                }

                // Always draw brushes
                drawBrushes();
            }
        }

        function drawBrushes() {

            var brushSelection = gBrushes
                .selectAll('.brush')
                .data(brushes, function (d) {
                    return d.id
                });

            // Set up new brushes
            brushSelection.enter()
                .insert("g", '.brush')
                .attr('class', 'brush')
                .attr('id', function (brush) {
                    return "brush-" + brush.id;
                })
                .each(function (brushObject) {
                    //call the brush
                    brushObject.brush(d3.select(this));
                });

            /* REMOVE POINTER EVENTS ON BRUSH OVERLAYS
             *
             * This part is abbit tricky and requires knowledge of how brushes are implemented.
             * They register pointer events on a .overlay rectangle within them.
             * For existing brushes, make sure we disable their pointer events on their overlay.
             * This frees the overlay for the most current (as of yet with an empty selection) brush to listen for click and drag events
             * The moving and resizing is done with other parts of the brush, so that will still work.
             */
            brushSelection
                .each(function (brushObject) {
                    d3.select(this)
                        .attr('class', 'brush')
                        .selectAll('.overlay')
                        .style('pointer-events', function () {
                            var brush = brushObject.brush;
                            if (brushObject.id === brushes.length - 1 && brush !== undefined) {
                                return 'all';
                            } else {
                                return 'none';
                            }
                        });
                })

            brushSelection.exit()
                .remove();


            d3.select("rect.selection")
                .style("fill", "#dbdbdb")
                .style("stroke", "black")
                .style("stroke-width", "3px")
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

    update(props) {
        //console.log("update");
    }

    summaryPlot(props) {
        const summaryPlot = this.svg.append("g");

        // Create new I array with larger numbers

        // Create own yScale
        //d3.max(props.y.slice(this.numberHorizons).flat())
        const yScale = d3.scaleLinear([0, this.bands], [this.size * this.bands, props.padding]);

        const area = d3.area()
            .curve(this.curve)
            .x(i => {
                return this.xScale(props.x[i % props.x.length]);
            })
            .y0(yScale(0))
            .y1(i => {
                return yScale(props.y[Math.floor(i / props.x.length)][i % props.x.length]);
            });

        const xAxis = d3.axisBottom(this.xScale);
        const yAxis = d3.axisLeft(yScale).ticks(Math.max(1, this.bands + 1));

        summaryPlot
            .attr("transform", (_, i) => `translate(0,${this.size * (this.numberHorizons) + this.margin.top})`)
            .append("g")
            .call(xAxis)
            .attr("transform", (_, i) => `translate(0,${this.size * this.bands})`);

        // x-label
        summaryPlot.append("text")
            .attr("text-anchor", "middle")
            .attr("x", this.width / 2)
            .attr("y", this.size * this.bands + this.margin.bottom + props.fontSize)
            .attr("font-size", props.fontSize)
            .text(props.xLabel);

        summaryPlot.append("text")
            //.attr("transform", "rotate(-90)")
            .attr("x", -(this.size * (this.bands + 1)) / 2)
            .attr("y", -this.margin.left + props.fontSize)
            .text("text-anchor", "middle")
            .attr("font-size", props.fontSize)
            .text(props.yLabel)
            .attr("transform", "rotate(-90)");

        summaryPlot
            .append("g")
            .call(yAxis)
            .attr("transform", (_, i) => `translate(${this.margin.left}, 0)`);

        summaryPlot
            .selectAll("text")
            .attr("font-size", props.fontSize);

        const I = d3.range(props.x.length * this.numberHorizons, props.x.length * props.y.length);

        var summarySource = summaryPlot.selectAll(".area")
            .data(d3.group(I, i => props.names[Math.floor(i / props.x.length)]))
            .enter().append("g")
            .attr("class", function (_, d) {
                return 'area ${i}';
            });

        var myColor = d3.scaleOrdinal().domain(props.names.slice(this.numberHorizons))
            .range(d3.schemeSet2);
        summarySource.append("path")
            .attr("d", ([, I]) => area(I))
            .attr("fill", (d) => {
                return myColor(d[0]);
            })
            .attr("opacity", 0.3);

        // Add lines
        const line = d3.line()
            .curve(this.curve)
            .x(i => {
                return this.xScale(props.x[i % props.x.length]);
            })
            .y(i => {
                return yScale(props.y[Math.floor(i / props.x.length)][i % props.x.length]);
            });
        summaryPlot.selectAll(".lines")
            .data(d3.group(I, i => props.names[Math.floor(i / props.x.length)]))
            .enter().append("g")
            .append("path")
            .attr("fill", "none")
            .attr("stroke", (d) => {
                return myColor(d[0]);
            })
            .attr("d", ([, I]) => {
                return line(I)
            })

        /*const thresholdLine = d3.line()
            .curve(this.curve)
            .x(i => {
                return this.xScale(props.x[i % props.x.length]);
            })
            .y(i => {
                return yScale(1);
            });*/

        // summaryPlot.append("g")
        //     .append("path")
        //     .attr("fill", "none")
        //     .attr("stroke", "red")
        //     .attr("d", thresholdLine(I.slice(0, props.x.length)));

        //legend
        var legend = summaryPlot.append("g")
            .attr("transform", 'translate(' + (this.width - this.margin.right + 20) + ',' + props.legendOffset + ')');

        var legendEntries = props.names.slice(props.numberHorizons);
        //legendEntries.push("Threshold");

        legend
            .selectAll("mylines")
            .data(d3.group(d3.range(legendEntries.length), i => legendEntries[i]))
            .enter()
            .append("rect")
            .attr("width", 20)
            .attr("height", 3)
            .attr("y", (d) => {
                return d[1][0] * 20
            })
            .attr("fill", (d) => {
                return myColor(d[0]);//d[0] === "Threshold" ? "red" : myColor(d[0]);
            })

        legend
            .selectAll("mytext")
            .data(d3.group(d3.range(legendEntries.length), i => legendEntries[i]))
            .enter()
            .append("text")
            .attr("y", (d) => {
                return d[1][0] * 20 + props.fontSize / 2
            })
            .attr("x", 25)
            .text((d) => d[0])
            .attr("font-size", props.fontSize);

    }
}