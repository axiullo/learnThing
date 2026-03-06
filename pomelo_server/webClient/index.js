const httpClient = require('./lib/httpclient');
const HttpStatus = require('./config/HttpStatus');
const NetClient = require('./lib/NetClient');
const { ResCode } = require('./consts');

// 基础 URL
// const baseURL = "http://192.168.1.96:3001/";
const LOGIN_URL = "http://111.119.253.225:3001/";

// 客户端参数
const clientParams = {
    uid: 0,
    mainChannel: 1,
    subChannel: "",
    uuid: "testuuid",
    serverName: "",
    appVersion: "",
    imei: "",
    deviceId: "",
    adsId: "",
    upperUid: "",
    upperCode: "",
    helpUid: ""
};

// 合并主渠道和子渠道
clientParams.channel = `${clientParams.mainChannel}|${clientParams.subChannel}`;

// 服务器地址
let serverHost = "";
// 登录令牌
let token = "";

// 封装 HTTP 请求函数
async function sendHttpRequest(urlPath, params) {
    try {
        const result = await httpClient.PostAsync(urlPath, params);
        if (result) {
            if (result.code === HttpStatus.OK) {
                return result;
            } else {
                console.log(`${urlPath} 请求失败`, result);
                throw new Error(`Request failed with code ${result.code}`);
            }
        } else {
            throw new Error('No response from server');
        }
    } catch (error) {
        console.error(`Error in ${urlPath}:`, error.message);
        throw error;
    }
}

// 获取服务器配置
async function getServerConfig() {
    const urlPath = `${LOGIN_URL}login/getServerConfig`;
    const result = await sendHttpRequest(urlPath, clientParams);
    serverHost = result.serverIpaddr;
    return serverHost;
}

// 游客登录
async function touristLogin() {
    const urlPath = `${LOGIN_URL}login/touristLogin`;
    const result = await sendHttpRequest(urlPath, clientParams);
    token = result.token;
    clientParams.uid = result.uid;
    return token;
}

// 进入网关
function enterGate() {
    const gateConfig = {
        host: serverHost,
        port: 3014,
        log: true,
        scheme: 'ws',
    };

    console.log("gateConfig", gateConfig);
    const netClient = NetClient.CreateNetClient();
    netClient.reconnect = false;

    netClient.init({
        host: gateConfig.host,
        port: gateConfig.port,
        reconnect: false
    }, async () => {
        try {
            const { uid, channel } = clientParams;
            const queryEntryData = await new Promise((resolve, reject) => {
                netClient.request("gate.gateHandler.queryEntry", { uid, channel }, (data) => {
                    console.log("queryEntry 请求完成", data);
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
                console.log("链接成功", queryEntryData.host, queryEntryData.port);
                const entryData = await new Promise((resolve, reject) => {
                    netClient.request("connector.entryHandler.entry", { token }, (data) => {
                        // console.log("entry 请求完成", data);
                        resolve(data);
                    });
                });

                const enterHallData = await new Promise((resolve, reject) => {
                    netClient.request("hall.userHandler.enterHall", {}, (data) => {
                        // console.log("enterHall 请求完成", data);
                        resolve(data);
                        console.timeEnd("操作耗时", this.id);

                    });
                });
            });
        } catch (error) {
            console.error("Error in enterGate:", error.message);
        }
    });
}

// 主函数
async function main() {
    try {
        console.time("操作耗时");
        const serverConfig = await getServerConfig();
        if (serverConfig) {
            console.log("配置获取完成");
        } else {
            console.error("没有服务器地址");
            return;
        }

        const loginToken = await touristLogin();
        if (loginToken) {
            console.log("登录完成");
            enterGate();
        } else {
            console.log("登录失败");
            return;
        }
    } catch (error) {
        console.error("操作失败:", error.message);
    }
}

main();

// 全局未捕获异常处理
process.on('uncaughtException', (err) => {
    console.error(`Caught exception: stack=${err.stack}`);
});