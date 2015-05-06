Simple
================
 * @author herbertliu
 * @date 2013-02-25 version 0.2
 * @description badjs上报
 * @param msg {String} 上报错误信息
 * @param url {String} 该上报信息所属的文件路径
 * @param line {Number} 上报信息所属的文件行号，没有为0
 * @param smid {Number} 上报对应的monitor id,如果smid ===0 ,则只统计badjs,不上报monitor;如果没有该参数，则上报通用monitor id;如果smid === -1，window.onerror专用，会增加Script Error字段头
 * @param level {Number} 上报对应的级别 1 => debug（调试日志）; 2 = > info（流水日志）; 4 => error（错误日志）（默认值） ; 8 => fail（致命错误日志）
 * @example Badjs.init(bid,mid,min) 初始化badjs一些参数,mid,默认的业务上报Monitor id,min 是否上报浏览器简化信息;或者Badjs.init(bid,{'1' : 0,'2' : 0,'4' : 0, '8' : 0},min)
 * @example Badjs.check(o,mid)  检查页面是否存在某些文件辅助方法
 * @example Badjs.info(type)  获取badjs上报的头信息字符串，其中type为类型，不同的类型上报采用不同的字符串
 * @example Badjs(msg,url,line,smid,level,min)  badjs上报，上报字符串，地址，行号，Monitor属性id(可为空，即不报Monitor)，上报级别;min,是否上报简略信息
 * @example Badjs.report(retry,total,src,name,loaded)  文件加载失败时候，辅助上报方法