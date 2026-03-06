const DataBase = require('../data/dataBase');
let mysqldb = require('../common/mysql/mysqldb');
const mysqlQueryUtil = require('../util/mysqlQueryUtil');

let exp = module.exports;

exp.init = async function (config) {
    let ret = await mysqldb.init(config);

    if (!ret) {
        console.error(`[MySQL-${process.pid}] ❌ Init failed`);
        return false;
    }

    mysqldb.keepAlive();
    console.log(`[MySQL-${process.pid}] ✅ Init success`);
    return true;
}

exp.end = async function () {
    await mysqldb.end();
}

exp.find = async function (sql, params = []) {
    return await mysqldb.query(sql, params);
}

exp.insert = async function (sql, params = []) {
    return await mysqldb.query(sql, params);
}

/**
 * 
 * @param {DataBase} data 
 * @returns 
 */
exp.save = async function (data) {
    let dirtyKeys = Object.keys(data.dirtyKeys);

    if (dirtyKeys.length <= 0) {
        return;
    }

    let table = data.Table;
    let where = data.getWhere();
    let sql, args;

    if (data.isInsert) {
        data.isInsert = false;

    }
    else {
        ({ sql, args } = mysqlQueryUtil.formatUpdateQuery(table, data, where));
    }
    try {
        data.clearDirty(dirtyKeys);
        let result = await mysqldb.query(sql, args);
        
        if (result.affectedRows <= 0) {
            console.error(`[MySQL-${process.pid}] Save Error: affectedRows <= 0`, JSON.stringify(data));
            data.rollbackKeys(dirtyKeys);
        }
    } catch (err) {
        console.error(`[MySQL-${process.pid}] Save Error:`, err.code, err.message, JSON.stringify(data));
    }
}
