#!/usr/bin/env node

/**
 * framework
 * |____ cli
 * |____ packages
 *       |____ @pkg/mocha-x
 *       |____ @pkg/mocha-interface
 *       |____ @pkg/actor-lib
 *       |____ @pkg/reporter
 *       |____ @pkg/web
 * 
 */
const debug = require('debug')('mocha-scripts:cli');
const yargs = require('yargs');
const Mocha = require('mocha');

const commands = require('./commands');

exports.main = () => {
    const argv = process.argv.slice(2);
    yargs
        .scriptName('goworks')
        // .usage('$0 <cmd> [args]')
        .showHelpOnFail()
        .command(commands.server)
        .command(commands.run)
        .demandCommand()
        .argv
}

// allow direct execution
if (require.main === module) {
    exports.main();
}
