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
yarn install
```
This will install and link dependencies for the package and all subpackages

3. Download the selenium chrome / safari etc... drivers and configure them in your PATH.
```zsh
export PATH=path/to/your/webdrivers/folder:$PATH
```
You don't have to install all, just the ones you need. You can find the downloads here https://www.seleniumhq.org/download/

## Run Project
**Run server**
```
yarn goworks:server
```
or
```
cli/bin/goworks server
```
This will start a local server, running on default port 8989. Access the webapp on https://localhost:8989

**Run test via Cli**
```
yarn goworks:run --file your/test/file.js
```
or
```
cli/bin/goworks run --file your/test/file.js
```

## Project Structure
`Mocha` is a very popular javascript test runner, and it provides some decent and extensible interfaces, we are extending mocha to provide additional reporting and scripting options for our framework.

The code is orgainized into subpackages in `cli/` and under the `packages/` folder, here are the list of subpackages:

| Package Name               | Purpose                                                                                                                    |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| @pkg/mocha-actor-interface | this is the extension on mocha to support the custom scripting style (e.g. `I.click(...)`, `I.fill(...)`)                  |
| @pkg/mocha-actor-reporter  | this is the custom reporter that records progress and results for each test run, the webapp interacts with the reporter to |
| @pkg/selenium-actor        | this is the wrapper over selenium, the command list are defined here.                                                      |
| @pkg/webapp                | this is web portal (UI), both client and server.                                                                           |
| cli                        | this is the goworks cli, can be use to start the UI or run tests directly                                                  |

