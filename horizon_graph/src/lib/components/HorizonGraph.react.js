import React, {Component} from 'react';
import PropTypes from 'prop-types';
import HorizonGraphD3 from "./HorizonGraphD3";

/**
 * ExampleComponent is an example component.
 * It takes a property, `label`, and
 * displays it.
 * It renders an input with the property `value`
 * which is editable by the user.
 */
export default class HorizonGraph extends Component {
    componentDidMount() {
        this.horizonGraph = new HorizonGraphD3(this.el, this.props);
    }

    componentDidUpdate() {
        if(this.props.redraw) {
            this.horizonGraph = new HorizonGraphD3(this.el, this.props);
        }
        else {
            this.horizonGraph.update(this.props);
        }
    }

    render() {
        return <div id={this.props.id} ref={el => {this.el = el}} />;
    }
}

HorizonGraph.defaultProps = {
    width: 800,
    height: 400,
    padding: 2,
    bands: 2,
    bgcolor: "#969696",
    numberHorizons: 3,
    fontSize: 12,
    xLabel: "x-Label",
    yLabel: "y-Label",
    legendOffset: 20,
    redraw: true,
    threshold: 0.2
};

HorizonGraph.propTypes = {
    /**
     * The ID used to identify this component in Dash callbacks.
     */
    id: PropTypes.string,

    /**
     * Dash-assigned callback that should be called to report property changes
     * to Dash, to make them available for callbacks.
     */
    setProps: PropTypes.func,
    width: PropTypes.number,
    height: PropTypes.number,
    x: PropTypes.array.isRequired,
    y: PropTypes.array.isRequired,
    names: PropTypes.array,
    padding: PropTypes.number, // separation between adjacent horizons
    bands: PropTypes.number,
    bgcolor: PropTypes.string,
    numberHorizons: PropTypes.number,
    fontSize: PropTypes.number,
    selectedRanges: PropTypes.array,
    xLabel: PropTypes.string,
    yLabel: PropTypes.string,
    legendOffset: PropTypes.number,
    redraw: PropTypes.bool,
    numBrushes: PropTypes.number,
    threshold: PropTypes.number
};
