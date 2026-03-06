var exp = module.exports;
var moment = require('moment');


exp.getFirstTimeOfToday = function() {
    var startTime = new Date(new Date().toLocaleDateString()).getTime();
    return startTime;
}

exp.getFirstTimeOfYestday = function() {
    var date = new Date;
    date.setDate(date.getDate() - 1);
    var startTime = this.getFirstTimeOfDate(date);
    return startTime;
}

exp.getFirstTimeOfTomorrow = function() {
    var date = new Date;
    date.setDate(date.getDate() + 1);
    var startTime = this.getFirstTimeOfDate(date);
    return startTime;
}

exp.getFirstTimeOfDate = function(date) {
    var date = new Date(date);
    var startTime = new Date(date.toLocaleDateString()).getTime();
    return startTime;
}

//获取今天零点时间
exp.getTodayZeroTime = function (){
    let startTime = moment(new Date()).startOf("day").valueOf();
    return startTime;
}

let DAY_MS = 24 * 60 * 60 * 1000;
exp.getIntervalDay = function (time1, time2){
    return Math.abs((Math.floor(time1/DAY_MS) - Math.floor(time2/DAY_MS)));
};

exp.getTimeDay = function (time) {
    if(time !== 0){
        time = time || Date.now();
    }
    return Math.floor((time + 8 * 60 * 60 * 1000)/DAY_MS);
};

//获取本周一零点时间
exp.getThisWeekZeroTime = function (){
    let week = moment().day();
    let startTime;
    //每周周日是开始时间  所以获取今天是否是周日  是则取上周一 不是则取本周一
    if (week == 0){
        startTime = moment().day(-6).startOf("day").valueOf();
    }else{
        startTime = moment().day(1).startOf("day").valueOf();
    }
    return startTime;
}

//获取下周一零点时间
exp.getNextWeekZeroTime = function (){
    let week = moment().day();
    let startTime;
    //每周周日是开始时间  所以获取今天是否是周日  是则取本周一 不是则取下周一
    if (week == 0){
        startTime = moment().day(1).startOf("day").valueOf();
    }else{
        startTime = moment().day(8).startOf("day").valueOf();
    }
    return startTime;
}

exp.formatTodayTime = function (){
    let now = new Date();
    return this.formatTime(now, "YYYYMMDD");
}

exp.formatYestodayTime = function (){
    let now = new Date();
    let yestday = moment(now).subtract(1, 'days');
    return this.formatTime(yestday, "YYYYMMDD");
}

exp.formatTime = function (date, strFormat = "YYYYMMDDHHmmss"){
    let format = moment(date).format(strFormat);
    return format;
}

//获取n天之后的结束时间
exp.getNextNDayEndTime = function (day){
    let startTime = moment(new Date()).add(day, "day").endOf("day").valueOf();
    return startTime;
}

//获取两个时间跨越天数
exp.diff = function (start,end){
    var a = moment(start);
    var b = moment(end);
    let day = b.diff(a, 'days');
    return day;
}

//获取本周开始开始时间
exp.formatThisWeek = function (){
    let now = new Date();
    //当前日期是否是在周一前  是则取上周一时间 不是则取本周一时间
    let isThisWeek = moment(now).isBefore(moment(now).day(1),"day");
    if (isThisWeek){
        return moment(now).day(-6).format("YYYYMMDD");
    }else{
        return moment(now).day(1).format("YYYYMMDD");
    }
}

//获取下个周一零点的时间
exp.getNextMonday = function (){
    let now = new Date();
    //当前日期是否是在周一前  是则取本周一时间 不是则取下周一时间
    let isThisWeek = moment(now).isBefore(moment(now).day(1),"day");
    if (isThisWeek){
        return moment(now).day(1).startOf("day").valueOf();
    }else{
        return moment(now).day(8).startOf("day").valueOf();
    }
}

//获取上周排行榜的开始时间
exp.formatLastWeek = function (){
    let now = new Date();
    //当前日期是否是在周一前  是则取上上周一时间 不是则取上周一时间
    let isThisWeek = moment(now).isBefore(moment(now).day(1),"day");
    if (isThisWeek){
        return moment(now).day(-13).format("YYYYMMDD");
    }else{
        return moment(now).day(-6).format("YYYYMMDD");
    }
}

//获取本月开始开始时间
exp.formatThisMonth = function (){
    return moment().startOf('month').format('YYYYMMDD');
}

//获取本月开始开始时间
exp.getThisMonthStart = function (){
    return moment().startOf('month').valueOf();
}

//获取本年开始开始时间
exp.formatThisYear = function (){
    return moment().startOf('year').format('YYYYMMDD');
}

// 获取下个月开始时间
exp.getNextMonthStart = function () {
    // 方法1：当前时间加1个月，然后设置为当月第一天
    return moment().add(1, 'months').startOf('month').valueOf();
}

exp.formatChickenroadTimestamp = function (timestamp) {
    const now = moment();
    const inputTime = moment(timestamp);

    // 检查时间差是否在 24 小时内
    if (now.diff(inputTime, 'hours') < 24) {
        // 24小时内，格式化为 "HH:mm:ss"
        return inputTime.format('HH:mm');
    } else {
        // 超过24小时，格式化为 "YYYY-MM-DD HH:mm:ss"
        return inputTime.format('DD-MM-YY');
    }
}

function formatTimestampByPST(timestamp) {
    // 创建一个Date对象
    const date = new Date(timestamp);

    // 获取西八区时间 (PST/PDT)
    const pstOptions = {
        timeZone: 'America/Los_Angeles',
        hour: 'numeric',
        minute: 'numeric',
        hour12: false
    };

    // 获取西八区的小时和分钟
    const pstTimeStr = date.toLocaleTimeString('en-US', pstOptions);
    const [pstHours, pstMinutes] = pstTimeStr.split(':').map(Number);

    // 检查是否是0点之前 (00:00:00 - 00:59:59)
    if (pstHours === 0) {
        // 返回年月日格式 (YYYY-MM-DD)
        const dateOptions = {
            timeZone: 'America/Los_Angeles',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        };
        return date.toLocaleDateString('en-US', dateOptions)
            .replace(/(\d+)\/(\d+)\/(\d+)/, '$3-$1-$2');
    } else {
        // 返回时分格式 (HH:mm)
        return `${pstHours.toString().padStart(2, '0')}:${pstMinutes.toString().padStart(2, '0')}`;
    }
}
