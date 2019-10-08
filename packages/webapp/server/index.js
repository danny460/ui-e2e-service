const http = require('http');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser')
const socketio = require('socket.io');
const { fork } = require('child_process');

const port = 8999;
const app = express();
const ws = socketio({ path: '/ws', serveClient: true });

const processMap = {};

app.use(express.static(path.join(__dirname, '../public')));

app.use(bodyParser.json());

app.get('/profiles', (req, res) => { });

function startWorker() {
    return fork('node_modules/.bin/_mocha', [
        '--reporter',
        'mocha-actor-reporter/dist',
        '--require',
        'mocha-actor-ui',
        '--ui',
        'mocha-actor',
        '',
        '../automation/specs/ui.spec.js'
    ], {
        cwd: path.join(__dirname, '..'),
        stdio: 'pipe',
    });
}

/**
 * running test cases
 */
app.post('/run', (req, res) => {
    console.log(req.body);

    const { script } = req.body;

    const isUserScript = Boolean(String.prototype.trim.apply(script));

    if (isUserScript) {
        // create temp file...
        // run mocha agains temp file...
        // remove temp file...
        console.log('user script:', script);
    } else {
        /** @type import('child_process').ChildProcess */
        let worker;

        if (running) {
            return res.status(409).send('a process is already running, please wait for it to finish');
        }

        try {
            worker = startWorker();

            running = true;

            process.on('message', data => {
                console.log('@@FROM CHILD:', data);
            });

        } catch (e) {
            return res.status(500).send('error running task' + e);
        }

        if (worker) {

            worker.on('error', data => {
                ws.emit('task-update', JSON.stringify(data));
            })

            worker.on('message', data => {
                console.log('@@DEBUG - MESSAGE:', data);
            })

            worker.on('exit', () => {
                running = false;
            })
        }
    }

    return res.status(200).send('running');
});

const server = http.createServer(app);
ws.attach(server);

module.exports = exports;
exports.server = server;
exports.ws = ws;
