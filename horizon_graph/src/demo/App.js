/* eslint no-magic-numbers: 0 */
import React, {Component} from 'react';

import { HorizonGraph } from '../lib';

class App extends Component {

    constructor() {
        super();
        this.state = {
            x: [0,1,2,3,4],
            y: [[0.1, 0.5, 0.5, 1.5, 1.5],
            [0.2, 0.5, 0.5, 1.5, 1.5],
            [0.3, 0.5, 0.5, 1.5, 1.5],
            [0.3, 0.5, 0.5, 1.5, 2.5],
            [0.3, 0.5, 1.5, 1.5, 2.5],
            [0.3, 2.5, 0.5, 1.5, 2.5]],
            names: ["test1", "test2", "test3", "abc", "def", "hij"]
        };
        this.setProps = this.setProps.bind(this);
    }

    setProps(newProps) {
        this.setState(newProps);
    }

    render() {
        return (
            <div>
                <HorizonGraph
                    setProps={this.setProps}
                    {...this.state}
                />
            </div>
        )
    }
}

export default App;
