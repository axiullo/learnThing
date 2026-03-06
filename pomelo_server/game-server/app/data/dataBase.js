var EventEmitter = require('node:events');

class DataBase extends EventEmitter {
    constructor() {
        super();
        this.dirtyKeys = {};
        this.datatype = ''; //数据结构类型 id:一维结构 iid:二维结构
        this.__name = ''; //数据结构名称
        this.__table = ''; //数据库表名
        this.isInsert = false; //是否需要插入

        this.id = -Infinity; //主键
    }

    /**
     * 标记数据为脏，触发dirty事件
     * 如果数据改变,必须调用dirty方法.
     */
    dirty() {
        this.emit('dirty');
    }

    flush() {
        this.emit('flush');
    }

    clearDirty(keys) {
        if (keys) {
            keys.forEach(key => {
                delete this.dirtyKeys[key];
            });
        } else {
            this.dirtyKeys = {};
        }
    }

    rollbackKeys(keys) {
        keys.forEach(key => {
            this.dirtyKeys[key] = 1;
        });

        this.dirty();
    }

    getWhere() {
        return {
            id: this.id,
        };
    }

    setNumberValue(key, value) {
        if (!Number.isFinite(value)) {
            const error = new Error('setValue value is not a number');
            error.uid = this.id;
            error.key = key;
            error.value = value;
            error.emitted = true; // 添加标记

            // 触发事件
            process.emit('dataException', error);

            // 抛出错误
            throw error;
        }

        this[key] = value;
        this.dirtyKeys[key] = 1;
    }

    addNumberValue(key, value) {
        if (!Number.isFinite(value)) {
            const error = new Error('addNumberValue value is not a number');
            error.uid = this.id;
            error.key = key;
            error.value = value;
            error.emitted = true; // 添加标记

            // 触发事件
            process.emit('dataException', error);

            // 抛出错误
            throw error;
        }

        this[key] += value;
        this.dirtyKeys[key] = 1;
    }
}

// 定义不可配置的 DataName getter
Object.defineProperty(DataBase.prototype, 'DataName', {
    get: function () {
        return this.__name;
    },
    configurable: false, // 不可配置，防止被覆盖
    enumerable: true
});

Object.defineProperty(DataBase.prototype, 'Table', {
    get: function () {
        return this.__table;
    },
    configurable: false, // 不可配置，防止被覆盖
    enumerable: true
});

module.exports = DataBase;