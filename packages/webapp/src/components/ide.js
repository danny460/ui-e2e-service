import React from 'react';
import { observer } from 'mobx-react'

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
                        testData: { ...data }
                    }, () => {
                        console.log('@@DEBUG - test data is updated', this.state.testData);
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
            <Report key='report' testData={this.state.testData}/>,
        ];

        return (
            <SplitPane panes={panes} />
        );
    }
}
