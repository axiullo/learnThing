const httpClient = require('./lib/httpclient');
const HttpStatus = require('./config/HttpStatus');

var exp = module.exports

// 封装 HTTP 请求函数
exp.sendHttpRequest = async function (urlPath, params) {
    try {
        const result = await httpClient.PostAsync(urlPath, params);
        if (result) {
            if (result.code === HttpStatus.OK) {
                return result;
            } else {
                console.log(`${urlPath} 请求失败`, result);
                //throw new Error(`Request failed with code ${result.code}`);
            }
        } else {
            throw new Error('No response from server');
        }
    } catch (error) {
        console.error(`Error in ${urlPath}:`, error.message);
        // throw error;
    }
}