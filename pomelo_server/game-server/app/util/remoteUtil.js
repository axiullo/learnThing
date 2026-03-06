const pomelo = require('pomelo');
const logger = require('pomelo-logger').getLogger("pomelo-rpc", __filename);
const util = require('util');
const dispatcher = require('./dispatcher');

let exp = module.exports;

exp.remoteRPCRequestById = function (id, params) {
    return new Promise((resolve, reject) => {
        pomelo.app.rpcInvoke(id, params, function (err, data) {
            if (!!err) {
                reject(err);
                return;
            }
            resolve(data);
        });
    }).catch(function (err) {
        logger.warn(util.inspect(err, { depth: null }));
    });
}

exp.makeRequestParams = function (service, method, args, namespace) {
    return {
        namespace: namespace || 'user',
        service: service,
        method: method,
        args: [args]
    }
}

exp.remoteRPCRequestByUid = async function (uid, params, serverType) {
    var servers = pomelo.app.getServersByType(serverType);
    var server = dispatcher.dispatch(uid, servers);
    var result = await exp.remoteRPCRequestById(server.id, params);
    return result;
}

exp.remoteRPCRequest = async function (params, serverType) {
    var servers = pomelo.app.getServersByType(serverType);
    var result = {};

    // 使用 Promise.all 并行请求所有服务器
    var promises = servers.map(server =>
        exp.remoteRPCRequestById(server.id, params)
            .then(data => {
                if (data)
                    result[server.id] = data;

                return { serverId: server.id, data };
            })
            .catch(err => {
                logger.warn(`请求服务器 ${server.id} 失败:`, err);
                return { serverId: server.id, error: err };
            })
    );

    await Promise.all(promises);
    return result;
}