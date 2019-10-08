import React from 'react';
import AceEditor from 'react-ace';

// eslint-disable-next-line no-unused-vars
import brace from 'brace';
import 'brace/mode/javascript';
import 'brace/theme/dracula';

export default class CodeEditor extends React.Component {
    render() {
        return (
            <div>
                <button>RUN</button>
                <AceEditor
                    width='auto'
                    mode="javascript"
                    theme="dracula"
                    onChange={e => e}
                    name="UNIQUE_ID_OF_DIV"
                    showPrintMargin={false}
                    editorProps={{$blockScrolling: true}} />
            </div>
        )
    }
}