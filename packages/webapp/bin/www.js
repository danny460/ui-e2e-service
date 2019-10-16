#!/usr/bin/env node

const port = 8989;
const { server, ws } = require("../server");

server.listen(port, () => {
    console.log("Server listening on", port);
});
