module.export = exports;

exports.createAppServer = options => {
    const { server } = require('./server');
    server.listen(options.port, () => console.log(`listening on ${options.port}`));
}