/**
* @module MochaActorReporter
*/
import { render } from 'ink'
import Mocha from 'mocha'
import React from 'react'
import shortid from 'shortid';
import debugLib from 'debug';

import { FlatReport } from '@pkg/common-utils';
import { Events as ActorEvents } from '@pkg/selenium-actor';

import Report from './report';

const debug = debugLib('@pkg:reporter:reporter');

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

/**
 * send an update event to parent process 
 * @typedef {"run"|"suite"|"test"|"command"} UpdateType
 * @param {UpdateType} type the type of update event, either of run/suite/test/command
 * @param {object} data the update data
 * @param {string} [data.id] the id of the entity to be udpated
 */
function dispatchUpdate(type, data) {
    const message = { 
        type: 'update', 
        payload: { type, ...data }
    }
    dispatch(message);
}

function dispatch(message) {
    const isForkProcess = typeof process.send !== 'undefined';
    if(isForkProcess) { 
        process.send(message);
    } else {
        debug('this is not a forked process, dispatch has no effect');
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

        this.suites = [];
        this.title = options.reportTitle || 'Generated Report';
        this.jsonReport = new FlatReport();

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
            debug('json report: suite begin: %o', suite);
            if(!suite.parent || suite.parent.root) 
                return; // root suite, do noting
            
            // const id = shortid();
            const parentId = suite.parent.parent ? 'root' : suite.parent.id;
            // suite.id = id;
            suite.started = true;
            
            this.jsonReport.addEntity('suite', suite.id, parentId, { status: 'running' })
            this.suites.push(suite);
        }).on(EVENT_TEST_BEGIN,  test => {
            debug('json report: test begin');
            // const id = shortid();
            const parentId = test.parent ? 'root' : test.parent.id;
        
            // test.id = id;
            test.started = true;

            this.jsonReport.addEntity('test', test.id, parentId, { status: 'running' });
        }).on(ActorEvents.BEFORE_COMMAND_EXECUTE, command => {
            debug('json report: command begin');
            const id = shortid();
            const parentId = command.parent ? command.parent.id : null;
            if(!parentId) {
                throw new Error('no parent specified for command ' + command);
            }

            command.id = shortid();
            this.jsonReport.addEntity('command', id, parentId, { status: 'running' });
        });
    }

    initConsoleReporter() {
        ALL_EVENTS.forEach(event => {
            this.runner.on(event, () => render(<Report suites={[...this.suites]} title={this.title} />));
        });
    }

    initEventDispatching() {
        dispatch({ type: 'init' });

        process.on('message', data => {
            if(data.type) {
                switch (data.type) {
                    case 'init-ack':
                        debug('recieved init-ack message with payload %s', data.payload);
                        this.setRunId(data.payload);
                        this._doInitEventDispatching();
                        break;
                    default:
                        debug('unhandled message type from reporter', data.type);
                }
            }
        });
    }

    _doInitEventDispatching() {
        this.runner
            .on(EVENT_RUN_BEGIN, () => {
                dispatchUpdate('run', { status: 'running' })
            })
            .on(EVENT_RUN_END, () => {
                dispatchUpdate('run', { status: 'completed' });
            })
            .on(EVENT_SUITE_BEGIN, suite => {
                suite.id = suite.id || 'root';
                const parent = suite.id === 'root' ? suite.parent.id : null;
                const id = suite.id;

                const { title } = suite;
                
                dispatchUpdate('suite', { id, parent, title, status: 'running' });
            })
            .on(EVENT_SUITE_END, ({ id }) => {
                id = id || 'root';
                dispatchUpdate('suite', { id, status: 'completed' });
            })
            .on(EVENT_TEST_BEGIN, ({ id, parent, title }) => {
                parent = parent.id;
                dispatchUpdate('test', { id, parent, title, status: 'running'});
            })
            .on(EVENT_TEST_END, ({ id }) => {
                // dispatchUpdate('test', { id });
            })
            .on(EVENT_TEST_FAIL, ({ id }) => {
                dispatchUpdate('test', { id, status: 'failed'});
            })
            .on(EVENT_TEST_PASS, ({ id }) => {
                dispatchUpdate('test', { id, status: 'passed'});
            })
            .on(EVENT_TEST_PENDING, ({ id }) => {
                dispatchUpdate('test', { id, status: 'pending'});
            })
            .on(ActorEvents.BEFORE_COMMAND_EXECUTE, ({ id, parent, name, args }) => {
                parent = parent.id;
                dispatchUpdate('command', { id, parent, name, args, status: 'running'});
            })
            .on(ActorEvents.AFTER_COMMAND_SUCCESS, ({ id }) => {
                dispatchUpdate('command', { id, status: 'passed'});
            })
            .on(ActorEvents.AFTER_COMMAND_ERROR, ({ id }) => {
                dispatchUpdate('command', { id, status: 'failed'});
            })
            .on(ActorEvents.AFTER_COMMAND_END, ({ id, afterScreenshot }) => {
                dispatchUpdate('command', { id, afterScreenshot });
            });
    }
}

MochaActorReporter.description = 'hierarchical & verbose console reporter + web UI';

export default MochaActorReporter;
