const path = require('path')
const globber = require('glob');
const fse = require('fs-extra');
const bluebird = require('bluebird');
const { execSync } = require('child_process');
const chalk = require('chalk');

const glob = bluebird.promisify(globber);
const fs = bluebird.promisifyAll(fse);

const otherDirs = [
    './cli'
]

const getDirs = () => {
    return glob('packages/*/')
        .then(dirs => dirs.concat(otherDirs))
        .then(dirs => dirs.map(dir => path.join(process.cwd(), dir)))
}

const logDirs = dirs => {
    if(dirs.length > 0)
        console.log('found directories\n%s', chalk.green(dirs.join('\n')));
    else
        console.log(chalk.yellow`no directories found for command`);

    return dirs;
} 

const keepPackageDirs = dirs => dirs.filter(hasPacakgeJson);

const hasPacakgeJson = dir => fs.existsSync(path.join(dir, 'package.json'));

const filterByCommand = (dirs, cmd) => {
    switch (cmd) {
        case 'install':
        case 'i':
        case 'prune':
            return dirs
        default:
            return dirs.filter(dir => {
                const packageJson = require(path.join(dir, 'package'));
                const { scripts } = packageJson;
                return Boolean(scripts && scripts[cmd]);
            });
    }
}

const execAll = (dirs, cmd) => {
    return dirs
        .map(dir => toTask(dir, cmd))
        .forEach(runTask);
}

const toTask = (cwd, cmd) => {
    return { cmd, cwd }
};

const runTask = task => { 
    return execSync(`yarn ${task.cmd}`, { cwd: task.cwd, stdio: 'inherit' });
}

const runAll = () => {
    const cmd = process.argv.slice(2).join(' ');

    if(!cmd) {
        console.log(chalk.red`Error: no command issued`);
        process.exit(1);
    }

    return getDirs()
        .then(keepPackageDirs)
        .then(dirs => filterByCommand(dirs, cmd))
        .then(logDirs)
        .then(dirs => execAll(dirs, cmd))
        .catch(err => {
            console.log(chalk.red('error occured \n'), err.stack);
            process.exit(1);
        })
}

module.exports = runAll;

if (!module.parent) {
    runAll();
}
