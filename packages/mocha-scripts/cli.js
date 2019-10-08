#!/usr/bin/env node

/**
 * framework
 * |____ bin
 * |____ packages
 *       |____ mocha-x
 *       |____ mocha-scripts
 *       |____ mocha-interface
 *       |____ actor-lib
 *       |____ reporter
 *       |____ web
 * 
 * 
 * 
 * 
 */
const debug = require('debug')('mocha-scripts:cli');
const yargs = require('yargs');
const Mocha = require('mocha');

const commands = require('./commands');

exports.main = (argv = process.argv.slice(2)) => {
    yargs
        .scriptName('xyz')
        .usage('$0 <cmd> [args]')
        .command(commands.server)
        .command(commands.run)
        .help()
        .argv
}

// allow direct execution
if (require.main === module) {
    exports.main();
}
