const NetClient = require('./lib/NetClient');
const NConfig = require('./config/NConfig');

class Player {
    constructor(aid) {
        this.aid = aid;
        this.netClient = NetClient.CreateNetClient();
        this.isNetConnected = false;
    }

    async sendMsg(route, msg) {
        if (!this.isNetConnected) {
            console.error("net disconnect");
            return;
        }

        return await new Promise((resolve, reject) => {
            console.debug("sendMsg", route, msg);
            this.netClient.request(route, msg, (data) => {
                resolve(data);
            });
        });
    }

    start() {
        console.log('Player start', this.aid);

        this.netClient.init({
            host: NConfig.host,
            port: NConfig.port,
        }, async () => {
            this.isNetConnected = true;
            console.log('netclient connect!');
            console.log('Player start success', this.aid);

            let result = await this.sendMsg('connector.entryHandler.login', { aid: this.aid });
            console.log('login result', result);
        });
    }
}

module.exports = Player;