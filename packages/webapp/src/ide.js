import React from 'react';

import CodeEditor from './code-editor';
import Report from './report';

function SplitPane(props) {
    // eslint-disable-next-line react/prop-types
    const { vertical } = props;
    const flexDirection = vertical ? 'row' : 'column';
    // eslint-disable-next-line react/prop-types
    return <div className='splitpane' style={{ display: 'flex', flexDirection }}>{ props.children }</div>;
}

function Pane(props) {
    // eslint-disable-next-line react/prop-types
    return <div className='pane'> { props.children } </div>;
}

export default class IDE extends React.Component {

    render() {
        return (
            <SplitPane>
                <Pane>
                    <h1>Editor</h1>
                    <CodeEditor />
                </Pane>
                <Pane>
                    <h1>report area</h1>
                    <Report />
                </Pane>
            </SplitPane>
        );
    }
}
