const { EventEmitter } = require('events');
const { Builder } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const Context = require('mocha/lib/context');
const Runner = require('mocha/lib/runner');
const path =require('path');
const fse = require('fs-extra');
const bluebird = require('bluebird');

const fs = bluebird.promisifyAll(fse);

const debug = require('debug')('@pkg:actor');

const {
    FindAllCommand,
    AmOnPageCommand,
    ClickCommand,
    FindCommand,
    SeeCommand,
    WaitCommand,
    WaitToFindCommand,
    WaitToSeeCommand,
    FillInputCommand,
} = require('./commands');


const shoudBeTypeOrNull = (type, paramName, paramVal) => {
    if(paramVal !== null && !(paramVal instanceof type)) {
        throw new TypeError(`expect ${paramName} to be null or a ${getTypeName(type)}, got ${getTypeName(paramVal)}`)
    }
}

const getTypeName = val => {
    if(val === null || val === void 0) {
        return typeof val;
    }

    return val.constructor.name === 'Function' ? val.name : val.constructor.name;
}

const shouldBeContextOrNull = shoudBeTypeOrNull.bind(null, Context);
const shouldBeRunnerOrNull = shoudBeTypeOrNull.bind(null, Runner);

// const getTimeStamp = () => new Date().toISOString().replace(/T/, '_').replace(/\..+/, '');

class MochaContextAware extends EventEmitter {

    /**
     * 
     * @param {*} param0 
     */
    constructor({ context, runner }) {
        super();
        context = context || null;
        runner = runner || null;

        this._mochaContext = null;
        this._mochaRunner = null;
        
        this.context(context);
        this.runner(runner);
    }

    context(context) {
        shouldBeContextOrNull('context', context);
        this._mochaContext = context;
        return this;
    }

    runner(runner) {
        shouldBeRunnerOrNull('runner', runner);
        this._mochaRunner = runner;
        return this;
    }

    /**
     * if a runner is defined, emit event via runner,
     * else do nothing.
     * @param {*} event 
     * @param  {...any} args 
     */
    emitRunnerEvent() {
        if(this._mochaRunner)
            return this._mochaRunner.emit.apply(this._mochaRunner, arguments);
    }

    /**
     * @returns {boolean} indicate if mochaContext has been set
     */
    hadContext() {
        return this._mochaContext instanceof Context;
    }
}

class Actor extends MochaContextAware {
    constructor(options = {}) {
        super(options);
        
        /** @type {import('selenium-webdriver').WebDriver} */
        this._driver = options.driver || new Builder().forBrowser('chrome').setChromeOptions(new chrome.Options().headless()).build();
    }

    /**
     * @returns {import('selenium-webdriver').WebDriver} the internal webdriver
     */
    getDriver() {
        return this._driver;
    }

    async quit() {
        const driver = this.getDriver();
        if(driver) {
            return driver.quit();
        }
    }

    async findAll() {
        await this._executCommand(new FindAllCommand(...arguments));
    }

    async amOnPage() {
        await this._executCommand(new AmOnPageCommand(...arguments));
    }

    async click () {
        await this._executCommand(new ClickCommand(...arguments));
    }
        
    async find() {
        await this._executCommand(new FindCommand(...arguments));
    }

    async see() {
        await this._executCommand(new SeeCommand(...arguments));
    }

    async wait() {
        await this._executCommand(new WaitCommand(...arguments));
    }

    async waitToFind() {
        await this._executCommand(new WaitToFindCommand(...arguments));
    }

    async waitToSee() {
        await this._executCommand(new WaitToSeeCommand(...arguments));
    }

    async fillInput() {
        await this._executCommand(new FillInputCommand(...arguments))
    }

    /**
     * @param {import('./commands').WebDriverCommand} command 
     */
    async _executCommand(command) {
        let result, error;
        try {
            this._startCommand(command);
            this.emitRunnerEvent(Actor.Events.BEFORE_COMMAND_EXECUTE, command);
            result = await command.execute(this._driver);
        } catch (e) {
            error = e;
        } finally {
            this._endCommand(command);

            await this._takeScreenshot(command);

            if (error) {
                command.state = 'failed';
                this.emitRunnerEvent(Actor.Events.AFTER_COMMAND_ERROR, command, error);
                throw new Error(`error executing actor command ${command.name}:${command.args[0]}, ${error}`);
            } else {
                command.state = 'passed';
                this.emitRunnerEvent(Actor.Events.AFTER_COMMAND_SUCCESS, command, result);
            }

            this.emitRunnerEvent(Actor.Events.AFTER_COMMAND_END, command);
        }
    }

    _startCommand(command) {
        this._addCommandToContext(command);
        command.started = true;
        command.startTime = Date.now();
    }

    _endCommand(command) {
        if(command.started) {
            command.duration = Date.now() - command.startTime;
            delete command.startTime;
        }
    }

    async _takeScreenshot(command) {
        const rootPath = path.resolve(__dirname, '..', '..', '.goworks', 'reports');
        
        await fs.ensureDir(rootPath);
        
        const filePath = path.resolve(rootPath, `${command.id}.png`);
        const buffer = await this._driver.takeScreenshot();

        debug('writing to', filePath);
        try {
            await fs.writeFile(filePath, buffer, 'base64');
        } finally {
            command.afterScreenshot = filePath;
        }
    }

    _addCommandToContext(command) {
        const test = this._mochaContext && this._mochaContext.test;
        if(test) {
            command.parent = test;
            
            if(!Array.isArray(test.commands)) {
                test.commands = [];
            }

            test.commands.push(command);
        }
    }
}

Actor.Events = {
    BEFORE_COMMAND_EXECUTE: 'BEFORE_COMMAND_EXECUTE',
    AFTER_COMMAND_SUCCESS: 'AFTER_COMMAND_SUCCESS',
    AFTER_COMMAND_ERROR: 'AFTER_COMMAND_ERROR',
    AFTER_COMMAND_END: 'AFTER_COMMAND_END',
}

module.exports = Actor
