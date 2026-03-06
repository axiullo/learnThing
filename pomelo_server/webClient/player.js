const consts = require('./consts');
const httpClient = require('./lib/httpclient');
const HttpStatus = require('./config/HttpStatus');
const NetClient = require('./lib/NetClient');
const { ResCode } = require('./consts');
const utils = require("./utils");
const logger = require("./lib/logger");

class Player {
    aid = -1;
    id = -1;
    state = -1;
    channel = "";
    mainChannel = 1;
    subChannel = "";
    uuid = "testuuid";
    serverName = "";
    appVersion = "";
    imei = "";
    deviceId = "";
    adsId = "";
    upperUid = "";
    upperCode = "";
    helpUid = "";
    token = "";
    gateServerHost = "";

    startts = 0; //开始时间戳

    /**
     * 构造函数
     * @param {*} data 构造数据 {id, mainChannel}
     */
    constructor(data) {
        this.aid = data.aid;
        this.uuid += "_" + data.aid;

        if (data.mainChannel) {
            this.mainChannel = mainChannel;
        }

        this.channel = `${this.mainChannel}|${this.subChannel}`;
    }

    getParams() {
        return {
            uid: this.id,
            mainChannel: this.mainChannel,
            subChannel: this.subChannel,
            uuid: this.uuid,
            serverName: this.serverName,
            appVersion: this.appVersion,
            imei: this.imei,
            deviceId: this.deviceId,
            adsId: this.adsId,
            upperUid: this.upperUid,
            upperCode: this.upperCode,
            helpUid: this.helpUid,
        }
    }

    // 获取服务器配置
    async getServerConfig() {
        const urlPath = `${consts.LoginURL}login/getServerConfig`;
        const result = await httpClient.PostAsync(urlPath, this.getParams());

        if (result.code === HttpStatus.OK) {
            let serverHost = result.serverIpaddr;
            return serverHost;
        } else {
            console.log(`${urlPath} 请求失败`, result);
            throw new Error(`Request failed with code ${result.code}`);
        }
    }

    async touristLogin() {
        const urlPath = `${consts.LoginURL}login/touristLogin`;
        const result = await utils.sendHttpRequest(urlPath, this);
        this.token = result.token;
        this.id = result.uid;
        return this.token;
    }

    // 进入网关
    enterGate() {
        const gateConfig = {
            host: this.gateServerHost,
            port: 3014,
            log: true,
            scheme: 'ws',
        };

        const netClient = NetClient.CreateNetClient();
        netClient.reconnect = false;

        netClient.init({
            host: gateConfig.host,
            port: gateConfig.port,
            reconnect: false
        }, async () => {
            try {
                const uid = this.id;
                const channel = this.channel;
                const queryEntryData = await new Promise((resolve, reject) => {
                    netClient.request("gate.gateHandler.queryEntry", { uid, channel }, (data) => {
                        console.log("queryEntry 请求完成", data);
                        logger.info(`id=[${this.id}] queryEntry 请求完成 耗时:${Date.now() - this.startts} ms  结果:${data.code === ResCode.SUCCESS ? "成功" : "失败"}`);
                        if (data.code === ResCode.SUCCESS) {
                            resolve(data);
                        } else {
                            reject(new Error(`queryEntry failed with code ${data.code}`));
                        }
                    });
                });

                netClient.disconnect();
                netClient.reconnect = true;

                netClient.init({
                    host: queryEntryData.host,
                    port: queryEntryData.port,
                    reconnect: true
                }, async () => {
                    console.log("链接成功", this.id, this.uuid, queryEntryData.host, queryEntryData.port);
                    const entryData = await new Promise((resolve, reject) => {
                        netClient.request("connector.entryHandler.entry", { token: this.token }, (data) => {
                            //console.log("entry 请求完成", data);
                            console.log("entry 请求完成", this.id);
                            logger.info(`id=[${this.id}] connector.entryHandler.entry 请求完成 耗时:${Date.now() - this.startts} ms  结果:${data.code === ResCode.SUCCESS ? "成功" : "失败"}`);
                            resolve(data);
                        });
                    });

                    if (entryData.code === ResCode.SUCCESS) {
                        const enterHallData = await new Promise((resolve, reject) => {
                            netClient.request("hall.userHandler.enterHall", {}, (data) => {
                                console.log("enterHall 请求完成", this.id, data);
                                logger.info(`id=[${this.id}] hall.userHandler.enterHall 请求完成 耗时:${Date.now() - this.startts} ms  结果:${data.code === ResCode.SUCCESS ? "成功" : "失败"}`);
                                resolve(data);
                                console.timeEnd("操作耗时" + this.aid);
                            });
                        });
                    }
                    else {
                        logger.warn(`id=[${this.id}] connector.entryHandler.entry 请求失败 结果:${JSON.stringify(entryData)}`);
                    }
                });
            } catch (error) {
                console.error("Error in enterGate:", error.message);
            }
        });
    }

    async start() {
        console.time("操作耗时" + this.aid);
        this.startts = Date.now();
        this.doLogin();
    }

    async doLogin() {
        const gateServerHost = await this.getServerConfig();

        if (gateServerHost) {
            this.gateServerHost = gateServerHost;
            //console.log("配置获取完成");
        } else {
            console.error("没有服务器地址");
            return;
        }

        const loginToken = await this.touristLogin();

        logger.info(`id=[${this.id}] 登录完成 耗时:${Date.now() - this.startts} ms  结果:${loginToken ? "成功" : "失败"}`);

        if (loginToken) {
            console.log("登录完成", this.id);
            this.enterGate();
        } else {
            console.log("登录失败", this.id);
            return;
        }
    }
}

module.exports = Player