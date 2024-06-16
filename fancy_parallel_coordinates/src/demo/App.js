/* eslint no-magic-numbers: 0 */
import React, {Component} from 'react';

import { FancyParallelCoordinates } from '../lib';

class App extends Component {

    constructor() {
        super();
        // [{label (string), range (array with two values), values (array), sensitivity (bool), sfc(bool)}]
        this.state = {
            data: [{
                label: 'ax1',
                range: [0, 5],
                values: [0, 0.8, 2, 3],
                sensitivity: true,
                sfc: false
            },
            {
                label: 'ax2',
                range: [0, 5],
                values: [3,2,1,0],
                sensitivity: true,
                sfc: false
            },
            {
                label: 'something',
                range: [0, 10],
                values: [0, 5, 2, 9],
                sensitivity: false,
                sfc: false
            },
            {
                label: 'sfc',
                range: [0, 5],
                values: [0, 1, 2, 3],
                sensitivity: false,
                sfc: true
            }],
            selection : [],
            fontSize : 20
        };
        this.setProps = this.setProps.bind(this);
    }

    setProps(newProps) {
        this.setState(newProps);
    }

    render() {
        return (
            <div>
                <FancyParallelCoordinates
                    setProps={this.setProps}
                    {...this.state}
                />
            </div>
        )
    }
}

export default App;
