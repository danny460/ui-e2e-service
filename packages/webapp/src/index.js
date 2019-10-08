import React from 'react';
import { render } from 'react-dom';

import IDE from './ide';


class App extends React.Component {
    render() {
        return (
            <IDE />
        );
    }
}

render(<App/>, document.getElementById('root'));
