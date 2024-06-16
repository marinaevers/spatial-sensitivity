import React, {Component} from 'react';
import PropTypes from 'prop-types';
import FancyParallelCoordinatesD3 from './FancyParallelCoordinatesD3'

/**
 * ExampleComponent is an example component.
 * It takes a property, `label`, and
 * displays it.
 * It renders an input with the property `value`
 * which is editable by the user.
 */
export default class FancyParallelCoordinates extends Component {
    componentDidMount() {
        this.parallelCoordinates = new FancyParallelCoordinatesD3(this.el, this.props);
        this.dataWidth = this.props.dataWidth;
        this.data = this.props.data;
    }

    componentDidUpdate() {
        if(this.props.redraw) {
            this.parallelCoordinates = new FancyParallelCoordinatesD3(this.el, this.props);
        }
        else {
            //this.parallelCoordinates.update(this.props);
        }
        //this.parallelCoordinates.update(this.props);
    }

    render() {
        return <div id={this.props.id} ref={el => {this.el = el}} />;
    }
}

FancyParallelCoordinates.defaultProps = {
    width: 800,
    height: 400,
    dataWidth: 1600,
    selection: [3],
    fontSize: 12,
    redraw: true,
    labels: []
};

FancyParallelCoordinates.propTypes = {
    /**
     * The ID used to identify this component in Dash callbacks.
     */
    id: PropTypes.string,
    /**
     * Dash-assigned callback that should be called to report property changes
     * to Dash, to make them available for callbacks.
     */
    setProps: PropTypes.func,
    data: PropTypes.array.isRequired,
    fontSize: PropTypes.number,
    width: PropTypes.number,
    height: PropTypes.number,
    dataWidth: PropTypes.number,
    selection: PropTypes.array,
    redraw: PropTypes.bool,
    axes: PropTypes.array,
    dimensions: PropTypes.array,
    draggedElement: PropTypes.string,
    labels: PropTypes.array
};
