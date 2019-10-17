/**
* @module MochaActorReporter
*/
import logger from 'debug';
import { stringify } from 'flatted';
import { render } from 'ink'
import Mocha from 'mocha'
import React from 'react'
import shortid from 'shortid';

import { Events as ActorEvents } from '@pkg/selenium-actor';

import ConsoleUI from './ui/console-report';

const debug = logger('@pkg:reporter:reporter');
const {
    EVENT_RUN_BEGIN,
    EVENT_RUN_END,
    EVENT_SUITE_BEGIN,
    EVENT_SUITE_END,
    EVENT_TEST_BEGIN,
    EVENT_TEST_END,
    EVENT_TEST_FAIL,
    EVENT_TEST_PASS,
    EVENT_TEST_PENDING,
} = Mocha.Runner.constants;

const ALL_EVENTS = Object.freeze([
    EVENT_RUN_BEGIN,
    EVENT_SUITE_BEGIN,
    EVENT_SUITE_END,
    EVENT_TEST_BEGIN,
    ActorEvents.BEFORE_COMMAND_EXECUTE,
    ActorEvents.AFTER_COMMAND_SUCCESS,
    ActorEvents.AFTER_COMMAND_ERROR,
    ActorEvents.AFTER_COMMAND_END,
    EVENT_TEST_PENDING,
    EVENT_TEST_PASS,
    EVENT_TEST_FAIL,
    EVENT_TEST_END,
    EVENT_RUN_END,
]);

// /**
//  * send an update event to parent process 
//  * @typedef {"run"|"suite"|"test"|"command"} UpdateType
//  * @param {UpdateType} type the type of update event, either of run/suite/test/command
//  * @param {object} data the update data
//  * @param {string} [data.id] the id of the entity to be udpated
//  */
// const dispatchUpdate = (type, data) => {
//     const message = { 
//         type: 'update', 
//         payload: { type, ...data }
//     }
//     dispatch(message);
// }

const hasIPCChannel = () => typeof process.send === 'function';

const dispatch = message => {
    if(hasIPCChannel()) { 
        process.send(message);
    } else {
        debug('no IPC channel, cannot send message: %o', message);
    }
}

/**
* @class
* @extends Mocha.reporters.Base
*/
class MochaActorReporter extends Mocha.reporters.Base {
    
    /**
    * Constructs a new `MochaActorReporter` reporter instance.
    *
    * @public
    * @param {import('mocha').Runner} runner - Instance triggers reporter actions.
    * @param {Object} [options] - runner options
    */
    constructor(runner, options) {
        super(runner, options);

        this.runId = null;
        this.suite = null;
        this.title = options.reportTitle || 'Report';

        this.initJsonReportGeneration();
        this.initConsoleReporter();
        this.initEventDispatching();
            
        runner.once(EVENT_RUN_END, () => {
            this.epilogue();
        });
    }

    setRunId(id) {
        if(!id) throw new Error('expect run id to be valid UUID, but got ' + id);
        this.runId = id;
    }

    initJsonReportGeneration() {
        this.runner.on(EVENT_SUITE_BEGIN, suite => { 
            suite.started = true;
            if(suite.root) {
                this.suite = suite;
            }
        }).on(EVENT_TEST_BEGIN,  test => {
            test.started = true;
            test.commands = [];
        }).on(ActorEvents.BEFORE_COMMAND_EXECUTE, command => {
            command.id = shortid();
            command.started = true;
        });
    }

    initConsoleReporter() {
        ALL_EVENTS.forEach(event => {
            this.runner.on(event, () => render(<ConsoleUI suites={[this.suite]} title={this.title} />));
        });
    }

    initEventDispatching() {
        if(!hasIPCChannel()) {
            return debug('no IPC channel, event dispatching intialization aborted');
        }

        dispatch({ type: 'init' });

        process.on('message', data => {
            const { type, payload } = data || {};

            switch (type) {
                case 'init-ack':
                    debug('recieved init-ack message with payload %s', payload);
                    this.setRunId(payload);
                    this._doInitEventDispatching();
                    break;
                default:
                    debug('unhandled message from reporter: %o', data);
            }
        });
    }

    _doInitEventDispatching() {
        ALL_EVENTS.forEach(event => {
            this.runner.on(event, () => {
                return dispatch({ 
                    type: 'update', 
                    payload: stringify(this.suite) 
                });
            });
        });
    }
}

MochaActorReporter.description = 'hierarchical & verbose console reporter + web UI';

export default MochaActorReporter;
