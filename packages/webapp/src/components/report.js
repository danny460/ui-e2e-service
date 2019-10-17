import React from 'react';

import PropTypes from 'prop-types';

export default class Report extends React.Component {
    render() {
        const { suite } = this.props;
        

        let content = null;
        
        if (suite) {
            const rootSuite = suite;
            const isSingleSuite = rootSuite.suites.length <= 1;

            if(isSingleSuite) {
                const suite = rootSuite.suites[0];
                
                if(suite.suites.length > 1)
                    throw new Error('unhandled nested suite case');
                
                if(suite.tests.length > 1)
                    throw new Error('unhandled multiple tests case');
    
                const test = suite.tests[0];

                if(test) {
                    console.info({ test });
                    const gallery = null;
                
                    const commandList = (test.commands || []).map(command => {
                        return (
                            <pre key={command.id}>
                                { 
                                    command.afterScreenshot 
                                    ? <img src={`/report/${suite.runId}/screenshots/${command.id}`} width='400' height='auto'/>
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
    suite: PropTypes.any,
}
