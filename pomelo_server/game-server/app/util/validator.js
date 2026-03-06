/**
 * 数据验证工具模块
 */

class Validator {
    /**
     * 检查是否处于开发环境
     * @returns {boolean}
     */
    static isDevEnv() {
        return process.env.NODE_ENV === 'development';
    }

    /**
     * 输出类型错误警告
     * @param {string} valueName - 值的名称
     * @param {string} expectedType - 期望的类型
     * @param {*} actualValue - 实际值
     */
    static warnTypeError(valueName, expectedType, actualValue) {
        if (this.isDevEnv()) {
            console.warn(`[Validator] 类型错误: ${valueName} 期望 ${expectedType} 类型，实际得到 ${typeof actualValue} 类型`, actualValue);
        }
    }

    /**
     * 验证数字类型
     * @param {*} value - 待验证值
     * @param {number} defaultValue - 默认值
     * @returns {number}
     */
    static validateNumber(value, defaultValue = 0) {
        if (!Number.isInteger(value)) {
            this.warnTypeError('value', '非Number', value);
            return defaultValue;
        }
        return value;
    }

    /**
     * 验证整数类型
     * @param {*} value - 待验证值
     * @param {number} defaultValue - 默认值
     * @returns {number}
     */
    static validateInt(value, defaultValue = 0) {
        if (!Number.isInteger(value)) {
            this.warnTypeError('value', '非整数', value);
            return defaultValue;
        }
        return value;
    }

    /**
     * 验证字符串类型
     * @param {*} value - 待验证值
     * @param {string} defaultValue - 默认值
     * @returns {string}
     */
    static validateString(value, defaultValue = '') {
        if (typeof value !== 'string') {
            this.warnTypeError('value', '字符串', value);
            return defaultValue;
        }
        return value;
    }

    /**
     * 验证状态值
     * @param {*} value - 待验证值
     * @param {number} defaultValue - 默认值
     * @returns {number}
     */
    static validateStatus(value, defaultValue = 1) {
        if (!Number.isInteger(value) || (value !== 0 && value !== 1)) {
            this.warnTypeError('value', '状态值 (0或1)', value);
            return defaultValue;
        }
        return value;
    }

    /**
     * 验证布尔类型
     * @param {*} value - 待验证值
     * @param {boolean} defaultValue - 默认值
     * @returns {boolean}
     */
    static validateBoolean(value, defaultValue = false) {
        if (typeof value !== 'boolean') {
            this.warnTypeError('value', '布尔值', value);
            return defaultValue;
        }
        return value;
    }

    /**
     * 验证数组类型
     * @param {*} value - 待验证值
     * @param {Array} defaultValue - 默认值
     * @returns {Array}
     */
    static validateArray(value, defaultValue = []) {
        if (!Array.isArray(value)) {
            this.warnTypeError('value', '数组', value);
            return defaultValue;
        }
        return value;
    }

    /**
     * 验证对象类型
     * @param {*} value - 待验证值
     * @param {Object} defaultValue - 默认值
     * @returns {Object}
     */
    static validateObject(value, defaultValue = {}) {
        if (value === null || typeof value !== 'object' || Array.isArray(value)) {
            this.warnTypeError('value', '对象', value);
            return defaultValue;
        }
        return value;
    }
}

module.exports = Validator;