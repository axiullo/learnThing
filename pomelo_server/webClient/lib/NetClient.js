const Pomelo = require('pomelo-node-client');
const pomelo = new Pomelo();
pomelo._debug = true;

pomelo.on("disconnect", () => {
    console.log("pomelo disconnect");
});

pomelo.on("error", (error) => {
    console.log("pomelo error", error);
});

function CreateNetClient(host, port) {
    let client = new NetClient(host, port);
    return client;
}

class NetClient {
    connectionDetails = null;
    log = true;
    _init = false;

    constructor() {
        this.pomelo = new Pomelo();
        this.addEventOnList();
    }

    init(connectionDetails, cb) {
        this.connectionDetails = connectionDetails;

        this.pomelo.init({
            host: connectionDetails.host,
            port: connectionDetails.port,
            scheme: connectionDetails.scheme || "ws",
            reconnect: connectionDetails.hasOwnProperty("reconnect") ? connectionDetails.reconnect : true,
        }, () => {
            //console.log("pomelo init");
            this._init = true;

            if (cb) {
                cb();
            }
        });
    }

    addEventOnList() {
        this.pomelo.on("connected", () => {
            //console.log("pomelo connected");
        });

        this.pomelo.on("reconnect", () => {
            console.log("pomelo reconnect");
        });

        this.pomelo.on("io-error", (error) => {
            console.log("pomelo io-error", error.message);
        });

        this.pomelo.on("disconnect", () => {
            console.log("pomelo disconnect");
        });

        this.pomelo.on("error", (error) => {
            console.log("pomelo error", error.message);
        });

        this.pomelo.on("close", () => {
            console.log("pomelo close");
        });

        // Feature: 对所有服务端推送消息的统一处理
        this.pomelo.on('__CLIENT_ROUTE', (route, data) => {
            console.log(route);
            console.log(data);
        });
    }

    request(route, msg, callback) {
        if (!this._init) {
            console.log("pomelo not init");
            return;
        }

        this.pomelo.request(route, msg, callback);
    }

    disconnect() {
        this.pomelo.disconnect();
    }
}

module.exports = {
    CreateNetClient: CreateNetClient
}