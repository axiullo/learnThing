const logger = require('pomelo-logger').getLogger('pomelo', __filename);

let exp = module.exports;

/**
 * 服务器初始化
 * @param {*} app 
 * @returns 
 */
exp.serverInit = async function (app) {
    let db = app.get('db');

    if (db) {
        const dbconfig = require('../../../shared/dbconfig/mysqlConfig');
        let ret = await db.init(dbconfig);

        if (!ret) {
            logger.error(`[MySQL-${process.pid}] ❌ Init failed`);
            return false;
        }
    }

    return true
}

exp.serverShutdown = async function (app) {
    logger.info('serverShutdown, serverId: %s', app.get('serverId'));
    let db = app.get('db');

    if (db) {
        await db.end();
    }
}
