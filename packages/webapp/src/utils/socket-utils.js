import createSock from 'socket.io-client';

const sock = createSock().open();

export function subscribeToTestUpdate(id, fn) {
    console.log('@@DEBUG - inside - subscribing to ', id);
    sock.emit('init', id)
        .on('connection', () => {
            console.log('@@DEBUG - socket is connected to server');
        })
        .on('update', data => {
            fn(data);
        })
}
