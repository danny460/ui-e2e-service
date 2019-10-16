import React from 'react';
import AceEditor from 'react-ace';
import { observer } from 'mobx-react';

// eslint-disable-next-line no-unused-vars
import brace from 'brace';
import 'brace/mode/javascript';
import 'brace/theme/dracula';



export default @observer class CodeEditor extends React.Component {
    render() {
        return (
            <AceEditor
                width='auto'
                mode="javascript"
                theme="dracula"
                onChange={e => e}
                name="UNIQUE_ID_OF_DIV"
                showPrintMargin={false}
                editorProps={{$blockScrolling: true}} />
        )
    }
}