Report
================
 * @author herbertliu
 * @date 2014-02-25 version 0.2 last modified by herbertliu 2014-04-14
 * @description TDW数据上报
 * @example report.tdw(params[,args][,table]) //支持单条上报和多条上报
 *			params {Object} 上报字段集合，支持对象或者对象数组，例如：{'uin':'','ts':'','opername':'','module':'','action':'','obj1':'','obj2':'','obj3':'','action':'','ver1':'','ver2':'','ver3':'','ver4':''}，这里ts表示时间戳，不传使用服务器时间戳，objs表示用户ip，也不需要传
 *			args {Boolean} 可选，是否立即上报，默认false，不进行立即上报，可以调用report.toreport以及report不给后面参数来实现立即上报，以及设置10S内上报一次；当传true参数值的时候，表示立即上报
 *			table {String} 可选，上报数据表，默认群业务table=dc00141
 * @example report.config(params[,args][,table])//设置公共项目,参数同report.tdw
 * @example report.toreport() //立上报