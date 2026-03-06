const DataBase = require('../data/dataBase');  //为了注释, 添加引用
/**
 * 数据管理器
 */
class DataManager {
    constructor(app) {
        this.app = app;
        this.id2datas = {}; // 数据缓存  [id][dataname]
        this.dirtyIds = {}; // 脏数据缓存  [id][dataname]
        this.ts = 3000;
        
        this.tickInterval = setInterval(() => {
            this.tick();
        }, this.ts);
    }

    /**
     * 添加数据
     * @param {DataBase} data - 数据实例
     */
    addData(data) {
        let idDatas = this.id2datas[data.id];

        if (!idDatas) {
            idDatas = {};
            this.id2datas[data.id] = idDatas;
        }

        if (idDatas[data.DataName]) {
            logger.error(`${data.id} ${data.DataName}数据已存在`);
            return;
        }

        idDatas[data.DataName] = data;

        const dirtyListener = () => {
            this.dirtyData(data);
        };

        // 当数据发生改变时,触发dirty事件添加到脏数据缓存
        data.on('dirty', dirtyListener);
        data.__dirtyListener = dirtyListener;
    }

    deleteData(data) {
        let idDatas = this.id2datas[data.id];

        if (idDatas) {
            for (let dataName in idDatas) {
                let data = idDatas[dataName];
                data.off('dirty', data.__dirtyListener);
            }
        }
    }

    deleteAllDataById(id) {
        delete this.id2datas[id];
    }

    /**
     * 标记数据为脏数据
     * @param {*} data 
     */
    dirtyData(data) {
        let id = data.id;
        let idDatas = this.id2datas[id];

        if (!idDatas) {
            return;
        }

        let dirtyType = this.dirtyIds[id];

        if (!dirtyType) {
            dirtyType = {};
            this.dirtyIds[id] = dirtyType;
        }

        dirtyType[data.DataName] = 1;
    }

    /**
     * 获取数据
     * @param {string} typeName - 数据类型
     * @param {number} id - 数据id
     * @returns {DataBase}
     */
    getData(typeName, id) {
        let idDatas = this.id2datas[id];

        if (!idDatas) {
            return null;
        }

        return idDatas[typeName];
    }

    tick() {
        let dirtyIds = this.dirtyIds;
        this.dirtyIds = {};

        for (let id in dirtyIds) {
            let idDatas = this.id2datas[id];

            if (!idDatas) {
                continue;
            }

            let dirtyTypes = dirtyIds[id];

            for (let typeName in dirtyTypes) {
                let data = idDatas[typeName];

                if (data) {
                    this.processDirtyData(data);
                }
            }
        }
    }

    async processDirtyData(data) {
        let db = this.app.get('db');
        await db.save(data);
    }

    async directSave(data) {
        let result = await this.processDirtyData(data);
        return result;
    }

    stop() {
        if (this.tickInterval) {
            clearInterval(this.tickInterval);
            this.tickInterval = null;
        }

        //关服前,处理所有脏数据
        this.tick();

        console.log('dataManager stop success');
    }
}

module.exports = DataManager;