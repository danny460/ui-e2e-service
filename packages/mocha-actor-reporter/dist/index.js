"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _ink = require("ink");

var _mocha = _interopRequireDefault(require("mocha"));

var _react = _interopRequireDefault(require("react"));

var _shortid = _interopRequireDefault(require("shortid"));

var _report = _interopRequireDefault(require("./report"));

var _seleniumActor = require("@pkg/selenium-actor");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
* @module MochaActorReporter
*/
const {
  EVENT_RUN_BEGIN,
  EVENT_RUN_END,
  EVENT_SUITE_BEGIN,
  EVENT_SUITE_END,
  EVENT_TEST_BEGIN,
  EVENT_TEST_END,
  EVENT_TEST_FAIL,
  EVENT_TEST_PASS,
  EVENT_TEST_PENDING
} = _mocha.default.Runner.constants;
const ALL_EVENTS = Object.freeze([EVENT_RUN_BEGIN, EVENT_SUITE_BEGIN, EVENT_SUITE_END, EVENT_TEST_BEGIN, _seleniumActor.Events.BEFORE_COMMAND_EXECUTE, _seleniumActor.Events.AFTER_COMMAND_SUCCESS, _seleniumActor.Events.AFTER_COMMAND_ERROR, EVENT_TEST_PENDING, EVENT_TEST_PASS, EVENT_TEST_FAIL, EVENT_TEST_END, EVENT_RUN_END]);
/**
* @class
* @extends Mocha.reporters.Base
*/

class MochaActorReporter extends _mocha.default.reporters.Base {
  /**
  * Constructs a new `MochaActorReporter` reporter instance.
  *
  * @public
  * @param {import('mocha').Runner} runner - Instance triggers reporter actions.
  * @param {Object} [options] - runner options
  */
  constructor(runner, options) {
    super(runner, options);
    const title = options.reportTitle || 'Generated Report';
    const suites = [];
    attachDataPopulation(runner, suites);
    attachConsoleRender(runner, suites, title);
    attachEventDispatch(runner, suites);
    runner.once(EVENT_RUN_END, () => {
      this.epilogue();
    });
  }

}

MochaActorReporter.description = 'hierarchical & verbose [default] console + screenshot and live webpage view etc..';
var _default = MochaActorReporter;
exports.default = _default;

function attachDataPopulation(runner, suites) {
  runner.on(EVENT_SUITE_BEGIN, suite => {
    const isRootSuite = !suite.parent || suite.parent.root;

    if (!isRootSuite) {
      suite.id = (0, _shortid.default)();
      suite.started = true;
      suites.push(suite);
    }
  }).on(EVENT_TEST_BEGIN, test => {
    test.id = (0, _shortid.default)();
    test.started = true;
  }).on(_seleniumActor.Events.BEFORE_COMMAND_EXECUTE, command => {
    command.id = (0, _shortid.default)();
  });
} // render on all events


function attachConsoleRender(runner, suites, title) {
  ALL_EVENTS.forEach(event => {
    runner.on(event, () => (0, _ink.render)(_react.default.createElement(_report.default, {
      suites: [...suites],
      title: title
    })));
  });
}

const Type = {
  SUITE: 'suite',
  TEST: 'test',
  COMMAND: 'command'
};
/**
 * 
 * @param {import('mocha').Runner} runner 
 */

function attachEventDispatch(runner, suites) {
  process.on('message', data => {
    if (data.type && data.type === 'init') {
      dispatchEvent({
        type: 'init',
        data: suites
      });
    }
  }); // runner.on(EVENT_RUN_BEGIN, () => { 
  //     dispatch()
  // });
  // runner.on(EVENT_RUN_END, () => { 
  //     dispatch()
  // });

  runner.on(EVENT_SUITE_BEGIN, suite => {
    dispatchUpdate(Type.SUITE, suite.id, {
      started: true
    });
  });
  runner.on(_seleniumActor.Events.BEFORE_COMMAND_EXECUTE, command => {
    dispatchUpdate(Type.COMMAND, command.id, {
      started: true
    });
  });
  runner.on(_seleniumActor.Events.AFTER_COMMAND_SUCCESS, command => {
    dispatchUpdate(Type.COMMAND, command.id, {
      state: 'success'
    });
  });
  runner.on(_seleniumActor.Events.AFTER_COMMAND_ERROR, command => {
    dispatchUpdate(Type.COMMAND, command.id, {
      state: 'failed'
    });
  });
  runner.on(EVENT_TEST_PENDING, test => {
    dispatchUpdate(Type.TEST, test.id, {
      state: 'pending'
    });
  });
  runner.on(EVENT_TEST_PASS, test => {
    dispatchUpdate(Type.TEST, test.id, {
      state: 'success'
    });
  });
  runner.on(EVENT_TEST_FAIL, test => {
    dispatchUpdate(Type.TEST, test.id, {
      state: 'failed'
    });
  });
  runner.on(EVENT_TEST_END, test => {
    dispatchUpdate(Type.TEST, test.id, {
      screenshot: '/'
    });
  }); // runner.on(EVENT_RUN_END, test => { 
  //     dispatchUpdate(Type.TEST, test.id, { state: 'pending' });
  // });
}

function dispatchUpdate(type, id, state) {
  const message = {
    event: 'update',
    type,
    id,
    state
  };
  dispatchEvent(message);
}

function dispatchEvent(data) {
  const isForkProcess = typeof process.send !== 'undefined';

  if (isForkProcess) {
    process.send(data);
  } else {
    console.error('is not fork process, no IPC data channel');
  }
}

module.exports = exports.default;