import React from 'react';

import PropTypes from 'prop-types';

export default class Report extends React.Component {
    render() {
        const { testData } = this.props;
        

        let content = null;
        if (testData) {
            const rootSuite = testData.suites.root;
            // const isNakedTest = rootSuite.suites.length === 0;
            const isSingleSuite = rootSuite.suites.length <= 1;

            if(isSingleSuite) {
                const suiteId = rootSuite.suites[0];
                const suite = testData.suites[suiteId];
                
                if(suite.suites.length > 1)
                    throw new Error('unhandled nested suite case');
                
                if(suite.tests.length > 1)
                    throw new Error('unhandled multiple tests case');
    
                const testId = suite.tests[0];
                const test = testData.tests[testId];

                if(test) {
                    console.info({ test });
                    const gallery = null;
                    const commandList = test.commands.map(commandId => {
                        const command = testData.commands[commandId];
                        
                        return (
                            <pre key={commandId}>
                                { 
                                    command.afterScreenshot 
                                    ? <img src={`/report/${testData.runId}/screenshots/${commandId}`} width='400' height='auto'/>
                                    : null
                                }
                                {command.name} {command.args.join(' ')}
                            </pre>
                        )
                    })
        
                    content = (
                        <div>
                            {gallery}
                            {commandList}
                        </div>
                    )
                }
            } else {
                throw new Error('unhandled multiple suites case, todo...');
            }
        }


        

        return (
            <div>
                <h1>This is Report</h1>
                <pre>{content}</pre>
            </div>
        )
    }
}

Report.propTypes = { 
    testData: PropTypes.any,
}
