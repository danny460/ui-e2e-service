import React from 'react';
import { observer } from 'mobx-react'
import { parse } from 'flatted';

import CodeEditor from './code-editor';
import Report from './report';
import { SplitPane } from './layouts';

import TestService from '../services/TestService';
import { subscribeToTestUpdate } from '../utils/socket-utils';

export default @observer class IDE extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    onRunTest() {
        TestService.execute().then(data => {
            console.log('@@DEBUG - run api call response:', data);
            const testRunId = data && data.id;
            if(testRunId) {
                subscribeToTestUpdate(testRunId, data => {
                    console.log('@@DEBUG - on update triggered', data);
                    this.setState({
                        suite: parse(data),
                    }, () => {
                        console.log('@@DEBUG - test data is updated', this.state.suite);
                    })
                })
            }
        });
    }

    render() {
        const panes = [
            <div key='editor'>
                <button onClick={this.onRunTest.bind(this)}>RUN</button>
                <CodeEditor />,
            </div>,
            <Report key='report' suite={this.state.suite}/>,
        ];

        return (
            <SplitPane panes={panes} />
        );
    }
}
