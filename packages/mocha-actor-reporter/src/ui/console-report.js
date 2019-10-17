'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { Box, Text, Static, Color } from 'ink';
import NestedList from './nested-list';

function renderCommand(command, key) {
    const name = command.name;
    const args = command.args.join(' ');
    const durationText = command.duration ? <Color gray> ({command.duration}ms)</Color> : null;
    const displayColor = command.state === 'failed' ? 'red' : command.state === 'success' ? 'green' : 'white';

    return (
        <Box key={key} flexDirection="column">
            <Box flexDirection="row">
                <Color {...{[displayColor]: true}}>-{name} {args}</Color> {durationText}
            </Box>
        </Box>
    );
}


function renderTest(test, key) {
    let displayColor = 'white';
    let durationText = null; 
    if (test.duration) {
        // const colorKey = test.time === 'fast' ? 'gray' : test.time === 'slow' ? 'red' : 'yellow';
        // {...{ [colorKey]: true }}
        // const colorKey = 'gray';
        displayColor = test.state === 'failed' ? 'red' : 'green';
        durationText = (<Color gray>({test.duration}ms)</Color>);
    }

    const display = !!test.started;
    const testEntry = display ? (
        <Box flexDirection="row">         
            <Color {...{[displayColor]: true}}>
                { test.title } { durationText }
            </Color>
        </Box>
    ) : null;
    
    
    return (
        <Box key={key} flexDirection="column">
            {testEntry}
            <NestedList items={test.commands} indent={2} renderItem={renderCommand} />
        </Box>
    );
}

function renderSuite(suite, key) {
    if(suite && suite.started) {
        const isRootSuite = suite.root;
        const spacer = isRootSuite ? null : ' ';
        return (
            <Box key={key} flexDirection="column">
                { spacer } 
                <Text>{ suite.title }</Text>
                <NestedList items={suite.tests} indent={2} renderItem={renderTest} />
                <NestedList items={suite.suites} indent={2} renderItem={renderSuite} />
            </Box>
        );
    }
}

class ConsoleReport extends React.PureComponent {
    render() {
        return (
            <Box flexDirection="column">
                <Static>
                    { this.props.title }
                </Static>
                <NestedList 
                    items={this.props.suites}
                    indent={2}
                    renderItem={renderSuite} />
            </Box>    
        );
    }
}

ConsoleReport.propTypes = {
    title: PropTypes.string,
    suites: PropTypes.array,
};

export default ConsoleReport;
