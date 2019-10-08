const { By, until } = require('selenium-webdriver');

const Commands = {
    AM_ON_PAGE: 'amOnPage',
    CLICK: 'click',
    FILL_INPUT: 'fillInput',
    FIND: 'find',
    FIND_ALL: 'findAll',
    SEE: 'see',
    WAIT: 'wait',
    WAIT_TO_FIND: 'waitToFind',
    WAIT_TO_SEE: 'waitToSee',
}

class WebDriverCommand {
    constructor(name, ...args) {
        this.name = name;
        this.args = args;
        
        this.duration = null;
    }

    setDuration(duration) {
        this.duration = duration;
    }

    /**
    * @param {import('selenium-webdriver').WebDriver} driver 
    */
    async execute(driver) {
        throw new Error('no implementation error');
    }
}

class AmOnPageCommand extends WebDriverCommand {
    constructor(...args) {
        super(Commands.AM_ON_PAGE, ...args);
    }
    
    async execute(driver) {
        const url = this.args[0];
        return driver.get(url);
    }
}

class ClickCommand extends WebDriverCommand {
    constructor(...args) {
        super(Commands.CLICK, ...args);
    }
    
    /**
    * @param {import('selenium-webdriver').WebDriver} driver 
    * @return {Promise<void>}
    */
    async execute(driver) {
        let [locator, timeout]  = this.args;
        if(typeof locator === 'string') {
            locator = By.css(locator);
        }
        
        let el = await driver.wait(until.elementLocated(locator), timeout);
        await driver.wait(until.elementIsVisible(el), timeout);
        return el.click(locator);
    }
}

class FillInputCommand extends WebDriverCommand {
    constructor(...args) {
        super(Commands.FILL_INPUT, ...args);
    }
    
    /**
    * @param {import('selenium-webdriver').WebDriver} driver 
    * @returns {Promise<void>}
    */
    async execute(driver) {
        let [locator, input, timeout] = this.args;
        if(typeof locator === 'string') {
            locator = By.css(locator);
        }
        
        const el = await driver.wait(until.elementLocated(locator), timeout);
        await driver.wait(until.elementIsVisible(el), timeout);
        return el.sendKeys(input);
    }
}

class FindCommand extends WebDriverCommand {
    constructor(...args) {
        super(Commands.FIND, ...args);
    }
    
    /**
    * @param {import('selenium-webdriver').WebDriver} driver 
    * @return {import('selenium-webdriver').WebElementPromise}
    */
    async execute(driver) {
        let [locator, timeout] = this.args;
        if(typeof locator === 'string') {
            locator = By.css(locator);
        }
        
        return driver.wait(until.elementLocated(locator), timeout);
    }
}

class FindAllCommand extends WebDriverCommand {
    constructor(...args) {
        super(Commands.FIND_ALL, ...args);
    }

    /**
    * @param {import('selenium-webdriver').WebDriver} driver 
    * @return {Promise<import('selenium-webdriver').WebElement[]>}
    */
    async execute(driver) {
        let [locator, timeout] = this.args;
        if(typeof locator === 'string') {
            locator = By.css(locator);
        }

        await driver.wait(until.elementsLocated(locator), timeout);
        return driver.findElements(locator);
    }
}

class SeeCommand extends WebDriverCommand {
    constructor(...args) {
        super(Commands.SEE, ...args);
    }
    
    /**
    * @param {import('selenium-webdriver').WebDriver} driver 
    * @return {import('selenium-webdriver').WebElementPromise}
    */
    async execute(driver) {
        let [locator, timeout] = this.args;
        if(typeof locator === 'string') {
            locator = By.css(locator);
        }
        
        const element = await driver.wait(until.elementLocated(locator), timeout);
        return driver.wait(until.elementIsVisible(element));
    }
}

class WaitCommand extends WebDriverCommand {
    constructor(...args) {
        super(Commands.WAIT, ...args);
    }
    
    /**
    * @param {import('selenium-webdriver').WebDriver} driver 
    * @return {Promise<void>}
    */
    async execute(driver) {
        let msOrCondition = this.args[0];
        if(typeof msOrCondition === 'number') {
            return driver.sleep(msOrCondition);
        } else {
            return driver.wait(msOrCondition);
        }
    }
}

class WaitToFindCommand extends WebDriverCommand {
    constructor(...args) {
        super(Commands.WAIT_TO_FIND, ...args);
    }
    
    async execute() {
        throw new Error('no implementation');
    }
}

class WaitToSeeCommand extends WebDriverCommand {
    constructor(...args) {
        super(Commands.WAIT_TO_SEE, ...args);
    }
    
    async execute() {
        throw new Error('no implementation');
    }
}

module.exports = exports;
exports.WebDriverCommand = WebDriverCommand;
exports.Commands = Commands;

exports.AmOnPageCommand = AmOnPageCommand;
exports.ClickCommand = ClickCommand;
exports.FillInputCommand = FillInputCommand;
exports.FindCommand = FindCommand;
exports.FindAllCommand = FindAllCommand;
exports.SeeCommand = SeeCommand;
exports.WaitCommand = WaitCommand;
exports.WaitToFindCommand = WaitToFindCommand;
exports.WaitToSeeCommand = WaitToSeeCommand;

// module.exports = {
//     Commands,
//     WebDriverCommand,
//     AmOnPageCommand, 
//     ClickCommand, 
//     FillInputCommand, 
//     FindCommand, 
//     FindAllCommand,
//     SeeCommand, 
//     WaitCommand, 
//     WaitToFindCommand, 
//     WaitToSeeCommand, 
// };
