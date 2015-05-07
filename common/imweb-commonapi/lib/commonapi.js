/**
* Author:herbertliu<br/>
* Date:2013-05-06 last modified on 20131219<br/>
* Description:public interface commonapi
* Version:0.3
*
* @class CommonApi
* @constructor
*/
;(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD loading: define module named "badjs" with dependencies and build it
        define(['simple'], factory);
    } else {
        // traditional browser loading: build badjs object with dependencies and inject it into window object
        root.commonapi = root.Commonapi = factory(root.$);
    }
})(this,function(){
	'use strict'
	var global = this || window;
	var version= '0.3.3';//version
	CommonApi.version=version;
	/**
	* @private
	* @description parse client value 
	*/
	function parseJSON(data) {
		if (typeof data !== 'string') {
			return false;
		}
		try {
			// replace the invalid character \u0000-\u0021 with space
			// as window.JSON.parse may throw an error 
			data = (JSON && JSON.parse || function(_data){
				return eval('(' + _data + ')');
			})(data.replace(/[\u0000-\u001f]/g, ' '));
		} catch (e) {
			return false;
		}
		return data;
	}
	
	//current url
	var _LOCALURL = encodeURIComponent(window.location.href);
	//info
	var _INFO = '|_|browser:[agent:'+  navigator.userAgent +',plat:'+  navigator.platform +',appcode:'+  navigator.appCodeName +',appname:'+  navigator.appName +',appversion:'+  navigator.appVersion +']';
	/**
	* @private
	* @description monitor && badjs
	*/
	function report(msg,mid,level){
		//report,176 commonapi log
		var img = new Image();
		img.src = 'http://badjs.qq.com/cgi-bin/js_report?level='+ (level || 4) +'&bid=176' + (mid?'&mid='+mid:'') + '&msg='+ encodeURIComponent(msg) +'|_|'+ _LOCALURL +'|_|0'  + _INFO +'&r='+ Math.random();
		img = null;	
	}
	//monitor report config
	var config = {
		/////////////////////////////新增commonapi QQ1.90 herbertliu/dennyfeng////////////////////////
		'Default.DataReport':{id:330981,e:331028},
		'Default.GetPerfTimeStamp':{id:330982,e:331029},
		'Window.Show':{id:330983,e:331030},
		'Window.Hide':{id:330984,e:331031},
		'Window.Close':{id:330985,e:331032},
		'Window.Maximize':{id:330986,e:331033},
		'Window.Minimize':{id:330987,e:331034},
		'Window.Restore':{id:330988,e:331035},
		'Window.Resize':{id:330989,e:331036},
		'Window.Move':{id:330990,e:331037},
		'Window.SetTitle':{id:330991,e:331038},
		'Window.ReloadPage':{id:330992,e:331039},
		'Window.PopNewWebPage':{id:330993,e:331040},
		'Window.Alert':{id:330994,e:331041},
		'Window.Confirm':{id:330995,e:331042},
		'Contact.GetSelfUin':{id:330996,e:331043,c:{'uin':'string'}},
		'Contact.GetNickName':{id:330997,e:331044,c:{'nickName':'string'}},
		'Contact.IsOnline':{id:330998,e:331045},
		'Contact.SetRemark':{id:330999,e:331046},
		'Contact.OpenContactInfoCard':{id:331000,e:331047},
		'Contact.AddFriend':{id:331001,e:331048},
		'Contact.OpenChatSession':{id:331002,e:331049},
		'IM.GetVersion':{id:331003,e:331050,c:{'version':'string'}},
		'IM.GetClientKey':{id:331004,e:331051,c:{'clientKey':'string'}},
		'IM.GetSKey':{id:331005,e:331052,c:{'sKey':'string'}},
		'Group.OpenGroupInfoCard':{id:331006,e:331053},
		'Group.JoinGroup':{id:331007,e:331054},
		'Misc.DownloadFile':{id:331008,e:331055},
		'Misc.OpenWebPic':{id:331009,e:331056},
		'Misc.ClipScreen':{id:331010,e:331057},
		/////////////////////////////新增commonapi QQ1.98 herbertliu/carolsuo////////////////////////
		'IM.GetSuperKey':{id:369348,e:369349,c:{'superKey':'string'}},
		'IM.GetDomainPSkey':{id:369350,e:369351,c:{'pKey':'string'}},
		/////////////////////////////新增commonapi QQ2.0 herbertliu/luckyhu////////////////////////
		'Contact.AddCrmFriend':{id:369352,e:369353},
		'Contact.StartChat':{id:369354,e:369355},
		'Contact.StartCrmChat':{id:369356,e:369357},
		'Contact.OpenCrmInfoCard':{id:369358,e:369359},
		'Group.JoinPublicGroup':{id:369360,e:369361},
		'Misc.OpenImpeach':{id:369362,e:369363},
		'Misc.OpenVideo':{id:369364,e:369365},
		'Misc.LocateApp':{id:369366,e:369367},
		'Misc.OpenImageViewer':{id:369368,e:369369}
	}
	/*
	* @private
	* @description report Monitor
	* @param {Number} MID report id.
	* @param {Number} [count] count of report,default is 1
	*/
	var reportM = (function(){
		//TODO: cache 1000ms
		var timer;
		var cacheMIDs = [];
		return function(MID,count){
			cacheMIDs.push('0-0-' + MID + (typeof count=='number'?('_' + count):''));
			window.clearTimeout(timer);
			timer = window.setTimeout(function(){
				var img = new Image();
				img.onload = img.onerror = function(){
					this.onload = this.onerror = null;
					img = null;
				};
				img.src = 'http://jsreport.qq.com/cgi-bin/report?id=176&rs='+ cacheMIDs.join('|_|') +'&r=' + Math.random();
				cacheMIDs = [];
			},1000);
		}
	})();
	/*
	* @private
	* @description parse client skey/supperskey/pSkey
	*/
	function parseSkey(json,name){
		name = name || 'sKey';
		var skey = json && json[name];//获取skey 以及 superskey/pskey
		if(!skey) return json;
		var out = [];
		for(var i =0,len = skey.length;i<len;i= i+2){
			out.push(String.fromCharCode('0x' + skey.slice(i,i + 2)));
		}
		json.skey = out.join('');
		return json;
	}
	
	var EMPTY_ARRAY = [];
	// defines what can go unimpededly when QQ is offline
	var _OFFLINE_REGEXP = /(Contact\.IsOnline)|(Window\.)/;
	var _CALL_MORETIMES_REGEXP = /Window\.Move/;

	// support multi callback
	var offline, stateChangeList = [], canCloseWindowList = [], receiveS2CMsgList = [];
	// support only one callback 
	var openWebPicCallback, clipScreenCallback,OFFLINE_TIPS,_OnClientCall;//offline tips
	/*
	* @private
	* @description _isOffline
	*/
	function _isOffline() {
		if (offline) {//if offline is true, it will excute every time
			offline = !(callHummerApi('Contact.IsOnline').online);
		}	
		return offline;
	}
	/*
	* @private
	* @description isOffline
	*/
	function isOffline() {
		if (_isOffline()) {//tips callback with setted
			// override with self logic
			typeof(OFFLINE_TIPS = CommonApi.OFFLINE_TIPS) == 'function' && OFFLINE_TIPS();
		}
		return offline;
	}

	/*
	* @private
	* @description OnClientCall
	*/
	function OnClientCall(param) {
		// typeof client package == string
		param = parseJSON(param);
		// currently OnClientCall events supports two type -- event and callback
		// and event supports only the following four type   
		if (param.type == "event") {
			switch (param.cmd) {
				case 'OnQQOnlineEvt' :
					QQStateChange(true);
					break;
				case 'OnQQOfflineEvt' :
					QQStateChange(false);
					break;
				// message from server to client
				case 'OnReceiveS2CMsg' :
					ReceiveS2CMsg(param.param);
					break;
				// close window before asking web whether it can be closed
				// you can block it when the window is urgently needed
				case 'CanCloseWindow' :
					CanCloseWindow();
				default :
					break;
			}
		} else if (param.type == "callback") {
			switch (param.cmd) {
				case 'OnOpenWebPicEvt' :
					openWebPicCallback && openWebPicCallback(param.param);
					break;
				case 'onClipScreenEvt' :
					clipScreenCallback && clipScreenCallback(param.param);
				default :
					break;
			}
		}
	};
	extend(window, {'OnClientCall':OnClientCall}, true);//extend window function OnClientCall
	/*
	* @private
	* @description QQStateChange
	*/
	function QQStateChange (online) {
		offline = !online;
		for (var i = 0, len = stateChangeList.length; i < len; i++) {
			stateChangeList[i](online);
		}
	}
	/*
	* @private
	* @description CanCloseWindow
	*/
	function CanCloseWindow () {
		var flag = true;
		for (var i = 0, len = canCloseWindowList.length; i < len; i++) {
			flag = canCloseWindowList[i]();
			if (!flag) {
				return false;
			}
		}
		return true;
	}
	/*
	* @private
	* @description ReceiveS2CMsg
	*/
	function ReceiveS2CMsg (msg) {
		for (var i = 0, len = receiveS2CMsgList.length; i < len; i++) {
			receiveS2CMsgList[i](msg);
		}
	}
	
	var _CATCH_TIMES = {//left time
		'Window.Move':{t:200}
	};
	/*
	* @private
	* @description execute client interface
	*/
	function callHummerApi(command, args) {
		// offline control
		if ((!command.match(_OFFLINE_REGEXP) && isOffline())) {
			return false;
		}
		var _config = config[command] || null,_rflag = true,_times;
		if(_times = _CATCH_TIMES[command]){
			if(_times['t']){
				if(_times['l'] <= 0 || !_times['l']){
					_times['b'] = +new Date() + _times['t'];//ms	
				}else{		
					_rflag = false;
				}
				_times['l'] = _times['b'] - new Date();
			}
		}
		_rflag && _config  && reportM(331058);//total with Monitor
		var fun = window.external && window.external.CallHummerApi;
		if (fun) {
			// client may throw an unknown error, so try catch
			try {
				// two situations : has arguments or not
				var _data = fun.apply(this,arguments);
			} catch (e) {
				_rflag && report('Incorrect Call by '+ command +'('+ args +') with Exception ' + e.message,331059);//function call with exception 
				return false;
			}
			CommonApi.ISREPORT && _config  && reportM(_config['id']);//current total with Monitor
			var data = parseJSON(_data);
			if(CommonApi.ISREPORT && _config && _config['e']){
				var _check;
				if(typeof(data) != 'object' || data['errorCode']){
					_rflag && report('Incorrect Data And ErrorCode by '+ command +'('+ args +') with ' + _data,_config['e']);//error code 
				}else if(_check = _config['c']){
					for(var i in _check){
						if(!(i in data) || data[i] === '' || data[i] === null){
							_rflag && report('Incorrect Data by '+ command +'('+ args +') Property '+ i +' with ' + _data,_config['e']);//error return 
							break;
						}
					}
				}
			}
			return data;
		}
		_rflag && report('Incorrect Call by '+ command +' without Function CallHummerApi',331059);//error
		return false;
	}
	/*
	* @private
	* @description extend
	*/
	function extend(scope,args,ex){
		if(typeof(scope) != 'object') return scope;
		args = args || {};
		for(var i in args){
			var _fun,cb;
			if(ex && typeof(_fun = scope[i]) === 'function' && typeof(cb = args[i]) === 'function'){
				scope[i] = function(){
					if(!cb.apply(scope,arguments)){//if the return is true,the current OnClientCall will not excute
						_fun.apply(scope,arguments);//excute OnClientCall
					}
				}
			}else{
				scope[i] = args[i];	//add window global callback function
			}
		}
	}
	//add CommonApi
	extend(CommonApi,{
		/********************************** Default *********************************/
		/**
		* 功能：调用客户端，做大T数据上报
		*
		* @method dataReport
		* @param {Json}TValue JSon格式的字符串，其中的字段有bigt：string类型，大T值
		
		* @return {String}  json格式
		*/
		dataReport : function (TValue) {
			return callHummerApi('Default.DataReport', '{ "bigt" : "' + TValue + '" }');
		},
		/**
		* 功能: 获取进程外WebKit性能相关的时间点
		*
		* @method getPerfTimeStamp
		* @param null
		* @return {String} json格式,包括以下字段<br/>（1）errorCode: int ; <br/>（2）StartVisitTS: string，开始访问内嵌页面的时间点<br/>（3）ExternalReadyTS: string，External子进程启动完成的时间点<br/>（4）StartNavigateTS: string，开始加载页面时的时间点<br/>（5）NavigateCompleteTS: string，页面加载完成时的时间点（如果加载出错则是出错的时间点）
		*/
		getPerfTimeStamp : function () {
			return callHummerApi('Default.GetPerfTimeStamp');
		},
		/********************************** Default *********************************/

		/********************************** Window *********************************/
		
		/**
		* 功能：显示网页所在窗口
		* @method show
		* @param null
		* @return {String} json格式
		*/
		show : function () {
			return callHummerApi('Window.Show');
		},
		/**
		*隐藏网页所在窗口
		* @method hide
		* @return {String} json格式
		*/
		hide : function () {
			return callHummerApi('Window.Hide');
		},
		/**
		* 功能：关闭网页所在窗口
		* @method close
		* @return {String} json格式
		*/
		close : function () {
			return callHummerApi('Window.Close');
		},
		/**
		* 功能：最大化网页所在窗口
		* @method maximize
		* @return {String} json格式
		*/
		maximize : function () {
			return callHummerApi('Window.Maximize');
		},
		/**
		*功能：最小化网页所在窗口
		* @method minimize
		* @return {String} json格式
		*/
		minimize : function () {
			return callHummerApi('Window.Minimize');
		},
		/**
		*功能：还原网页所在窗口
		* @method restore
		* @return {String} json格式
		*/
		restore : function () {
			return callHummerApi('Window.Restore');
		},
		/**
		*功能：调整网页所在窗口的宽度和高度
		* @method resize
		* @param {Number} width int类型，宽度
		* @param {Number} height int类型，高度
		* @return {String} json格式
		*/
		resize:function (width, height) {
			return callHummerApi('Window.Resize', '{ "width" : ' + width + ', "height" : ' + height + ' }');
		},
		/**
		* 功能：移动网页所在窗口
		* @method move
		* @param {Number} offsetX int类型，水平移动量
		* @param {Number} offsetY int类型，垂直移动量
		* @return {String} json格式
		*/
		move : function (offsetX, offsetY) {
			return callHummerApi('Window.Move', '{ "offsetX" : ' + offsetX + ', "offsetY" : ' + offsetY + ' }');
		},
		/**
		*description 功能： 设置网页所在窗口的Title
		* @method setTitle
		* @param {String} title JSon格式的字符串，其中的字段有title：string类型
		* @return {String} json格式
		*/
		setTitle : function (title) {
			return callHummerApi('Window.SetTitle', '{ "title" : "' + title + '" }');
		},
		/**
		* 功能 ：重新加载当前页面
		* @method reloadPage
		* @return {String} json格式
		*/
		reloadPage : function () {
			return callHummerApi('Window.ReloadPage');
		},
		/**
		*功能：打开一个新的窗口，加载一个新页面
		* @method popNewWebPage
		* @param {Number} width 窗口宽度
		* @param {Number} height 窗口高度
		* @param {String} title 窗口标题
		* @param {String} url 新页面的url               
		* @return {String} json格式
		*/
		popNewWebPage : function (width, height, url, title) {
			return callHummerApi('Window.PopNewWebPage', '{ "width" : ' + width + ', "height" : ' + height + ', "title" : "' + title + '", "url" : "' + url + '" }');
		},
		/**
		*  功能：弹出一个警告框(只有一个"确定"按钮)
		* @method alert
		* @param {String}nIconType 取值有:1 MB_OK|MB_ICONINFORMATION;<br/>2 MB_OK|MB_ICONWARNING; <br/>3 MB_OK|MB_ICONERROR; <br/>其它MB_OK|MB_ICONINFORMATION
		* @param {String} title 警告栏标题
		* @param {String} msg  警告栏内容
		* @return {String} json格式
		*/
		alert : function (iconType, title, msg) {
			return callHummerApi('Window.Alert', '{ "iconType" : ' + iconType + ', "title" : "' + title + '", "text" : "' + msg + '" }');
		},
		/**
		*功能：弹出一个确认框(包含"确定"和"取消"两个按钮)
		* @method confirm
		* @param {String} nIconType 取值有1 MB_OKCANCEL||MB_ICONINFORMATION;<br/>2 MB_OKCANCEL||MB_ICONWARNING; <br/>3 MB_OKCANCEL||MB_ICONERROR; <br/>其它MB_OKCANCEL||MB_ICONINFORMATION;
		* @param {String} title 警告栏标题
		* @param {String} msg  警告栏内容
		* @return {String} json格式
		*/
		confirm : function (iconType, title, msg) {
			return callHummerApi('Window.Confirm', '{ "iconType" : ' + iconType + ', "title" : "' + title + '", "text" : "' + msg + '" }');
		},
		/********************************** Window *********************************/

		/********************************** Contact *********************************/
		/**
		* 功能 ：获取主人UIN
		* @method getSelfUin
		* @return {String} json格式，除了errorCode，还包括以下字段<br/>uin：string类型，主人UIN
		*/
		getSelfUin: function () {
			return callHummerApi('Contact.GetSelfUin').uin;
		},
		/**
		*功能 ：获取特定UIN的昵称
		* @method getNickname
		* @param {String} uin 指定UIN
		* @return {String} json格式，除了errorCode，还包括以下字段<br/>nickName：string类型，昵称
		*/
		
		getNickname: function (uin) {
			return callHummerApi('Contact.GetNickName', '{ "uin" : "' + uin + '" }');
		},
		/**
		* 功能 ：判断特定UIN是否在线
		* @method isOnline
		* @param {String} uin 指定UIN	
		* @return {String} json格式，除了errorCode，还包括以下字段<br/>online：bool类型。true 在线；false 不在线。
		*/
		isOnline : function () {
			return !_isOffline();
		},
        /**
         当前窗口在线状态

         @property isOffline
         @type String
         @default "TRUE"
         **/
		isOffline : _isOffline,
		/**
		* 功能 ：设置特定UIN的备注
		* @method setRemark
		* @param {String} uin 指定UIN	
		* @param {String} remark 备注名
		* @return {String} json格式
		*/
		setRemark : function (uin, remark) {
			return callHummerApi('Contact.SetRemark', '{ "uin" : "' + uin + '", "remark" : "' + remark + '" }');
		},
		/**
		*  功能 ：打开某个UIN的资料卡，并定位到特定的TAB
		* @method openContactInfoCard
		* @param {String} uin 指定UIN	
		* @param {Number} uin 指定要定位到哪个TAB页。取值约定为：1 资料；2 相册；3 动态；4 标签；5 账户；6 账户; 7 游戏；8 问问；9 宠物；10 手机
		* @return {String} json格式
		*/

		openContactInfoCard : function (uin, tabId) {
			return callHummerApi('Contact.OpenContactInfoCard', '{ "uin" : "' + uin + '", "tabId" : ' + tabId + ' }');
		},
		/**
		*功能 ：添加好友
		* @method addFriend
		* @param {String} uin 指定UIN	
		* @param {String} name 备注
		* @return {String} json格式
		*/
		addFriend : function (uin, name) {
			return callHummerApi('Contact.AddFriend', '{ "uin" : "' + uin + '", "name" : "' + name + '" }');
		},
		/**
		*功能 ：打开AIO，发起好友会话
		* @method openChatSession
		* @param {Numbert} uin 指定UIN	
		* @return {String} json格式
		*/		
		openChatSession : function (uin) {
			return callHummerApi('Contact.OpenChatSession', '{ "uin" : "' + uin + '" }');
		},
		/**
		*功能 ：添加企业好友 （>=QQ2.00）
		* @method addCrmFriend
		* @param {String} url 添加企业好友所需的特定url
		* @return {Object} 包含字段 errorCode , int 
		*/		
		addCrmFriend : function (uin) {
			return callHummerApi('Contact.AddCrmFriend', '{ "uin" : "' + uin + '" }');
		},
		/**
		*功能 ：启动个人临时会话 （>=QQ2.00）
		* @method startChat
		* @param {Numbert} uin 启动临时回话的UIN
		* @return {Object} 包含字段 errorCode , int 
		*/		
		startChat : function (uin) {
			return callHummerApi('Contact.StartChat', '{ "uin" : "' + uin + '" }');
		},
		/**
		*功能 ：启动企业会话 （>=QQ2.00）
		* @method startCrmChat
		* @param {Numbert} uin 启动临时回话企业的UIN
		* @return {Object} 包含字段 errorCode , int 
		*/		
		startCrmChat : function (uin) {
			return callHummerApi('Contact.StartCrmChat', '{ "uin" : "' + uin + '" }');
		},
		/**
		*功能 ：打开企业资料卡 （>=QQ2.00）
		* @method openCrmInfoCard
		* @param {Numbert} uin 打开企业资料卡企业的UIN
		* @return {Object} 包含字段 errorCode , int 
		*/		
		openCrmInfoCard : function (uin) {
			return callHummerApi('Contact.StartCrmChat', '{ "uin" : "' + uin + '" }');
		},

		/********************************** Contact *********************************/
		
		/********************************** IM *********************************/
		/**
		*  功能 ：获取客户端版本号
		* @method getVersion
		* @return {String} json格式，除了errorCode，还包括以下字段<br/>version：string类型
		*/	
		getVersion : function () {
			return callHummerApi('IM.GetVersion');
		},
		/**
		*功能 ：获取ClientKey
		* @method getClientKey
		* @return {String} json格式，除了errorCode，还包括以下字段<br/>nickName：string类型，昵称
		*/	
		getClientKey : function () {
			return callHummerApi('IM.GetClientKey');
		},
		/**
		*  功能 ：获取SKey
		* @method getSKey
		* @return {String} json格式，除了errorCode，还包括以下字段<br/>sKey：string类型
		*/	
		getSKey : function () {
			return parseSkey(callHummerApi('IM.GetSKey'),'sKey');
		},
		/**
		*  功能 ：获取SuperKey （>=QQ1.98）
		* @method getSuperKey
		* @return {String} json格式，除了errorCode，还包括以下字段<br/>superKey：string类型
		*/	
		getSuperKey : function () {
			return parseSkey(callHummerApi('IM.GetSuperKey'),'superKey');
		},
		/**
		*  功能 根据域名获取私有Key （>=QQ1.98）
		* @method getDomainPSkey
		* @param {String} domain 获取skey的域名字符串
		* @return {String} json格式，除了errorCode，还包括以下字段<br/>pSkey：string类型
		*/	
		getDomainPSkey : function () {
			return parseSkey(callHummerApi('IM.GetDomainPSkey'),'pSkey');
		},
		
		/********************************** IM *********************************/

		/********************************** Group *********************************/
		/**
		*功能 ：打开群资料卡，并定位到特定的TAB页
		* @method openGroupInfoCard
		* @param {String} groupId 群ID
		* @param {Number} tabId 指定要定位到哪个TAB页。取值约定为：1 基本资料；2 更多资料；3 群成员；4 群名片；5 群设置；
		* @return {Object} json格式
		*/	

		openGroupInfoCard : function (groupId, tabId) {
			return callHummerApi('Group.OpenGroupInfoCard', '{ "groupId" : "' + groupId + '", "tabId" : ' + tabId + ' }')
		},
		/**
		*功能 ：加入到某个群
		* @method joinGroup
		* @param {Number} groupId  群ID 
		* @return {Object} json格式
		*/	
		joinGroup : function (groupId) {
			return callHummerApi('Group.JoinGroup', '{ "groupId" : "' + groupId + '" }');
		},
		/**
		*功能 ：访问公开群 （>=QQ2.00）
		* @method joinPublicGroup
		* @param {Number} groupUin  公开群号码 
		* @return {Object} 包含字段 errorCode , int 
		*/	
		joinPublicGroup : function (groupUin) {
			return callHummerApi('Group.JoinPublicGroup', '{ "groupUin" : "' + groupUin + '" }');
		},		
		/********************************** Group *********************************/

		/********************************** Misc *********************************/
		/**
		*  功能 ：下载文件
		* @method downloadFile
		* @param {String} url 文件URL
		* @param {String} name  文件名
		* @param {String} fileSize 大小
		* @return {Object} json格式
		*/

		downloadFile : function (url, name, fileSize) {
			return callHummerApi('Misc.DownloadFile', '{ "url" : "' + url + '", "fileName" : "' + name + '", "fileSize" : "' + fileSize + '" }');
		},
		/**
		* 功能 ：JS调用客户端打开一个用URL标识的图片
		* @method openWebPic
		* @param {String}  url 图片URL
		* @param {String}  callback 回调命令,可以不传递,如果传递,客户端会在打开图片成功或者失败时,回调JS
		* @return {Object} json格式
		*/
		openWebPic : function (url, callback) {
			openWebPicCallback = callback;
			return callHummerApi('Misc.OpenWebPic', '{ "url" : "' + url + '", "function" : "OnOpenWebPicEvt" }');
		},
		/**
		* 功能 ：JS调用客户端实现截屏，并把截取的图片上传到指定的Server
		* @method clipScreen
		* @param {String} cookies
		* @param {String}parameters 上传图片时加入包体的POST数据
		* @param {String} url 上传URL
		* @param {String} method 取值为clip(截屏)或者paste(粘贴)
		* @param {String} callback 回调命令；客户端会在成功(或失败)上传图片时，回调JS
		* @return {Object} json格式
		*/

		clipScreen : function (cookies, parameters, url, method, callback) {
			clipScreenCallback = callback;
			return callHummerApi('Misc.ClipScreen', '{ "url" : "' + url + '", "cookies" : "' + cookies + '", "parameters" : "' + parameters + '", "method" : "' + method + '", "uploaded" : "onClipScreenEvt" }');
		},
		/**
		* 功能 ：JS调用客户端实现举报功能（>=QQ2.00）
		* @method OpenImpeach
		* @param {String} uin 被举报的uin
		* @param {String} impeachType 1.用户,2.群,3.url,4.图片
		* @param {String} entryId 举报来源(具体见举报接口详细宏定义)
		* @param {String} srcType Url来源类型
		* @param {String} url 被举报的url
		* @param {String} pic 被举报的图片
		* @return {Object} 包含字段 errorCode , int 
		*/

		openImpeach : function (uin, impeachType, entryId, srcType, url ,pic) {
			return callHummerApi('Misc.OpenImpeach', '{ "uin" : "' + uin + '", "impeachType" : "' + impeachType + '", "entryId" : "' + entryId + '", "srcType" : "' + srcType+ '", "url" : "' + url + '", "pic" : "'+ pic +'" }');
		},
		/**
		* 功能 ：JS调用客户端打开视频播放器功能（>=QQ2.00）
		* @method openVideo
		* @param {String} videoName 视频名称
		* @param {String} videoUrl 视频地址
		* @param {String} shareUrl 分享地址
		* @return {Object} 包含字段 errorCode , int 
		*/

		openVideo : function (videoName, videoUrl, shareUrl) {
			return callHummerApi('Misc.OpenVideo', '{ "videoName" : "' + videoName + '", "videoUrl" : "' + videoUrl + '", "shareUrl" : "' + shareUrl +'" }');
		},
		/**
		* 功能 ：JS调用客户端打开应用管理器并定位到指定APP（>=QQ2.00）
		* @method locateApp
		* @param {String} appId 应用ID
		* @param {sting} appType 应用类型
		* @return {Object} 包含字段 errorCode , int 
		*/

		locateApp : function (appId, appType) {
			return callHummerApi('Misc.LocateApp', '{ "appId" : "' + appId + '", "appType" : "' + appType +'" }');
		},
		/**
		* 功能 ：JS调用客户端打开图片查看器（>=QQ2.00）
		* @method openImageViewer
		* @param {String} picName 图片路径
		* @return {Object} 包含字段 errorCode , int 
		*/

		openImageViewer : function (picName) {
			return callHummerApi('Misc.OpenImageViewer', '{ "picName" : "' + picName +'" }');
		},

		/********************************** Misc *********************************/

		/********************************** OnClientCall *********************************/
		/**
		*  功能 ：QQ在线状态变更回调
		* @method onQQStateChange
		* @param {Function}cb
		* @return null
		*/

		onQQStateChange : function (cb) {
			typeof(cb)==='function' && stateChangeList.push(cb);
		},
		/**
		* 功能 ：关闭窗口前询问回调
		* @method onCanCloceWindow
		* @param {Function} cb
		* @return null
		*/

		onCanCloseWindow : function (cb) {
			typeof(cb)==='function' && canCloseWindowList.push(cb);
		},
		/**
		*功能 ：Server Push 消息回调
		* @method onReceiveS2CMsg
		* @param {Function}cb
		* @return null
		*/

		onReceiveS2CMsg : function (cb) {
			typeof(cb)==='function' && receiveS2CMsgList.push(cb);
		},
		/********************************** OnClientCall *********************************/
		
		/********************************** callback *********************************/
		
		/**
		* 功能 ：扩展CommonApi
		* @description 
					you can change the default Function or Property  through this method,for example this.extend('ISREPORT',false) or this.extend({'ISREPORT':false})<br/>
					the default scope is commonapi, you can use the other scope like window for example CommonApi.extend('OnClientCall',function(){console.log(3333,arguments;return false;);},window,true)<br/>
					or CommonApi.extend({'OnClientCall':function(){console.log(3333,arguments;return false;);}},window,true);
		* @method extend
		* @param {String} args
		* @param {String} cb
		* @return 无返回
		*/

		extend : function(args, cb , scope ,ex){//scope
			//add function to this object
			var type = Object.prototype.toString.call(args);
			if(type === '[object String]'){
				scope = scope || this;
				var _args = {};
				_args[args] = cb;
				extend(scope, _args, ex);
			}else if(type === '[object Object]'){
				if((cb === null || cb === undefined) && arguments.length >= 4){
					scope = scope || this;
					extend(scope, args, ex);
				}else{
					ex = scope;
					scope = cb || this;
					extend(scope, args, ex);
				}
			}
		},
		OFFLINE_TIPS : function(){},//offline Tips-function,use this.extend('OFFLINE_TIPS',function(){}) if you want to change it.
        /**
         是否进行Monitor上报

         @property ISREPORT
         @type Boolean
         @default true
         **/
        ISREPORT : true//need report details or not. use this.extend('ISREPORT',false) if you want to change it.
	});
});