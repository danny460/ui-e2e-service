const Mocha = require('mocha');
const Suite = require('mocha/lib/suite');
const Test = require('mocha/lib/test');
const Context = require('mocha/lib/context');
const { EVENT_FILE_PRE_REQUIRE } = Suite.constants;

const Actor = require('@pkg/selenium-actor');

/**
 * @param {import('mocha/lib/suite')} suite the root suite
 */
module.exports = Mocha.interfaces['mocha-actor'] = function(suite) {
    const suites = [suite];
    
    suite.on(EVENT_FILE_PRE_REQUIRE, function(context, file, mocha) {

        const common = require('mocha/lib/interfaces/common')(suites, context, mocha);

        context.beforeEach = common.beforeEach;
        context.afterEach = common.afterEach;
        context.before = common.before;
        context.after = common.after;
        context.run = mocha.options.delay && common.runWithSuite(suite);

        mocha.run = function() {
            const args = Array.prototype.slice(arguments);
            const runner = mocha.run.apply(mocha, args);
            mocha.runnerRef = runner;
            return runner;
        }

        /**
         * Fixture
         */
        context.fixture = function(title, fn) {
            return common.suite.create({ title, file, fn });
        }

        context.fixture.skip = function(title, fn) {
            return common.suite.skip({ title, file, fn });
        }

        context.fixture.only = function(title, fn) {
            return common.suite.only({ title, file, fn });
        }

        /**
         * Scenario
         */
        context.scenario = function(title, fn) {
            const suite = suites[0];

            fn = createThunk({}, fn);;
            if(suite.isPending()) fn = null;

            const test = new Test(title, fn);
            test.file = file;
            suite.addTest(test);
            return test;
        }

        /**
         * create a thunk over the test function and inject an actor
         * to it. the actor will be injected with
         * test context if used in an Runnable. 
         */
        function createThunk(actorOptions, fn) {
            const useActor = fn.length; 

            // this function always return promise
            return function() {
                if(useActor) {
                    actorOptions = actorOptions || {};
                    const actor = new Actor(actorOptions).runner(mocha.runner);

                    this instanceof Context && actor.context(this);

                    const retVal = fn.apply(this, [actor].concat(arguments));

                    return Promise.resolve(retVal).finally(() => actor.quit());
                }

                return Promise.resolve(fn.apply(this, arguments));
            }
        }

        context.scenario.only = function(title, fn) {
            return common.test.only(mocha, context.scenario(title, fn));
        };
      
        context.scenario.skip = common.test.skip;
        context.scenario.retries = common.test.retries
    });
}

module.exports.description = 'extended bdd style testing with actor over selenium-webdriver';
