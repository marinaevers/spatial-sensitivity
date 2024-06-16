import * as d3 from 'd3'

export default class FancyParallelCoordinatesD3 {
    constructor(el, props) {
        this.update = this.update.bind(this);
        this.createPCP = this.createPCP.bind(this);

        this.margin = {top: 25, right: 0, bottom: 10, left: 0};
        this.width = props.dataWidth - this.margin.left - this.margin.right;
        this.height = props.height - this.margin.top - this.margin.bottom;

        d3.select(el).selectAll("*").remove();

        parent = d3.select(el)
            .append("div")
            .style("width", props.width)
            .style("overflow-x", "scroll")
            .style("-webkit-overflow-scrolling", "touch");

        this.svg = parent.append('svg')
            .attr('width', this.width + this.margin.left + this.margin.right)
            .attr('height', this.height + this.margin.top + this.margin.bottom)
            .append('g')
            .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');

        this.createPCP(props, this.svg);
    }

    update(props) {
        this.svg.selectAll("path")
            .style("stroke", function (d) {
                return selected ? "#005454" : "grey"
            })
    }

    createPCP(props, svg) {
        var dimensions = props.data.map(({label}) => label);
        var boxOffset = 75;
        var width = this.width,
            height = this.height;

        // Create axes for data
        var scales = {}
        for (let i = 0; i < dimensions.length; i++) {
            scales[dimensions[i]] = d3.scaleLinear()
                .domain(props.data[i].range)
                .range([height, 0])
        }

        // Create x-axes to lay out the y-axes
        var xScale = d3.scalePoint()
            .range([0, width])
            .padding(1)
            .domain(dimensions);

        // Create box for sensitivity, line for threshold
        var sensitiveDimensions = props.data.filter(({sensitivity}) => sensitivity).map(({label}) => label);
        var leftBox = xScale(sensitiveDimensions[0]) - boxOffset;
        var rightBox = xScale(sensitiveDimensions[sensitiveDimensions.length - 1]) + boxOffset / 2;
        svg.append("rect")
            .attr("width", rightBox - leftBox)
            .attr("height", height + this.margin.top + this.margin.bottom - 4)
            .attr("x", leftBox)
            .attr("y", -this.margin.top + 2)
            .attr("stroke", "#575757")
            .attr("fill", "#efefef")
            .attr("stroke-width", "2px");
        svg.append("g")
            .attr("transform", "translate(" + (leftBox - props.fontSize) + ", " + height / 2 + ")")
            .append("text")
            .text("Sensitivity")
            .style("text-anchor", "middle")
            .attr("transform", "rotate(-90)");

        // draw lines
        var values = [];
        props.data.map(function (d) {
            for (let i = 0; i < d.values.length; i++) {
                if (values.length < d.values.length) {
                    values.push({});
                }
                values[i][d.label] = d.values[i];
                values[i]['id'] = i;
            }
        });


        var selection = props.selection.length === 0 ? d3.range(values.length) : props.selection;
        var foreground = svg.append("g")
            .selectAll("path")
            .data(values)
            .enter().append("path")
            .attr("d", path)
            .style("fill", "none")
            .style("stroke", function (d) {
                if(selection.includes(d.id)) {
                    d3.select(this).raise();
                }
                return selection.includes(d.id) ? "#00dcdc" : "grey"
            })
            .style("opacity", 0.05)

        // Draw threshold line
        var thresholdY = scales[dimensions[0]](1.0);
        /*svg.append("line")
            .attr("y1", thresholdY)
            .attr("y2", thresholdY)
            .attr("x1", leftBox)
            .attr("x2", rightBox)
            .attr("stroke", "red")
            .attr("stroke-width", "2px")
            .attr("stroke-dasharray", ("5,5"));*/

        // Draw the axes
        var axes = svg.selectAll("myAxis")
            .data(dimensions).enter()
            .append('g')
            // move to right position
            .attr("transform", function (d) {
                return "translate(" + xScale(d) + ")";
            })
            // build axes
            .each(function (d) {
                //d3.select(this).call(d3.axisLeft().scale(scales[d]));
                if(d == "Labels") {
                    d3.select(this).call(d3.axisLeft().scale(scales[d]).tickFormat((d, i) => {
                        console.log("Tick value: " + d + ", Index: " + i);
                        return props.labels[i];
                    }));
                    /*console.log("Labels found!" + d);
                    console.log(props.labels);
                    //d3.select(this).call(d3.axisLeft().tickFormat((d,i) => {console.log(d); props.labels[i]}));
                    d3.select(this).call(d3.axisLeft().tickFormat((d, i) => {
                        console.log("Tick value: " + d + ", Index: " + i);
                        return 0;//props.labels[i];
                    }));*/
                }
                else {
                    d3.select(this).call(d3.axisLeft().scale(scales[d]));
                }
            });
        axes
            .append("text")
            .style("text-anchor", "middle")
            .attr("y", -9)
            .text(function (d) {
                return d;
            })

        axes
            .selectAll("path")
            .style("stroke", "black");
        axes
            .selectAll("line")
            .style("stroke", "black");
        svg
            .selectAll("text")
            .style("fill", "black")
            .attr("font-size", props.fontSize);

        // brushing
        axes
            .each(function (d) {
                d3.select(this).call(scales[d].brush = d3.brushY()
                    .extent([[-10, 0], [10, height]])
                    .on("start", brush)
                    .on("brush", brush)
                    .on("end", brushend)
                )
            })
            .selectAll("rect")
            .attr("x", -8)
            .attr("width", 16);

        var selections = new Map()

        var selected = [];
        var selectedAxes = []

        function brush({selection}, key) {
            if (!(selectedAxes.indexOf(key) > -1)) {
                selectedAxes.push(key);
            }
            if (selection === null) {
                console.log("Deleting");
                selections.delete(key);
                selectedAxes = selectedAxes.filter(function (value, index, arr) {
                    return value !== key;
                });
            } else selections.set(key, selection.map(scales[key].invert));
            selected = [];
            foreground.each(function (d) {
                var active = Array.from(selections).every(([key, [max, min]]) => d[key] >= min && d[key] <= max);
                d3.select(this).style("stroke", active ? "#00dcdc" : "grey");
                if (active) {
                    d3.select(this).raise();
                    selected.push(d.id);
                    //props.setProps({selection: this.selection, redraw: false});
                }
            });
        }

        function brushend(d, key) {
            brush(d, key);
            props.setProps({selection: selected, redraw: false, axes: selectedAxes});
        }

        // Reordering for axes
        var dragging = {};

        function position(d) {
            var v = dragging[d];
            return v == null ? xScale(d) : v;
        }

        var marginTop = this.margin.top;
        axes.call(d3.drag()
            .on("start", function (event, d) {
                if (event.y > marginTop) {
                    return;
                }
                dragging[d] = this.__origin__ = xScale(d);
                this.__dragged__ = false;
            })
            .on("drag", function (event, d) {
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
            })
            .on("end", function (event, d) {
                if (!this.__dragged__) {
                    // no movement
                } else {
                    //reorder
                    d3.select(this).transition().attr("transform", "translate(" + xScale(d) + ")");
                    // TODO: Add brush
                }
                xScale.domain(dimensions);
                props.setProps({dimensions: dimensions, redraw: false, draggedElement: d});
                delete this.__dragged__;
                delete this.__origin__;
                delete dragging[d];
            }))


        // Returns the path for a given data point.
        function path(d) {
            return d3.line()(dimensions.map(function (p) {
                return [xScale(p), scales[p](d[p])];
            }));
        }
    }
}

