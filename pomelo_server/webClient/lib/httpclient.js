const axios = require('axios');

// 基本 GET 请求
async function getData(url, params = {}) {
    try {
        const response = await axios.get(url, {
            params: params
        });

        return response.data;
    } catch (error) {
        console.error('错误:', error.message);
        throw error;
    }
}

async function postData(url, params = {}, headers = {}) {
    try {
        const defaultHeaders = {
            'Content-Type': 'application/json'  // 默认的 content-type
        };

        const response = await axios.post(url, params, {
            headers: { ...defaultHeaders, ...headers }  // 合并默认和自定义 headers
        });

        return response.data;
    } catch (error) {
        console.error('错误:', error.message);
        throw error;
    }
}

module.exports = {
    GetAsync: getData,
    PostAsync: postData,
}