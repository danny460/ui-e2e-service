"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _ink = require("ink");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class NestedList extends _react.default.Component {
  constructor(props) {
    super(props);
    this.state = {
      indent: this.props.indent
    }; // this.interval = null;
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
    return _react.default.createElement(_ink.Box, {
      marginLeft: indent,
      flexDirection: "column"
    }, components);
  }

}

NestedList.propTypes = {
  indent: _propTypes.default.number,
  items: _propTypes.default.array,
  renderItem: _propTypes.default.func,
  keyExtractor: _propTypes.default.func
};
var _default = NestedList;
exports.default = _default;
module.exports = exports.default;