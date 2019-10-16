const http = require('http');
const path = require('path');
const express = require('express');
const { EventEmitter } = require('events');
const bodyParser = require('body-parser')
const socketio = require('socket.io');
const { fork } = require('child_process');
const fse = require('fs-extra');
const bluebird = require('bluebird');
const fs = bluebird.promisifyAll(fse);
const { FlatReport } = require('@pkg/common-utils')

const debug = require('debug')('@pkg:webapp:server');
const debugSock = require('debug')('@pkg:webapp:server:socket');

const shortid = require('shortid');
const uuidv4 = require('uuid/v4');

class ReportCache extends EventEmitter {
    constructor() {
        super();
        this._cache = {};
    }

    init(id) {
        if(typeof this._cache[id] !== 'undefined')
            throw new Error('cache item with id ' + id + ' already exists');
        this._cache[id] = new FlatReport({ runId: id });
    }

    get(id) {
        return this._cache[id];
    }

    update(id, data) {
        if(typeof this._cache[id] !== 'object')
            throw new Error('report with id ' + id + 'is not found in cache');
        this._updateReport(this._cache[id], data);
        this.emit('update', id);
    }

    /**
     * 
     * @param {FlatReport} report 
     * @param {*} data 
     */
    _updateReport(report, data) {
        const { type, id, parent, ...otherData } = data;
        
        let entity = report.getEntity(type, id);
        if(!entity) {
            report.addEntity(type, id, parent, otherData);
            if(id !== 'root') {
                switch(type) {
                    case 'suite':
                    case 'test':
                        const parentSuite = report.getEntity('suite', parent || 'root');
                        // push to parentSuite.tests or parentSuite.suites
                        parentSuite && parentSuite[`${type}s`].push(id);
                        break;
                    case 'command':
                        const parentTest = report.getEntity('test', parent);
                        parentTest && parentTest.commands.push(id);
                        break;
                }    
            }
        } else {
            report.updateEntity(type, id, otherData);
        }
    }

    remove(id) {
        delete this._cache[id];
    }

    clear() {
        delete this._cache;
        this._cache = {};
    }
}

const port = 8999;
const app = express();
const ws = socketio({ 
    // path: '/ws', 
    serveClient: true, 
});

const processMap = {};
const reportCache = new ReportCache();

const projectRoot = path.resolve(__dirname, '..', '..', '..');

ws.on('connection', sock => {
    sock.on('init', runId => {
        debugSock('a socket is connected to %s', runId);
        sock.join(runId, () => {
            debugSock('a socket joined to %s', runId);    
        });
    });
});

app.use(express.static(path.join(__dirname, '../public')));

app.use(bodyParser.json());

app.use((req, res, next) => {
    debug('recieved %s\t%s', req.method, req.url);
    next();
})

app.get('/report/:runId/screenshots/:id', async (req, res) => {
    const { runId, id } = req.params;
    debug('get image for ###runId: %s ###id: %s', runId, id);

    const filePath = path.join(projectRoot, '.goworks', 'reports', `${id}.png`);
    debug('looking for image: %s', filePath);

    const exists = await fs.exists(filePath);

    if(exists) {
        debug('image found!!!');
        res.type('png').sendFile(filePath);
    } else {
        debug('image NOT FOUND!!!');
        res.sendStatus(404);
    }
});


function startWorker() {
    worker = fork('./cli/bin/goworks', [
        'run',
        '--file',
        './examples/github.spec.js',
    ], {
        detached: true,
        cwd: projectRoot,
        stdio: 'pipe',
    });

    runId = uuidv4();
    worker.id = runId;
    
    return worker;
}

/**
 * running test cases
 */
app.post('/run', async (req, res) => {

    let { script } = req.body;
    script = script && String.prototype.trim.apply(script);
    
    const isUserScript = Boolean(script);
    let runId;

    if (isUserScript) {
        debug('user supplied a script: %s', script);
        
        // !TODO: 
        // 1. we should validate the script (parse the AST?)
        // 2. if valid, we should create a temp file with the script
        // 3. we should run the temp file

    } else {
        // not using script, then a runnable's id must be supplied
        // in order for us to start running a it.
        
        // TODO:
        // 1. compile list of files
        // 2. start run with files

        /** @type import('child_process').ChildProcess */
        let worker;

        try {
            worker = startWorker();
        } catch (e) {
            worker && worker.kill();
            return res.status(500).send('error running task' + e);
        }

        debug('worker started on pid {%s}', worker.pid);

        const logFile = path.join(projectRoot, '.goworks', 'output.txt');
        await fs.ensureFile(logFile);
        const out = await fs.createWriteStream(logFile);
        worker.stdout.pipe(out);
        worker.stderr.pipe(out);
        // worker.stdout.write = worker.stderr.write = out.write.bind(out);

        // assign id and record in memory, will remove
        // once it's completed;
        processMap[worker.id] = worker;
        reportCache.init(worker.id);

        worker.on('error', data => {
            debug('worker error: %o', data);
            onRunComplete(worker);
        })

        worker.on('message', data => {
            data = data || {};
            const { type, payload } = data;

            switch (type) {
                case 'init':
                    debug('recieved init message, sending ack for test run %s', worker.id);
                    return worker.send({ type: 'init-ack', payload: worker.id });
                case 'update':
                    debug('recieved update %o', payload);
                    if(payload.type === 'run') {
                        const report = reportCache.get(worker.id);
                        report.status = payload.status;
                        reportCache.emit('update', worker.id);
                    } else {
                        reportCache.update(worker.id, payload);
                    }
                    break;
                default:
                    // throw new Error('unknow message type: ' + type + ' recieved');
            }
        });

        worker.on('exit', () => {
            debug('worker exitted');
            onRunComplete(worker);
        });

        reportCache.on('update', cacheId => {
            const testRunId = worker.id;
            debugSock('report cache update is triggered: ### cacheId: %s ### testRunId: %s', cacheId, testRunId);
            if(cacheId === testRunId) {
                debugSock('report cache update matched, sending update via socket');
                ws.to(testRunId).emit('update', reportCache.get(testRunId));
            }
        });
    }

    return res.status(200).json({ id: worker.id });
});

function onRunComplete(worker, error) {
    const { id } = worker;
    const hasError = Boolean(error);
    
    const report = reportCache.get(id);

    if(hasError) {
        report.status = 'error';
    } else {
        report.status = 'complete';
    }

    createLocalReport(report);

    reportCache.remove(id);
    delete processMap[id];
}

function createLocalReport(report) {}

const server = http.createServer(app);
ws.attach(server);

module.exports = exports = { server, ws };
