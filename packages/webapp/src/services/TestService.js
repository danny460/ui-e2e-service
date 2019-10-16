const Paths = {
    EXECUTE: '/run',
}

export default {
    execute(options = {}) {
        return fetch(Paths.EXECUTE, {
            method: 'POST',
            body: options.scripts,
        }).then(res => res.json());
    },
}