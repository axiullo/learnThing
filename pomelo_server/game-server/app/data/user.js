/**
 * Module dependencies.
 */
const DataBase = require('./dataBase');
const Validator = require('../util/validator');

class User extends DataBase {
    /**
     * 从数据库创建用户实例（带类型检查）
     * @param {Object} data - 数据库返回的用户数据
     */
    constructor(data = {}) {
        super();
        this.datatype = 'id';
        this.__name = 'user';
        this.__table = 'user';

        /**
         * @type {number}
         */
        this.id = Validator.validateInt(data.id, 0);
        /**
         * @type {number}
         */
        this.number = Validator.validateNumber(data.number, 0);
        /**
         * @type {string}
         */
        this.name = Validator.validateString(data.name, '');
        /**
         * @type {string}
         */
        this.password = Validator.validateString(data.password, '');
        /**
         * @type {Object}
         */
        this.info = Validator.validateObject(data.info, {});

        /**
         * @type {int}
         */
        this.loginCount = Validator.validateInt(data.loginCount, 0);
    }

    /**
     * 获取用户基础信息（不含敏感数据）
     * @returns {Object} 用户基础信息
     */
    getBasicInfo() {
        return {
            id: this.id,
            number: this.number,
            username: this.username,
            info: this.info,
        };
    }
}

module.exports = User;