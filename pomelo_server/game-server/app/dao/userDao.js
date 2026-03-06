const db = require('../mod/db');

let exp = module.exports;

/**
 * 获取用户信息
 * @param {*} userId 
 * @returns 
 */
exp.getUser = async function (userId) {
    //wm 优化: 把参数都传到查询接口, 查询接口去拼接sql和返回结果. 将来换db的话只需改查询接口就可以了.
    let sql = `SELECT * FROM user WHERE id = ?`;
    let params = [userId];
    let ret = await db.find(sql, params);
    return ret[0];
}

exp.registerUser = async function (userData) {
    let sql = `INSERT INTO user ( name, password, info) VALUES ( ?, ?, ?)`;
    let params = [userData.name, userData.password, JSON.stringify(userData.info)];
    let ret = await db.insert(sql, params);
    return ret;
}

/**
 * 根据账号获取用户信息
 * @param {*} account 
 * @returns 
 */
exp.getUserByAccount = async function (account) {
    let sql = `SELECT * FROM user WHERE account = ?`;
    let params = [account];
    let ret = await db.find(sql, params);
    return ret[0];
}

