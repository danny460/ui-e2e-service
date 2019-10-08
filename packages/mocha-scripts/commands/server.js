const { createAppServer } = require('webapp');

const DEFAULT_PORT = 8989;

exports.command = 'server';
exports.describe = 'start the application server with interative web portal';

/**
 * @param {import('yargs').Argv} yargs
 */
exports.builder = yargs => yargs.options({
    'port': {
        default: DEFAULT_PORT,
        description: `the port to run on`,
        alias: 'p',
    }
}).version().help()

exports.handler = argv => {
    createAppServer(argv);
};
