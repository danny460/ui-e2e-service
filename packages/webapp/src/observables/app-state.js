import { observable, computed } from 'mobx';

export default class AppState {
    

    // relating to IDE REPL script running
    @observable browsers = [];
    @observable script = '';

    // application state
    @observable projects = [];
    @observable runs = [];

    @computed get completedRuns() { 
        return this.runs.filter(run => run.state === 'finished');
    }

    @computed get inProgressRuns() { 
        return this.runs.filter(run => run.state !== 'finished');
    }
}