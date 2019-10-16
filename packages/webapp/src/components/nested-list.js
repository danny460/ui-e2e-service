import React from 'react';
import PropTypes from 'prop-types';

class NestedList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            indent: this.props.indent,
        }
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
            <div marginLeft={ indent } flexDirection="column">
                { components }
            </div>
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
