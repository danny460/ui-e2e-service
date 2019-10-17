import React from 'react';
import PropTypes from 'prop-types';
import { Box } from 'ink';

class NestedList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            indent: this.props.indent,
        }
        // this.interval = null;
    }

    render() {
        const indent = this.props.indent || 2;
        const items = this.props.items || [];

        const renderItem = this.props.renderItem;
        const keyExtractor = this.props.keyExtractor || null;

        const components = items.map((item, index) => {
            const key = keyExtractor ? keyExtractor(item) : index;
            return renderItem(item, key);
        });

        return (
            <Box marginLeft={ indent } flexDirection="column">
                { components }
            </Box>
        )
    }
}

NestedList.propTypes = {
    indent: PropTypes.number,
    items: PropTypes.array,
    renderItem: PropTypes.func,
    keyExtractor: PropTypes.func,
}

export default NestedList;
