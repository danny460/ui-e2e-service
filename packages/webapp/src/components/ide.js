import React from 'react';
import { observer } from 'mobx-react'
import { parse } from 'flatted';

import CodeEditor from './code-editor';
import SingleTestReport from './single-test-report';
// import { SplitPane } from './layouts';

import TestService from '../services/TestService';
import { subscribeToTestUpdate } from '../utils/socket-utils';

import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
// import Paper from '@material-ui/core/Paper';
import Toolbar from '@material-ui/core/Toolbar';
import { Typography } from '@material-ui/core';

export default @observer class IDE extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            suite: null,
            runId: null,
        };
    }

    onRunTest() {
        TestService.execute().then(data => {
            console.log('@@DEBUG - run api call response:', data);
            const runId = data && data.id;
            if(runId) {
                this.setState({ runId }, () => {
                    subscribeToTestUpdate(runId, data => {
                        console.log('@@DEBUG - on update triggered', data);
                        this.setState({
                            suite: parse(data),
                        }, () => {
                            console.log('@@DEBUG - test data is updated', this.state.suite);
                        })
                    });
                });
            }
        });
    }

    render() {
        const { suite, runId } = this.state
        const test =  suite && suite.suites[0] && suite.suites[0].tests[0] || null;


        return (
            <Grid container>
                <Grid item sm={12} md={6}>
                    <Toolbar>
                        <Button variant="contained" color="primary" onClick={this.onRunTest.bind(this)}>RUN</Button>
                    </Toolbar>
                    <CodeEditor />
                </Grid>
                <Grid item sm={12} md={6}>
                    <Toolbar>
                        <Typography variant='h5'>Report Area</Typography>
                    </Toolbar>
                    { runId && <SingleTestReport test={test} runId={runId} />}
                </Grid>
            </Grid>
        );
    }
}
