import React from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

const FlexContainer = styled.div`
    display: flex;
    flex-direction: row;
`

export class SplitPane extends React.Component {

    render() {
        const panes = this.props.panes || [];
        const { resizable } = this.props;

        return (
            <FlexContainer>
                { panes.map((component, index) => <Pane key={index} flexGrow={1} component={component} resizable={resizable} />) }
            </FlexContainer>
        );
    }
}

SplitPane.propTypes = {
    panes: PropTypes.arrayOf(PropTypes.node),
    resizable: PropTypes.arrayOf(PropTypes.bool),
}


const PaneContainer = styled.div`
    border: 1px;
    border-color: gray;
    border-style: solid;
`

export function Pane(props) {
    return (
        <PaneContainer style={{ flexGrow: props.flexGrow, resize: 'horizontal' }}>
            { props.component || props.children }
        </PaneContainer>
    )
}

Pane.propTypes = {
    children: PropTypes.elementType,
    flexGrow: PropTypes.number.isRequired,
    component: PropTypes.node,
    resizable: PropTypes.bool,
}