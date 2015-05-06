/**
 * @author herbertliu,littenli
 * @date 2014-06-10 version 0.2
 * @description 通过cookie上报，获取页面参数，然后进行cookie设置，页面cookie上报，依赖report,jquery
 * @example report.cookie.config(params,args) //获取上报的属性字符串
 *			params params {Object} 需要cookie上报字段集合，例如：
 *										{	
 *											'_BASE' : {}
 *											'from' : {
 *												'_BASE':{}
 *												'1' : {'uin':'','ts':'','opername':'','module':'','action':'','obj1':'','obj2':'','obj3':'','action':'','ver1':'','ver2':'','ver3':'','ver4':''}，这里ts表示时间戳，不传使用服务器时间戳，objs表示用户ip，也不需要传
 *											}
 *										}
 *			params args {Boolean}	是否自动上报	
 *
 * @example 
 */
 ;(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD loading: define module named "badjs" with dependencies and build it
        define(['report','jquery','common/util.cookie','common/report.cookie.init'],factory);
    } else {
        // traditional browser loading: build badjs object with dependencies and inject it into window object
        root['report'] = factory(root['report'],root['jQuery'],root['Cookie']);
    }
})(this, function(report,$,cookie) {
	
	var _cookie = report.cookie || (report.cookie = {});
	
	var _COOKIE_BASE = _cookie.__ || (_cookie.__ = '_cookie_tdw_');

	var PROTOCOL=document.location.protocol,
		DOMAIN = document.location.hostname,
		PATH = '',
		HOUER = 24;//默认24小时
		
	var _REFERER = document.referrer,
		_REFERER_PROTOCOL = new RegExp('^' + PROTOCOL + '\\/\\/','ig'),
		_REFERER_DEPTH = new RegExp('([^\\.\\/]+)(\\.[^\\.\\/]+)+','ig');
		
	//report cookie全局配置
	var _CONF = _cookie.CONF || (_cookie.CONF = {});
	if(!_CONF.DATA){
		_CONF.DATA = {//配置需要上报的数据字段,其中BASE都是基于当前上报的基础字段设置
			//'_BASE' : {}, //{'uin':'624005743'}
			//'from' :{'_BASE': {} , '1' : {}} //例子:{'_BASE': {'ts':'ts','opername':'test'} , '1' : {action: 'Teach-new'}}
			'_BASE': {
                action:"testFrom"
            },
            'from' : {
                "90":{
                    ver4: "test again"
                }
            }
		}
	}
	_CONF.ISREPORT = true;//是否自动上报

	//console.log(_CONF.DATA);
	
	//增加支持基础参数扩展
	function extend(param){
		if(!param) return;
		for(var i = 0 ,len = arguments.length ; i < len ; i ++){
			if(!i) continue;
			var _arguments = arguments[i];
			for(var j in _arguments){
				param[j] = _arguments[j]
			}
		}
		return param;
	}
	
	
	//设置cookie的值
	function setCookieParam(name, value, domain, path, hour){
		if(!name) return;
		domain = domain || 	DOMAIN;
		path = path || 	PATH;
		hour = hour || 	HOUER;		
		$.cookie.set(_COOKIE_BASE + name , value ,  domain, path, hour);
	}

	//获取参数或者hash中的固定参数值
    function getQueryParam(name){
        return $.bom.query(name) || $.bom.getHash(name);
    }
    
    //获取参数或者hash中的固定参数值
    function getCookieParam(name){
        return $.cookie.get(_COOKIE_BASE + name);
    }
	
	//删除cookie的值
	function delCookieParam(name, domain, path){
		if(!name) return;
		domain = domain || 	DOMAIN;
		path = path || 	PATH;
		$.cookie.del(_COOKIE_BASE + name ,  domain, path);
	}
	
	
	//检查cookie的referer是否存在
	function checkCookieReferer(){
		if(_REFERER.match(_REFERER_PROTOCOL)){//协议一致
			var _from_hostname = _REFERER.match(_REFERER_DEPTH);
			if(_from_hostname && (_from_hostname = _from_hostname[0])){
				return DOMAIN.match(new RegExp(_from_hostname,"ig")) || _from_hostname.match(new RegExp(DOMAIN,"ig"));//支持父级域名向子级跳转
			}else{
				return null;
			}
		}else{
			return null;
		};
		
	}
	
	//获取COOKIE上报的字段值集合
	function getCookieReportAttr(cb){
		for(var i in _CONF.DATA){
			if(i === '_BASE') continue;
			cb && cb( i , _CONF.DATA[i] );
		}
	}
	
	function _initialize(){
		//初始化信息
		getCookieReportAttr(function(index , items){
			var value = getQueryParam(index);
			var isFromParent = false;//说明referer来源是父域名并且数据来自cookie
			if(!value){
				value = getCookieParam(index);//从cookie中获取，存在cookie值
				if(value){
					var _checks;
					if(!(_checks = checkCookieReferer())){//来源检查，不合格，清除cookie
						delCookieParam(index);
						return true;
					}else{
						//验证通过
						if(_checks[0] !== DOMAIN){
							//说明referer来源是父域名
							isFromParent = true;
						}
					}
				}else{
					//说明是空值
					//return true;//不存在value
				}
			}
			var _data = items[value];
			if(!_data){
				//没有上报值
				delCookieParam(index);
				return true;
			}else if(isFromParent){
				delCookieParam(index);//删除当前域下同名cookie
			};

			var _param = extend({} ,_CONF.DATA._BASE,items['_BASE'], _data);

			_CONF.ISREPORT && report.tdw(_param);
			
			if(!isFromParent) setCookieParam(index,value);//当referer来源是父域名并且数据来自cookie，不需要重新设置本域cookie
			
		});
	}

	/**
	 * tdw设置cookie方式上报config属性值
	 *	params params {Object} 需要cookie上报字段集合，例如：
	 *										{	
	 *											'_BASE' : {}
	 *											'from' : {
	 *												'_BASE':{}
	 *												'1' : {'uin':'','ts':'','opername':'','module':'','action':'','obj1':'','obj2':'','obj3':'','action':'','ver1':'','ver2':'','ver3':'','ver4':''}，这里ts表示时间戳，不传使用服务器时间戳，objs表示用户ip，也不需要传
	 *											}
	 *										}
	 *	params args {Boolean}	是否自动上报					
	*/
	_cookie.config = function(params,args){
		if(params){
			for(var i in params){
				if(params[i] === 0){//当值恒等于0的时候删除改上报字段
					delete _CONF.DATA[i];
				}else{
					_CONF.DATA[i] = params[i];
				}
			}
		}
		_CONF.ISREPORT = !args;
	}
	
	_cookie.getConfig = _CONF;
	
	_initialize();
	
	
	return report;
});
