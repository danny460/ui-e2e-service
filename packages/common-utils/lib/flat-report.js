/**
 *  flattened json tes report
 *  @class
 *  @example an example shape of a flattend report
 *  {
 *      runId: "xxx",
 *      suites: {
 *          root: {
 *              suites: ["suite-id-a"],
 *              tests: []
 *          },
 *          "suite-id-a": {
 *              parent: "root",
 *              suites: [],
 *              tests: ["test-id-a"]
 *          }
 *      },
 *      tests: {
 *          "test-id-a": {
 *              parent: "test-id-a",
 *              commands: [],
 *          }
 *      },
 *      commands: {}
 * }
 */
class FlatReport {
    /**
     * create a flattened test run report model, with following shape:
     * 
     * @param {object} options 
     * @param {string} options.runId the unique id for the test run
     */
    constructor(options = {}) {
        const { runId } = options
        if(runId) {
            this.runId = runId;
        }
        
        this.suites = { root: new FlatSuite() };
        this.tests = {};
        this.commands = {};
    }

    getEntity(type, id) {
        const { entities } = this._getConstructorAndEntities(type);
        
        let entity = null;
        if(typeof entities[id] === 'object') {
            entity = entities[id];
        }
        
        return entity;
    }

    addSuite(id, parent, options = {}) {
        this.addEntity('suite', id, parent, options);
    }

    addTest(id, parent, options = {}) {
        this.addEntity('test', id, parent, options);
    }

    addCommand(id, parent, options = {}) {
        this.addEntity('command', id, parent, options);
    }

    /**
     * @typedef {"suite" | "test" | "command" } EntityType
     */

    /**
     * add suite/test/command into the report
     * @param {EntityType} type type of entity to be added
     * @param {string} id id of entity to be added
     * @param {string} parent id of the parent entity 
     * @param {object} options additional data of the entity
     */
    addEntity(type, id, parent, options = {}) {
        const { constructor, entities } = this._getConstructorAndEntities(type);
        if(typeof entities[id] !== 'undefined')
            throw new Error(`error adding ${type} with id ${id} already exists`);
        const entity = new constructor();
        entities[id] = Object.assign(entity, { id, parent, ...options });
        console.log('@@@@@@DEBUG ADDED', entities[id]);
    }

    updateEntity(type, id, data) {
        const { entities } = this._getConstructorAndEntities(type);
        if(typeof entities[id] !== 'object')
            throw new Error(`error updating entity, ${type} with id ${id} does not exist`);
        const entity = entities[id];
        entities[id] = Object.assign({}, entity, data);
    }

    _getConstructorAndEntities(type) {
        let constructor, entities;
        switch (type) {
            case 'suite':
                constructor = FlatSuite;
                entities = this.suites;
                break;
            case 'test':
                constructor = FlatTest;
                entities = this.tests;
                break;
            case 'command':
                constructor = FlatCommand;
                entities = this.commands;
                break;
            default: 
                throw new Error('invalid type: ' + type);
        }
        
        if(!constructor || !entities) {
            throw new Error('cannot find constructor/entities for tpye ' + type);
        }

        return { constructor, entities };
    }
}

class FlatEntity {
    constructor(options = {}) {
        this.parent = options.parent || null;
        this.id = options.id || null;
        this.status = options.status || null;
    }
}

class FlatSuite extends FlatEntity {
    constructor(options = {}) {
        super(options);
        this.suites = options.suites || [];
        this.tests = options.tests || [];
    }
}

class FlatTest extends FlatEntity {
    constructor(options = {}) {
        super(options);
        this.commands = options.commands || [];
    }
}

class FlatCommand extends FlatEntity {
    constructor(options = {}) {
        super(options);
        this.afterScreenshot = options.afterScreenshot || null;
    }
}

module.exports = exports = FlatReport;

exports.FlatSuite = FlatSuite;
exports.FlatTest = FlatTest;
exports.FlatCommand = FlatCommand;
