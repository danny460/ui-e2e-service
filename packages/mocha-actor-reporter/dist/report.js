'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _ink = require("ink");

var _nestedList = _interopRequireDefault(require("./nested-list"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function renderCommand(command, key) {
  const name = command.name;
  const args = command.args.join(' ');
  const durationText = command.duration ? _react.default.createElement(_ink.Color, {
    gray: true
  }, " (", command.duration, "ms)") : null;
  const displayColor = command.state === 'failed' ? 'red' : command.state === 'success' ? 'green' : 'white';
  return _react.default.createElement(_ink.Box, {
    key: key,
    flexDirection: "column"
  }, _react.default.createElement(_ink.Box, {
    flexDirection: "row"
  }, _react.default.createElement(_ink.Color, {
    [displayColor]: true
  }, "-", name, " ", args), " ", durationText));
}

function renderTest(test, key) {
  let displayColor = 'white';
  let durationText = null;

  if (test.duration) {
    // const colorKey = test.time === 'fast' ? 'gray' : test.time === 'slow' ? 'red' : 'yellow';
    // {...{ [colorKey]: true }}
    // const colorKey = 'gray';
    displayColor = test.state === 'failed' ? 'red' : 'green';
    durationText = _react.default.createElement(_ink.Color, {
      gray: true
    }, "(", test.duration, "ms)");
  }

  const display = !!test.started;
  const testEntry = display ? _react.default.createElement(_ink.Box, {
    flexDirection: "row"
  }, _react.default.createElement(_ink.Color, {
    [displayColor]: true
  }, test.title, " ", durationText)) : null;
  return _react.default.createElement(_ink.Box, {
    key: key,
    flexDirection: "column"
  }, testEntry, _react.default.createElement(_nestedList.default, {
    items: test.commands,
    indent: 2,
    renderItem: renderCommand
  }));
}

function renderSuite(item, key) {
  if (item.started) {
    const spacer = ' ';
    return _react.default.createElement(_ink.Box, {
      key: key,
      flexDirection: "column"
    }, spacer, _react.default.createElement(_ink.Text, null, item.title), _react.default.createElement(_nestedList.default, {
      items: item.tests,
      indent: 2,
      renderItem: renderTest
    }), _react.default.createElement(_nestedList.default, {
      items: item.suites,
      indent: 2,
      renderItem: renderSuite
    }));
  }
}

class Report extends _react.default.PureComponent {
  render() {
    return _react.default.createElement(_ink.Box, {
      flexDirection: "column"
    }, _react.default.createElement(_ink.Text, null, this.props.title), _react.default.createElement(_nestedList.default, {
      items: this.props.suites,
      indent: 2,
      renderItem: renderSuite
    }));
  }

}

Report.propTypes = {
  title: _propTypes.default.string,
  suites: _propTypes.default.array
};
var _default = Report;
exports.default = _default;
module.exports = exports.default;