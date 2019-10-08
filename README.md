# Codeworks Automation Framework
This is the code repository for the automation framework

## Prerequsite
**1. Install Node.js**
   
   Go to https://nodejs.org/en/ and follow their installation guide. (recommend 10.16.3 lts, but any version should be fine). Downloading node will also download the package manager NPM

**2. Install Yarn**

We use yarn as the package manager. To install, run below command:
```
npm i -g yarn
```

P.S. hope you are using Mac :P

## Setup
1. Clone this repo, and cd into project's root folder.

2. Run command:
```
yarn install && yarn deps
```
This will install all the dependencies in the parent and subpackages.

3. Download the selenium chrome / safari etc... drivers and configure them in your PATH.
```zsh
export PATH=path/to/your/webdrivers/folder:$PATH
```
You don't have to install all, just the ones you need. You can find the downloads here https://www.seleniumhq.org/download/

## Understand the Structure
`Mocha` is a very popular javascript test runner, and it provides some decent and extensible interfaces, we are extending mocha to provide additional reporting and scripting options for our framework.

The code is orgainized into subpackages under the `packages` folder, here are the list of subpackages:
- **mocha-actor-interface** - this is the extension on mocha to support the custom scripting style (e.g. `I.click(...)`, `I.fill(...)`)
- **mocha-actor-reporter** - this is the custom reporter that records progress and results for each test run, the webapp interacts with the reporter to obtain updates on testing progress.
- **selenium-actor** - this is the wrapper over selenium, the command list are defined here.
- **webapp** - this is web portal (UI), both client and server.
- **mocha-scripts** - this is the cli, can be use to start the UI or run tests directly

