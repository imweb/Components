/**
 * 
 * @fileoverview Simple Javascript Lib Lite, for simple web developer such as im_client or index page 
 * @version 1.0
 * @author webryan,henryguo,herbertliu glancer.h@gmail.com
 * @lastUpdate 2011-01-07 11:40 
 * @function: 1.dom 2.cookie 3.ajax 4.mask?
 * @info: 以后采用文件版本号的方式更新
 * 修改：preLoad、$
 */

//(function(){



(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD loading: define module named "badjs" with dependencies and build it
        define('simple',[],factory);
    } else {
        // traditional browser loading: build badjs object with dependencies and inject it into window object
        root.$ = root.Simple = factory();
    }
})(this, function() {  // `this` refers to window, the second argument is the factory function with dependencies
	/**
	 * @description 基础方法
	 * @param {String | Object} n dom元素的id，或者dom元素
	 * @namespace
	 */
	var $ = window.$ = window.Simple = function(n){
		return typeof(n)=="string"?document.getElementById(n):n;
	};
	/**
	 * @description cookie相关
	 * @class
	 */
	$.cookie = {
		/**
		 * @description 读取cookie
		 * @public
		 * @param {String} n 名称
		 * @returns {String} cookie值
		 * @example
		 * 		$.cookie.get('id_test');
		 */
		get:function(n){
			var m = document.cookie.match(new RegExp( "(^| )"+n+"=([^;]*)(;|$)")); 
			return !m ? "":decodeURIComponent(m[2]);  
		},
		/**
		 * @description 设置cookie
		 * @public
		 *
		 * @param {String} name cookie名称
		 * @param {String} value cookie值
		 * @param {String} [domain = ""] 所在域名
		 * @param {String} [path = "/"] 所在路径
		 * @param {Number} [hour = 30] 存活时间，单位:小时
		 * @example
		 * 		$.cookie.set('value1','cookieval',"id.qq.com","/test",24); //设置cookie
		 */
		set:function(name,value,domain,path,hour){ 
			var expire = new Date(); 
			expire.setTime(expire.getTime() + (hour?3600000 * hour:30*24*60*60*1000));
	
			document.cookie = name + "=" + value + "; " + "expires=" + expire.toGMTString()+"; path="+ (path ? path :"/")+ "; "  + (domain ? ("domain=" + domain + ";") : ""); 
		},
		
		/**
		 * @description 删除指定cookie,复写为过期 !!注意path要严格匹配， /id 不同于/id/
		 * @public
		 *
		 * @param {String} name cookie名称
		 * @param {String} [domain] 所在域
		 * @param {String} [path = "/"] 所在路径
		 * @example
		 * 		$.cookie.del('id_test'); //删除cookie
		 */
		del : function(name, domain, path) {
			document.cookie = name + "=; expires=Mon, 26 Jul 1997 05:00:00 GMT; path="+ (path ? path :"/")+ "; " + (domain ? ("domain=" + domain + ";") : ""); 
		},
		/**
		 * @description 删除所有cookie -- 这里暂时不包括目录下的cookie
		 * @public
		 *
		 * @example
		 * 		$.cookie.clear(); //删除所有cookie
		 */
		 
		clear:function(){
			var rs = document.cookie.match(new RegExp("([^ ;][^;]*)(?=(=[^;]*)(;|$))", "gi"));
			// 删除所有cookie
			for (var i in rs){
				document.cookie = rs[i] + "=;expires=Mon, 26 Jul 1997 05:00:00 GMT; path=/; " ;
			}
		},
		/**
		 * 获取uin，针对业务,对外开源请删除
		 * @public
		 *
		 * @return {String} uin值
		 * @example
		 * 		$.cookie.uin();
		 */
		uin:function(){
			var u = $.cookie.get("uin");
			return !u?null:parseInt(u.substring(1, u.length),10); 
		}
	};
	
	
	
	/**
	 *@description http相关
	 *@class
	 */
	$.http = {
		/**
		 * @description 创建XMLHttpRequest对象，用于ajax通讯
		 * @example
		 * 		$.http.getXHR(); 
		 */
		getXHR_old:function(){//待删
			return window.ActiveXObject?new ActiveXObject("Microsoft.XMLHTTP"):new XMLHttpRequest();
		},
		_msxmlTypes:["Msxml2.XMLHTTP.6.0", "Msxml2.XMLHTTP.3.0", "Msxml2.XMLHTTP", "Microsoft.XMLHTTP"],
		_xhrType:void(0),//void(0) 未探测;-1 探测后使用标准XML对象;-2 探测后仍无法创建; 0+ 探测后使用该版本的XML对象
		getXHR:function(){
			var type = $.http._xhrType;
			
			if(typeof type =='undefined'){
				return $.http.getXHR_try();
			}
			
			if(type==-2) return;
			
			if(type==-1) return new XMLHttpRequest();
			
			var msxmlType = $.http._msxmlTypes[type];
			if(typeof msxmlType == 'string'){
				return new ActiveXObject(msxmlType)
			}
		},
		getXHR_try:function(ignoreStdXHR){
			var xhrObj;
			try{
				if (ignoreStdXHR) throw 123;
				xhrObj = new XMLHttpRequest();
				$.http._xhrType = -1;
			}catch(e){
				var aTypes = $.http._msxmlTypes;
				var len = aTypes.length;
				for(var i=0,len=aTypes.length;i<len;i++){
					try{
						xhrObj = new ActiveXObject(aTypes[i]);
						$.http._xhrType = i;
					}catch(e){
						continue;
					}
					break;
				}
			}
			finally{
				if(!xhrObj) $.http._xhrType = -2;
				return xhrObj;
			}
		},
		_xhrsId:0,
		_xhrs:{},
		setXHRToCache:function(xhrObj){
			$.http._xhrsId++;
			$.http._xhrs['xhr_'+$.http._xhrsId] = xhrObj;
			return $.http._xhrsId;
		},
		getXHRFromCache:function(id){
			return $.http._xhrs['xhr_'+id];
		},
		clearXHRInCache:function(id){
			id = 'xhr_'+id;
			if(id in $.http._xhrs){
				$.http._xhrs[id] = null;
				delete $.http._xhrs[id];
			}
		},
		/**
		 * @description发出ajax请求
		 *
		 * @param {String} url 请求路径--不能跨域
		 * @param {Object} [para] 参数列表
		 * @param {Function} cb 回调函数
		 * @param {Function} method 请求方式: [post|get]
		 * @param {String} [type = json] 数据类型：[json|text] --默认为json
		 * @example
		 * 		$.http.ajax('/cgi-bin/info',{'uin':10001},fnCallBack,'get');  
		 */
		ajax:function(url,para,cb,method,type){
			var xhr = $.http.getXHR();
			try{
				xhr.open(method,url,true);
			}catch(e){
				// 几个用户用了标准XHR，打开就报错。。。无语
				if ($.http._xhrType == -1){
					delete $.http._xhrType;
					var xhr = $.http.getXHR_try(true);
					xhr.open(method,url,true);
				}
			}
			var xhrId = $.http.setXHRToCache(xhr);
			/**
			 * onreadystatechange
			 * @ignore
			 */
			xhr.onreadystatechange = function(){
				if(xhr.readyState==4){
					//ie error with 1223 and opera with 304 or 0 
					if(( xhr.status >= 200 && xhr.status < 300 ) ||	xhr.status === 304 || xhr.status === 1223 || xhr.status === 0){
						if(typeof(type)=="undefined" && xhr.responseText){
							cb(eval("("+xhr.responseText+")")); //不容错，以便于排查json错误
						}else{
							cb(xhr.responseText);
						}		
					}else{
						cb({ec:xhr.status});//5XX错误等没有返回的情况下处理。
					}
					$.http.clearXHRInCache(xhrId);
					xhr = null;
				}
					
			}
			xhr.send(para);
			
			return xhrId;
		},
			/**
			 * @description 通过ajax发出post请求
			 *
			 * @param {String} url 请求路径--不能跨域
			 * @param {Object} para 参数列表
			 * @param {Function} cb 回调函数 
			 * @param {String} [type = "json"] 数据类型：[json|text] --默认为json
			 * @example
			 * 		$.http.post('/cgi-bin/info_mod',{'uin':10001},fnCallBack);  
			 */
			post:function(url,para,cb,type){
				var s = "";
				for(var i in para){
					s+="&" + i + "=" + para[i];	
				}
				return $.http.ajax(url,s,cb,"POST",type);
			},
			/**
			 * @description 通过ajax发出get请求
			 *
			 * @param {String} url 请求路径--不能跨域
			 * @param {Object} [para] 参数列表
			 * @param {Function} cb 回调函数 
			 * @param {String} [type = "json"] 数据类型：[json|text] --默认为json
			 * @example
			 * 		$.http.get('/cgi-bin/info',{'uin':10001},fnCallBack);  
			 */
			get:function(url,para,cb,type){
				var params = [];
				for(var i in para){
					params.push(i + "=" + para[i]);
				}
				if(url.indexOf("?")==-1){
					url+="?";	
				}
				url += params.join('&');
				return $.http.ajax(url,null,cb,"GET",type);
			},
			/**
			 * @description jsonp获取回调函数-- 可以支持跨域
			 *
			 * @param {String} url 请求路径
			 * @example
			 * 		$.http.jsonp('http://webryan.net/cgi-bin/test');   //cgi的返回值应该是 fnCallback({'data':''})的形式
			 */
			jsonp:function(url){
				var s = document.createElement("script");
				s.src = url;
				document.getElementsByTagName("head")[0].appendChild(s);  
			},
			/**
			 * @description 异步加载script脚本,并回调
			 *
			 * @param {String} src 请求路径
			 * @param {Function} callback 加载文档后的回调函数
			 * @param {Function} err 加载失败后回调
			 * @example
			 * 		$.http.loadScript('http://webryan.net/js/index.js',function(){alert()});   //callback通常为函数名，非字符串
			 */
			loadScript:function (src, callback, err) {   
				var tag = document.createElement("script");
				if(callback){
					/**
					 * Attach handlers for all browsers
					 * @ignore
					 */
					tag.onload = tag.onreadystatechange = function() {
						if ( !this.readyState ||this.readyState === "loaded" || this.readyState === "complete") {
							// 执行回调
							callback();
							// Handle memory leak in IE
							tag.onload = tag.onreadystatechange = null;
							if (tag.parentNode ) {
								tag.parentNode.removeChild( tag );
							}
						}
					};			
				} 
				
				tag.src = src;
				document.getElementsByTagName("head")[0].appendChild(tag);
			},
			/**
			 * @description 预加载某个文件，包括图片，js,flash --可以用于上报
			 *
			 * @param {String} url 请求路径 
			 * @example
			 * 		$.http.preload('http://webryan.net/swf/friends.swf');  
			 */
			preload:function(url){
				//var s = document.createElement("script");
				var s = document.createElement("img");
				s.src = url;	
			}
	}
	
	/** 
	 * @description 等同与$.http.get
	 * @see $.http.get
	 * @function
	 */
	$.get = $.http.get;
	
	/** 
	 * @description 等同与$.http.post
	 * @see $.http.post
	 * @function
	 */
	$.post = $.http.post;
	
	/** 
	 * @description 等同与$.http.jsonp
	 * @see $.http.jsonp
	 * @function
	 */
	$.jsonp = $.http.jsonp;
	
	/**
	 * @description 获取浏览器的版本等信息
	 * @namespace
	 * @param {String} name [type-类型1.msie.2.ff.3.opera.4.webkit|version--版本号] 
	 * 
	 * @example
	 * 		$.browser("");  
	 */
	$.browser = function(name){
		if(typeof $.browser.info == "undefined"){
			var ret = { type: "" };
			var ua = navigator.userAgent.toLowerCase();
			if ( /webkit/.test( ua ) ) {
				ret = { type: "webkit", version: /webkit[\/ ]([\w.]+)/ };
			} else if ( /opera/.test( ua ) ) {
				ret = { type: "opera", version:  /version/.test( ua ) ? /version[\/ ]([\w.]+)/ : /opera[\/ ]([\w.]+)/ };
			} else if ( /msie/.test( ua ) ) {
				ret = { type: "msie", version: /msie ([\w.]+)/ };
			} else if ( /mozilla/.test( ua ) && !/compatible/.test( ua ) ) {
				ret = { type: "ff", version: /rv:([\w.]+)/ };
			}
	
			ret.version = (ret.version && ret.version.exec( ua ) || [0, "0"])[1];
			$.browser.info = ret;	
		}
		return $.browser.info[name]
	};
	
	/**
	 * @description 事件相关 -- 绑定，解绑，触发
	 * @namespace
	 */
	$.e = {
		// Private utility to generate unique handler ids
		_counter :0,
		_uid:function( ) { return "h" + $.e._counter++; },
		
		/**** 以下一段来自aven的input事件封装 ********/
		_supportsPropertyChange : (function(){
			var ret = false;
			var testNode = document.body.appendChild(document.createElement('div'));
			testNode.onpropertychange = function() {
				ret = true;
				this.onpropertychange = null;
			};
			document.body.removeChild(testNode);
			testNode = testNode.onpropertychange = null;
			return ret;
		})(),
		_addTask : function(task) {
			var _this = this;
			function execTasks() {
				for(var i = 0,len = _this._tasks.length; i < len; i++) {
					_this._tasks[i]();
				}
			}
			if(typeof _this._tasks =="undefined") _this._tasks = [];
			_this._tasks.push(task);
			!_this._taskId && (_this._taskId = setInterval(execTasks,25));
		},
		_removeTask : function (task) {
			var _this = this;
			for(var i = 0,len = _this._tasks.length; i < len; i++) {
				var item = _this._tasks[i];
				if (item === task) {
					_this._tasks.splice(i,1);
					break;
				}
			}
			if (_this._tasks.length <= 0) {
				clearInterval(_this._taskId);
				_this._taskId = void(0);
			}
		},
		/*******************************************/
		
		_spec_evt_handlers:[],//存放特殊事件的handler
		_spec_evt:{//特殊的事件, 有特殊的事件处理函数
			"ondrag": function(element, eventType, handler){
				var x, y, isMove = false;
				var _start = function(e){
					if (e.button === 0){//左键点击
						e.stopPropagation();
						e.preventDefault();
						x = e.clientX;
						y = e.clientY;
						isMove = false;
						$.e.add(document, "mousemove", _move);
					}
				};
				var _move = function(e){
					if (e.button === 0){//左键点击
						var xx, yy;
						e.stopPropagation();
						xx = e.clientX;
						yy = e.clientY;
						if(Math.abs(x - xx) + Math.abs(y - yy) > 2){
							$.e.remove(document, "mousemove", _move);
							if(isMove==false){
								handler.call(element, e);
								isMove = true;
							}
						}
					}
				};
				var _end = function(e){
					if (e.button === 0){
						$.e.remove(document, "mousemove", _move);
					}
				};
				$.e.add(element, "mousedown", _start);
				$.e.add(element, "mouseup", _end);
				$.e._spec_evt_handlers.push({"element":element,"eventType":eventType,"handler":handler,"actions":[_start,_end]});
			},
			"offdrag": function(element, eventType,handler){
				var arr = $.e._spec_evt_handlers;
				for(var i=0,len=arr.length; i<len; i++){
					if(arr[i].handler==handler&&arr[i].element==element&&arr[i].eventType==eventType){
						$.e.remove(element, "mousedown",arr[i].actions[0]);
						$.e.remove(element, "mouseup",arr[i].actions[1]);
						arr.splice(i,1);
						break;
					}
				}
			},
			"oninput": function(element, eventType, handler){
				if (typeof handler == 'function') {
					element = $(element);
					var executing = false;
					var oldValue = element.value;
					
					/*
					element.fireValueChange = function() {
						oldValue = element.value;
					};*/
					
					var _fixInputBug = function() {
						if (oldValue != element.value) {
							handler.call(element,oldValue);
							oldValue = element.value;
						}
					};
					
					var _onPropertyChange = function(e) {
						if (!executing && (e || window.event).propertyName == 'value') {
							executing = true;
							handler.call(element,oldValue);
							executing = false;
						}
					}
					var _onInput = function(e){
						handler.call(element,oldValue);
					}
					
					if ($.e._supportsPropertyChange) {
						$.e.add(element,'propertychange',_onPropertyChange);
						$.e._spec_evt_handlers.push({"element":element,"eventType":eventType,"handler":handler,"actions":{'propertychange':_onPropertyChange}});
					} else {
						element.addEventListener('input',_onInput,false);
						$.e.add(element,'mouseover',_fixInputBug);
						$.e._spec_evt_handlers.push({"element":element,"eventType":eventType,"handler":handler,"actions":{'input':_onInput,'mouseover':_fixInputBug}});
					}
					
					element._fixInputBug = _fixInputBug;
					$.e._addTask(_fixInputBug);	//casper to do：此处是否需要修改
				}
			},
			"offinput":function(element, eventType, handler){
				element = $(element);
				var arr = $.e._spec_evt_handlers;
				for(var i=0,len=arr.length; i<len; i++){
					if(arr[i].handler==handler&&arr[i].element==element&&arr[i].eventType==eventType){
						var actions = arr[i].actions;
						if('propertychange' in actions) $.e.remove(element,'propertychange',actions['propertychange']);
						if('input' in actions) element.removeEventListener('input',actions['input'],false);
						if('mouseover' in actions) $.e.remove(element,'mouseover',actions['mouseover']);
						$.e._removeTask(element._fixInputBug);	//casper to do：此处是否需要修改
						arr.splice(i,1);
						break;
					}
				}
			}
		},
		/**
		 * @description 绑定事件
		 *
		 * @param {Object} element 绑定事件的元素
		 * @param {String} eventType 事件类型
		 * @param {Function} handler 事件处理方法
		*/
		add:function(element, eventType, handler){
			element = $(element);
			if (this._spec_evt["on" + eventType]){
				this._spec_evt["on" + eventType](element, eventType, handler);
				return;
			}
			
			var de = document.documentElement;
			var body = document.body;
			eventType = eventType.toLowerCase();
			
			if (document.addEventListener){
				
				if(eventType=="mouseenter" || eventType=="mouseleave"){	//对"mouseenter"、"mouseleave"事件做单独绑定处理
					
					//利用"mouseover"、"mouseout"来模拟"mouseenter"、"mouseenter"
					var eType = (eventType=="mouseenter")?"mouseover":"mouseout";
					/**
					 * wrapHandler
					 * @ignore
					 */
					var wrapHandler = function(handler){
						/**
						 * wrapHandler
						 * @ignore
						 */
						var func = function(e){
	
							var target = e.target;
							var parent = e.relatedTarget;
							
							while(parent && parent!=this){	// 
								parent = parent.parentNode;
							}
	
							//parent不等于this，说明触发事件的正是绑定事件的element本身
	/* 						
							if(parent!=this){
								
								var f = function(){};
								f.prototype = e;//document.createEventObject();
								var Event = function(){};
								Event.prototype = new f();
								Event.prototype.constructor = Event();
								var event = new Event();
								event["target"] = this;
								event["type"] = eventType;
								
								handler.call(this,event);
							}
							 */
							if(parent!=this){
								/**
								 * event obj
								 * @ignore
								 */
								var event = $.oop.extend({},e,{
									_event : e,
									type: eventType,           // Event type
									target: this,   // Where the event happened
									currentTarget: element, // Where we're handling it
									relatedTarget: e.relatedTarget,
									//relatedTarget: e.fromElement?e.fromElement:e.toElement,
									eventPhase: (e.srcElement==element)?2:3,
					
									// Mouse coordinates
									//clientX: e.clientX, clientY: e.clientY,
									//screenX: e.screenX, screenY: e.screenY,
									// Key state --fix:keyCode
									//altKey: e.altKey, ctrlKey: e.ctrlKey,shiftKey: e.shiftKey,
									//keyCode: e.keyCode,
									//charCode : e.charCode,
									/**
									 * stopPropagation
									 * @ignore
									 */
									stopPropagation: function(){e.stopPropagation();},
									/**
									 * preventDefault
									 * @ignore
									 */
									preventDefault: function(){e.preventDefault();}
								});
								
								if(typeof(event.pageX)=="undefined"){
									event.pageX = e.clientX + (de && de.scrollLeft || body && body.scrollLeft || 0) - (de && de.clientLeft || body && body.clientLeft || 0);
								}
								if(typeof(event.pageY)=="undefined"){
									event.pageY = e.clientY + (de && de.scrollTop || body && body.scrollTop || 0) - (de && de.clientTop || body && body.clientTop || 0)
								}
								
								handler.call(this,event);
							}
							
						};
						
						return func;
					} 
					element.addEventListener(eType,wrapHandler(handler),false);
					
				}else{
					if(eventType=="mousewheel"){
						eventType = "DOMMouseScroll";//firefox使用DOMMouseScroll
					}
					element.addEventListener(eventType,handler,false);
				}
			}else if (document.attachEvent) {
				if ($.e._find(element, eventType, handler) != -1) return;
	
				//test by henryguo 2012.02.27
				var h = {},eventHandle; 
				
				h.handle =  eventHandle = function(e){
					var e = e || window.event; 
				//	console.log(arguments.callee.handler);
					var eventType = arguments.callee.eventType;
					var event = $.oop.extend({},e,{
						_event: e,    // In case we really want the IE event object
						//type: e.type,           // Event type
						target: e.srcElement,   // Where the event happened
						currentTarget: null, // Where we're handling it
						relatedTarget: e.fromElement ? e.fromElement: e.toElement,
						eventPhase: (e.srcElement==element)?2:3,
						
						charCode: e.keyCode,
						//stopPropagation
						stopPropagation: function(){this._event.cancelBubble = true;},
						//preventDefault
						preventDefault: function(){this._event.returnValue = false;}
					});
					if (eventType == "mouseover") e.relatedTarget = e.fromElement;
					else if (eventType == "mouseout") e.relatedTarget = e.toElement;
					
					if (typeof(e.button)!="undefined"){
						var b = e.button;
						var f = {0 : -1,1 : 0,2 : 2,3 : -1,4 : 1};
						event.button = typeof(f[b])=="undefined" ? b: f[b];
					}
					if(typeof(event.pageX)=="undefined"){
						event.pageX = e.clientX + (de && de.scrollLeft || body && body.scrollLeft || 0) - (de && de.clientLeft || body && body.clientLeft || 0);
					}
					if(typeof(event.pageY)=="undefined"){
						event.pageY = e.clientY + (de && de.scrollTop || body && body.scrollTop || 0) - (de && de.clientTop || body && body.clientTop || 0)
					}
					if(typeof(event.layerX)=="undefined"){
						event.layerX = e.offsetX;
					}
					if(typeof(event.layerY)=="undefined"){
						event.layerY = e.offsetY;
					}
					
					arguments.callee.handler.call(arguments.callee.elem,event);
				}
				eventHandle.elem = element;
				eventHandle.handler = handler;
				eventHandle.eventType = eventType;
				h.eventType = eventType;
				h.handler = handler;
				h.element = element;
				element.attachEvent("on"+eventType,eventHandle);
		
				// Figure out what document this handler is part of.
				// If the element has no "document" property, it is not
				// a window or a document element, so it must be the document
				// object itself.
				var d = element.document || element;
				// Now get the window associated with that document.
				var w = d.parentWindow;
		
				// We have to associate this handler with the window,
				// so we can remove it when the window is unloaded.
				var id = $.e._uid( );  // Generate a unique property name
				if (!w._allHandlers) w._allHandlers = {};  // Create object if needed
				w._allHandlers[id] = h; // Store the handler info in this object
		
				// And associate the id of the handler info with this element as well.
				if (!element._handlers) element._handlers = [];
				element._handlers.push(id);
				
				// If there is not an onunload handler associated with the window,
				// register one now.
				if (!w._onunloadHandlerRegistered) {
					w._onunloadHandlerRegistered = true;
					w.attachEvent("onunload", $.e._removeAllHandlers);
				}
				element = null;
				eventHandle = null;
				h = null;
				return;
			}
		
		},
		/**
		 * @description 移除绑定事件
		 *
		 * @param {Object} element 移除事件的元素
		 * @param {Object} eventType 事件类型
		 * @param {Function} handler 事件处理方法
		*/
		remove:function(element, eventType, handler) {
			element = $(element);
			if (this._spec_evt["off" + eventType]){
				this._spec_evt["off" + eventType](element, eventType, handler);
				return;
			}
			
			if (document.addEventListener){
				element.removeEventListener(eventType, handler, false);
			}else if (document.attachEvent){
	
				// Get the window of this element.
				var d = element.document || element;
				var w = d.parentWindow;
				if(eventType && handler){
					// Find this handler in the element._handlers[] array.
					var i = $.e._find(element, eventType, handler);
					if (i == -1) return;  // If the handler was not registered, do nothing
	
					// Look up the unique id of this handler.
					var handlerId = element._handlers[i];
					// And use that to look up the handler info.
					var h = w._allHandlers[handlerId];
					//console.log(h+',eventType:'+eventType+',');
					// Using that info, we can detach the handler from the element.
					element.detachEvent("on" + eventType, h.handle);
					
					//console.log('remove:'+eventType+',on:'+h.element);
					// Remove one element from the element._handlers array.
					element._handlers.splice(i, 1);
					// And delete the handler info from the per-window _allHandlers object.
					delete w._allHandlers[handlerId];
					if (h.element){
						h.element = null;
						if(h.handle&&h.handle.elem) h.handle.elem = null;
						if(h.handle) h.handle = null;
						h = null;
					}	
				}else{
					var handlers = element._handlers;
					if(handlers){
						for(var i = handlers.length-1; i >= 0; i--) {
							var handlerId = handlers[i];
							var h = w._allHandlers[handlerId];
							$.e.remove(element,h.eventType,h.handler);
							h.handler.elem = null;
							h.handler = null;
							h = null;
						}
						element._handlers = null;
					}
					var childNodes = element.childNodes;
					for(var i = childNodes.length-1; i >=0 ;i--){
						var child = childNodes[i];
						$.e.remove(childNodes[i]);
					}
				}
			} 
		},
		/**
		 * @description 手动执行绑定在元素上的事件
		 *
		 * @param {Object} element 触发事件的dom元素
		 * @param {String} eventType 触发事件的类型
		 * @example
		 * 		$.e.trigger(dom,'click');
		 */
		trigger : function(element,eventType){
			element = $(element);
			var eventMap = {
				
				HTMLEvents : "abort,blur,change,error,focus,load,reset,resize,scroll,select,submit,unload",
				UIEevents : "keydown,keypress,keyup",
				MouseEvents : "click,mousedown,mousemove,mouseout,mouseover,mouseup,contextmenu"
			};
			
			if(document.createEvent) {
				
				var eventSource = '';
				(eventType == "mouseleave") && (eventType = "mouseout");	//用mouseleave事件来模拟mouseleave事件
				(eventType == "mouseenter") && (eventType = "mouseover");
				
				for(var n in eventMap){
					
					if(eventMap[n].indexOf(eventType)){
	
						eventSource = n;
						break;
					}
				}
	
				var evObj = document.createEvent(eventSource);
				evObj.initEvent(eventType, true, false);
				element.dispatchEvent(evObj);
	
			} else if( document.createEventObject) {
	
				element.fireEvent('on'+eventType);
			}
		},
		 // A utility function to find a handler in the element._handlers array
		// Returns an array index or -1 if no matching handler is found
		_find : function(element, eventType, handler) {
			var handlers = element._handlers;
			if (!handlers) return -1;  // if no handlers registered, nothing found
	
			// Get the window of this element
			var d = element.document || element;
			var w = d.parentWindow;
	
			// Loop through the handlers associated with this element, looking
			// for one with the right type and function.
			// We loop backward because the most recently registered handler
			// is most likely to be the first removed one.
			for(var i = handlers.length-1; i >= 0; i--) {
				var handlerId = handlers[i];        // get handler id
				var h = w._allHandlers[handlerId];  // get handler info
				// If handler info matches type and handler function, we found it.
				if (h.eventType == eventType && h.handler == handler)
					return i;
			}
			return -1;  // No match found
		},
		_removeAllHandlers :function( ) {
			// This function is registered as the onunload handler with
			// attachEvent. This means that the this keyword refers to the
			// window in which the event occurred.
			var w = this;
	
			// Iterate through all registered handlers
			for(id in w._allHandlers) {
				// Get handler info for this handler id
				var h = w._allHandlers[id];
				// Use the info to detach the handler
				h.element.detachEvent("on" + h.eventType, h.handler);
				// Delete the handler info from the window
				delete w._allHandlers[id];
			}
		},
		
		/**
		 * @description 获取事件发生的元素
		 * @param {Object} e 事件对象
		 */
		src:function(e){
			return e?e.target:event.srcElement;
		},
		/**
		 * @description 阻止事件冒泡
		 * @param {Object} e 事件对象
		 */
		stopPropagation:function(e){
			e?e.stopPropagation():event.cancelBubble = true;
		}
	};
	//#1 （1）$.e.ready ff3.6下参数错误bug fix （2）支持绑定多个ready事件
	//调用方式：$.e.ready( callback )
	(function(){
		
		var readyList = [];	//等待执行的队列
		var readyBound = false;	//是否已经绑定了DOMConttentLoaded事件
		var isReady = false;	//DOMConttentLoaded事件是否已经触发
		var DOMContentLoaded ;
		
		if(document.addEventListener){
			DOMContentLoaded = function(){
				isReady = true;
				document.removeEventListener( 'DOMContentLoaded', DOMContentLoaded, false );
				execute_ready();
			}
		}else if(document.attachEvent){
			DOMContentLoaded = function(){
				if( document.readyState === 'complete' ){
					isReady = true;
					document.detachEvent( 'onreadystatechange', DOMContentLoaded );
					execute_ready();
				}
			}
		}
	
		function execute_ready(){
			while( readyList.length ){
				readyList[0]();
				readyList.shift();
			}
		}
	
		function doScrollCheck(){
			if( isReady ) return;
			
			try {
				document.documentElement.doScroll( 'left');
			} catch(e) {
				setTimeout( doScrollCheck, 1 );
				return;
			}
			execute_ready();
		}
	
		$.e.ready = $.ready = function(callback){
			
			if(readyBound){
				if( isReady ) callback();	//已ready，直接执行
				else readyList.push( callback );	//尚未ready，放进等待队列
				return;	
			} 
			readyBound = true;
			
			readyList.push( callback );
			if(document.readyState === 'complete'){	//此处从 4 改成 complete ，需探究
				isReady = true;	//第一次调用$.e.ready的时候，DOMConttentLoaded事件已经触发了
				callback();
				return;
			}
			
			if(document.addEventListener){
	
				document.addEventListener( 'DOMContentLoaded', DOMContentLoaded, false );
	
				window.addEventListener( 'load' , DOMContentLoaded, false );
	
			}else if(window.attachEvent){
				
				document.attachEvent( 'onreadystatechange', DOMContentLoaded );
				
				window.attachEvent( 'onload', DOMContentLoaded );
	
				var toplevel = false;
				try {
					toplevel = window.frameElement == null;
				} catch(e) {}
	
				if (document.documentElement.doScroll && toplevel) {
					doScrollCheck();
				}
				
			}
		};
	
	})();
	/**
	 * @description BOM相关，toolkit
	 * @namespace 
	 */
	$.bom = {
		/**
		 * @description 读取location.search
		 *
		 * @param {String} n 名称
		 * @return {String} search值
		 * @example
		 * 		$.bom.query('mod');
		 */
		query:function(n){ 
			var m = window.location.search.match(new RegExp( "(\\?|&)"+n+"=([^&]*)(&|$)"));   
			return !m ? "":decodeURIComponent(m[2]);  
		},
		/**
		 *@description 读取location.hash值
		 *
		 *@param {String} n 名称
		 *@return {String} hash值
		 *@example 
		 *		$.bom.hash('mod');
		*/
		getHash:function(n){
			var m = window.location.hash.match(new RegExp( "(#|&)"+n+"=([^&]*)(&|$)"));
			return !m ? "":decodeURIComponent(m[2]);  
		}
	};
	
	/**
	 * @description DOM相关，toolkit
	 * @namespace
	 * @requires $.e    
	 * @requires $.browser
	 * @requires $.badjs
	 * @requires $.css
	 */
	$.dom = {
		/** @ignore */
		val:function(v){
			
		},
		/**
		 * @description 删除指定id的节点
		 * 
		 * @param {DOMElement || String} node 即将删除的节点，或节点的id
		 * @param {Boolean} flag  标志：是否返回被删除的节点，true则返回，false则不返回，默认是false
		 * @example
		 * 		$.dom.remove('test_id');
		 */
		remove:function(node,flag){
	
			var node = $(node);
			
			if($.browser("type")=="msie"){
				if(node && node.tagName != 'BODY'){
					var parent = node.parentNode;
					
					if(flag) return parent?parent.removeChild(node):node;
					
					var collector = $.dom._collector();
					var tmp = parent?parent.removeChild(node):node;
					$.e.remove(tmp);
					try{tmp.innerHTML = '';}catch(e){}	//input可以取到innerHTML，但是在ie里不能设置innerHTML
					collector.appendChild(tmp);
					collector.innerHTML = '';	
					tmp = null;
					collector = null;
				}			
			}else{
				if(node && node.parentNode && node.tagName !=  'BODY'){
					var tmp = node.parentNode.removeChild(node);
					if(flag) return tmp;
				}
			}
		},
		_collector: function(){
			if(!$.dom._collect){
				$.dom._collect = document.createElement("div");
			}
			return $.dom._collect;
		},
		/**
		 * @
		*/
		queryClass: function(className,tagName,container) {
			container = $(container) || document;
			if (container.querySelector) {
				return container.querySelector((tagName || '') + '.' + className);
			}
			container = container.getElementsByTagName(tagName || '*');
			for (var i = 0, elem = container[0]; elem; elem = container[++i]) {
				if ($.css.hasClass(elem,className)) {
					return elem;
				}
			}
			
			return null;
		},
		queryClassAll: function(className,tagName,container) {
			container = $(container) || document;
			if (container.querySelectorAll) {
				return container.querySelectorAll((tagName || '') + '.' + className);
			}
			var elems = [];
			container = container.getElementsByTagName(tagName || '*');
			for (var i = 0, elem = container[0]; elem; elem = container[++i]) {
				if ($.css.hasClass(elem,className)) {
					elems.push(elem);
				}
			}
			
			return elems;
		},
		/**
		 * @description 创建指定标签名的Node并根据配置项设置node的一些属性
		 * 
		 * @param {String} tagName 要创建Node的tagName
		 * @param {Object} cfg 配置项,用于配置该Node的属性
		 * 		cfg:{
		 * 			class: "xxx", //class名.  等同于通过obj.className进行设置.
		 * 			style: "display:block; color:red;", //style内容. 等同于通过obj.style.cssText进行设置
		 * 			prop: "prop-value" //prop代表除class和style以外的其他各种属性. 等同于通过obj.setAttribute(prop,"prop-value")进行设置
		 * 		}
		 * @return 创建的Node
		 * @example
		 * 		$.dom.getNode("div", {id:"test", class:"div test", style:"display:block; color:red;"});
		 */
		getNode: function(tagName,cfg){
			var node = document.createElement(tagName);
			var f = {
				"class":function(){node.className = cfg["class"];},
				"style":function(){node.style.cssText = cfg["style"];}
			}
			for(var prop in cfg){
				if(f[prop])  f[prop]();
				else node.setAttribute(prop,cfg[prop]);
			}
			
			return node;
		},
		select: function(textnode, startIndex, endIndex){
			textnode = $(textnode);
			startIndex = parseInt(startIndex);
			endIndex = parseInt(endIndex);
			startIndex = isNaN(startIndex) ? 0 : startIndex;
			endIndex = isNaN(endIndex) ? textnode.value.length : endIndex;
			if (textnode.setSelectionRange){
				textnode.setSelectionRange(startIndex, endIndex);
			} else if (textnode.createTextRange){//IE
				var range = textnode.createTextRange();
				range.collapse(true);  
				range.moveStart('character', startIndex);
				range.moveEnd('character', endIndex - startIndex);
				range.select();  
			}
		},
		focus : function(textnode,range) {
			setTimeout(function() {
				try {
					textnode = $(textnode);
					var len = textnode.value.length;
					var start = range ? range.start : len;
					var end = range ? range.end : len;
					$.dom.select(textnode,start,end);
					textnode.focus();
				}catch(e) {}
			},25);
		}
	};
	
	/**
	 * @description 数组常用操作
	 * @date 2011.11.30
	 * @author givonchen
	 * @namespace
	 */
	$.array={
	
		/**
		 * @description 判断元素elem是否在数组array中
		 * @param {Array} array 数组
		 * @param {Object} elem 要判断的元素
		 * @returns {Number} 元素在数组中对应的位置，若不存在返回-1
		 * @example $.array.indexOf([1,2,3],2);
		 */
		indexOf: function(array,elem) {
			//IE不支持这个方法
			if(Array.prototype.indexOf){
				return Array.prototype.indexOf.call( array, elem );
			}
			for ( var i = 0, length = array.length; i < length; i++ ) {
				if ( array[ i ] === elem ) {
					return i;
				}
			}
	
			return -1;
		},
		/**
		 * 数组的过滤
		 * @param {Array} array 要过滤的数组
		 * @param {Function} filter为过滤函数，若返回值为false，则将该元素删除，否则，保留该元素
		 * @return {Array} 返回过滤后的新数组
		 * @example $.array.grep([1,2,3],function(i){if(i==2){return false;}})
		 */
		grep: function(array, filter) {
			var ret = [];
			for ( var i = 0, length = array.length; i < length; i++ ) {
				if (filter(array[i], i )) {
					ret.push( array[ i ] );
				}
			}
			return ret;
		},
		/**
		 * @description 数组元素的删除
		 * @param {Array} array 要删除元素的数组
		 * @param {Number} index 要删除元素的下标
		 * @return {Array} 删除元素后后的新数组
		 * @example $.array.del([1,2,3],1)
		 */
		del:function(array,index){
			var ret = [];
			for ( var i = 0, length = array.length; i < length; i++ ) {
				if (index!=i) {
					ret.push( array[ i ] );
				}
			}
			return ret;
		},
		/**
		 * @description 对指定数组中每个元素调用指定的函数
		 * @function
		 * @param {Array} arr指定的数组
		 * @param {Function} fn 要对数组中每个元素调用的函数
		 * @return {Object} [thisObj] 调用函数中替代this的对象.若不传,默认使用window作为fn的this.
		 * @example $.array.forEach([1,2,3],function(item){alert(item);})
		 */
		forEach: Array.prototype.forEach ? function(){
			var a=Array.prototype.slice.call(arguments,1);
			return Array.prototype.forEach.apply(arguments[0] || [],a);
		} : function(arr,fn,thisObj){
			var scope = thisObj || window,arr = arr || [];
			for(var i=0,len=arr.length;i<len;i++){
				i in arr && fn.call(scope, arr[i], i, arr);
			}
		}
	};
	
	
	/**
	 * @description 字符串常用操作
	 * @date 2011.11.30
	 * @author knightli
	 * @namespace
	 */
	$.str = (function(){
	
		//获取decodetable
		function _html_entities_refs(level) {
			var decodeMap = {};
			
			//HTML 4.01 支持 ISO 8859-1 (Latin-1) 字符集。
			//ISO-8859-1 的较低部分（从 1 到 127 之间的代码） ASCII 有部分
			//ISO-8859-1 的较高部分（从 160 到 255 之间的代码）全都有实体名称
			//除此之外，还有：
			//   数学符号: 8704 - 8901 ，有空隙
			//   希腊字母: 913 - 982
			//   其他实体: 3xx(5个),4xx(1个),7xx(2个),8xxx,9xxx若干
			//注意：实体名称对大小写敏感
			
			//1-160: 有refname的ASCII实体外加nbsp(空格)
			if (level>=0) {
				decodeMap['&quot;'] = 34;
				decodeMap['&amp;'] = 38;
				decodeMap['&apos;'] = 39;
				decodeMap['&lt;'] = 60;
				decodeMap['&gt;'] = 62;
				decodeMap['&nbsp;'] = 160;
			}
			//160-255: 有refname的字符实体和符号实体
			if (level>=1) {
				decodeMap['&iexcl;'] = 161;
				decodeMap['&cent;'] = 162;
				decodeMap['&pound;'] = 163;
				decodeMap['&curren;'] = 164;
				decodeMap['&yen;'] = 165;
				decodeMap['&brvbar;'] = 166;
				decodeMap['&sect;'] = 167;
				decodeMap['&uml;'] = 168;
				decodeMap['&copy;'] = 169;
				decodeMap['&ordf;'] = 170;
				decodeMap['&laquo;'] = 171;
				decodeMap['&not;'] = 172;
				decodeMap['&shy;'] = 173;
				decodeMap['&reg;'] = 174;
				decodeMap['&macr;'] = 175;
				decodeMap['&deg;'] = 176;
				decodeMap['&plusmn;'] = 177;
				decodeMap['&sup2;'] = 178;
				decodeMap['&sup3;'] = 179;
				decodeMap['&acute;'] = 180;
				decodeMap['&micro;'] = 181;
				decodeMap['&para;'] = 182;
				decodeMap['&middot;'] = 183;
				decodeMap['&cedil;'] = 184;
				decodeMap['&sup1;'] = 185;
				decodeMap['&ordm;'] = 186;
				decodeMap['&raquo;'] = 187;
				decodeMap['&frac14;'] = 188;
				decodeMap['&frac12;'] = 189;
				decodeMap['&frac34;'] = 190;
				decodeMap['&iquest;'] = 191;
				decodeMap['&Agrave;'] = 192;
				decodeMap['&Aacute;'] = 193;
				decodeMap['&Acirc;'] = 194;
				decodeMap['&Atilde;'] = 195;
				decodeMap['&Auml;'] = 196;
				decodeMap['&Aring;'] = 197;
				decodeMap['&AElig;'] = 198;
				decodeMap['&Ccedil;'] = 199;
				decodeMap['&Egrave;'] = 200;
				decodeMap['&Eacute;'] = 201;
				decodeMap['&Ecirc;'] = 202;
				decodeMap['&Euml;'] = 203;
				decodeMap['&Igrave;'] = 204;
				decodeMap['&Iacute;'] = 205;
				decodeMap['&Icirc;'] = 206;
				decodeMap['&Iuml;'] = 207;
				decodeMap['&ETH;'] = 208;
				decodeMap['&Ntilde;'] = 209;
				decodeMap['&Ograve;'] = 210;
				decodeMap['&Oacute;'] = 211;
				decodeMap['&Ocirc;'] = 212;
				decodeMap['&Otilde;'] = 213;
				decodeMap['&Ouml;'] = 214;
				decodeMap['&times;'] = 215;
				decodeMap['&Oslash;'] = 216;
				decodeMap['&Ugrave;'] = 217;
				decodeMap['&Uacute;'] = 218;
				decodeMap['&Ucirc;'] = 219;
				decodeMap['&Uuml;'] = 220;
				decodeMap['&Yacute;'] = 221;
				decodeMap['&THORN;'] = 222;
				decodeMap['&szlig;'] = 223;
				decodeMap['&agrave;'] = 224;
				decodeMap['&aacute;'] = 225;
				decodeMap['&acirc;'] = 226;
				decodeMap['&atilde;'] = 227;
				decodeMap['&auml;'] = 228;
				decodeMap['&aring;'] = 229;
				decodeMap['&aelig;'] = 230;
				decodeMap['&ccedil;'] = 231;
				decodeMap['&egrave;'] = 232;
				decodeMap['&eacute;'] = 233;
				decodeMap['&ecirc;'] = 234;
				decodeMap['&euml;'] = 235;
				decodeMap['&igrave;'] = 236;
				decodeMap['&iacute;'] = 237;
				decodeMap['&icirc;'] = 238;
				decodeMap['&iuml;'] = 239;
				decodeMap['&eth;'] = 240;
				decodeMap['&ntilde;'] = 241;
				decodeMap['&ograve;'] = 242;
				decodeMap['&oacute;'] = 243;
				decodeMap['&ocirc;'] = 244;
				decodeMap['&otilde;'] = 245;
				decodeMap['&ouml;'] = 246;
				decodeMap['&divide;'] = 247;
				decodeMap['&oslash;'] = 248;
				decodeMap['&ugrave;'] = 249;
				decodeMap['&uacute;'] = 250;
				decodeMap['&ucirc;'] = 251;
				decodeMap['&uuml;'] = 252;
				decodeMap['&yacute;'] = 253;
				decodeMap['&thorn;'] = 254;
				decodeMap['&yuml;'] = 255;
			}
			
			if(level>=2){
				//TODO:不常用，待补充
			}
			
			return decodeMap;
		}
		var _decodeDict = {};
		var _decodeReg = {};
		var _encodeDict = {};
		var _encodeReg = {};
		
		var getDecodeDict = function(level) {
			if (!_decodeDict[level]) {
				_decodeDict[level] = _html_entities_refs(level);
			}
			
			return _decodeDict[level];
		}
		
		var getEncodeDict = function(level) {
			if (!_encodeDict[level]) {
				var decodeDict = getDecodeDict(level);
				var encodeDict = {};
				for(key in decodeDict){
					//encodeDict[String.fromCharCode(decodeDict[key])] = key;
					encodeDict[String.fromCharCode(decodeDict[key])] = '&#'+decodeDict[key]+';';
				}
				//fix:lose normal space
				encodeDict[' '] = '&#32;';
				_encodeDict[level] = encodeDict;
			}
			
			return _encodeDict[level];
		}
		
		var getDecodeReg = function(level) {
			if (!_decodeReg[level]) {
				_decodeReg[level] = new RegExp('(' + getDictKeys(getDecodeDict(level)).join('|') + ')', 'g');
			}
			return _decodeReg[level];
		}
		
		var getEncodeReg = function(level) {
			if (!_encodeReg[level]) {
				_encodeReg[level] = new RegExp('[' + getDictKeys(getEncodeDict(level)).join('') + ']', 'g');
			}
			return _encodeReg[level];
		}
		
		var getDictKeys = function(dict) {
			var keys = [];
			for (p in dict) {
				if (dict.hasOwnProperty(p)) {
					keys.push(p);
				}
			}
			return keys;
		}
		
		
		var htmlEncodeDict = {'"': "#34", "<": "#60", ">": "#62", "&": "#38", " ": "#160" };
		htmlEncodeDict[String.fromCharCode(160)]  = '#160';
		return {
			/**
			 * @description 将字符串里entity解码成对应的符号，如&lt;对应<
			 * @param {String} s 原始字符串
			 * @return {String} 处理后字符串
			 * @example
			 * 		$.str.decodeHtml('&lt;script&gt;&lt;/script&gt;'); 返回结果为："<script></script>"
			 */
			decodeHtml: function(s,level){
				level = !isNaN(level) ? level : 0;
				
				s += '';
				var reg = getDecodeReg(level);
				var dict = getDecodeDict(level);
				
				return s.replace(reg, function(all, key){
						return '&#' + dict[key] + ';';
					}).replace(/&#x([a-f\d]+);/g, function(all, hex){
							return '&#' + parseInt("0x" + hex) + ';';
						}).replace(/&#(\d+);/g, function(all, number){
							return String.fromCharCode(+number);
						});
			},
			/**
			 * @description 将字符串里的"<"、"&"等转成对应entity
			 * @param {String} s 原始字符串
			 * @return {String} 处理后字符串
			 * @example
			 * 		$.str.encodeHtml('<script></script>'); 返回结果为："&lt;script&gt;&lt;/script&gt;"
			 */
			encodeHtml: function(s,level){
				level = !isNaN(level) ? level : 0;
				
				s += '';
				var reg = getEncodeReg(level);
				var dict = getEncodeDict(level);
				return s.replace(reg, function(all) {
						return dict[all];
					});
			},
			/**
			 * @description 删除首尾空格
			 * @param {String} str 原始字符串
			 * @return {String} 处理后字符串
			 * @example
			 * 		$.str.trim('  somestring... ');
			 */
			 trim : function (str){
				str += '';
				var str = str.replace(/^\s+/, ''),
						ws   = /\s/,
						end = str.length;
				while(ws.test(str.charAt(--end)));
				return str.slice(0, end + 1);
			},
			/**
			 * @description 返回字符串字节数
			 * 
			 * @param {String} str 输入字符串
			 * @return {String} [len=2] 字节数(一个中文字符被当做两个英文字符长度处理)
			 * @example
			 * 		$.str.lenb('abc一二三');
			 */
			 byteLen : function (str, len){
				//正则取到中文的个数，然后len*count+原来的长度。不用replace
				var factor = len || 2;
				str += '';
				var tmp = str.match(/[^\x00-\xff]/g) || [];
				
				var count = tmp.length;
				return str.length + (factor-1)*count;
			},
			/**
			 * 在字符串左侧填充指定字符至指定宽度 (该方法对于标准化数字或日期格式非常有用)
			 * 
			 * @param {String} input 原始字符串
			 * @param {String} width 要填充到的指定宽度
			 * @param {String} [filler=""] 填充字符
			 * @return {String} 处理后字符串
			 * @example
			 * 		$.str.leftPad("12",3,'0');
			 */
			 leftPad : function(input,width,filler){
				var str = input.toString();// +''
				(typeof(filler)=="undefined") && (filler = " ");
				while(str.length<width){
					str = filler + str;
				}
				return str;
			},
			/**
			 * 字符串反转
			 * 
			 * @param {String} str 原始字符串
			 * @return {String} 处理后字符串
			 * @example
			 * 		$.str.reverse("上海自来水");
			 */
			 reverse : function(str){
				 str += '';
				return str.split("").reverse().join("");
			 },
			/**
			 * @日期格式化
			 *
			 * @param {String} pattern 日期格式 (格式化字符串的符号参考w3标准 http://www.w3.org/TR/NOTE-datetime)
			 * @param {Date Object} date 待格式化的日期对象
			 * @return {String} 格式化后的日期字符串
			 * @example
			 * 		$.str.formatDate("YYYY-MM-DD hh:mm:ss", (new Date()));
			 */
			 formatDate : function(pattern,date){
				function formatNumber(data,format){//3
					format = format.length;
					data = data || 0;
					//return format == 1 ? data : String(Math.pow(10,format)+data).substr(-format);//IE6有bug
					//return format == 1 ? data : (data=String(Math.pow(10,format)+data)).substr(data.length-format);
					return format == 1 ? data : String(Math.pow(10,format)+data).slice(-format);
				}
				
				return pattern.replace(/([YMDhsm])\1*/g,  function(format){
					switch(format.charAt()){
						case 'Y' :
							return formatNumber(date.getFullYear(),format);
						case 'M' :
							return formatNumber(date.getMonth()+1,format);
						case 'D' :
							return formatNumber(date.getDate(),format);
						case 'w' :
							return date.getDay()+1;
						case 'h' :
							return formatNumber(date.getHours(),format);
						case 'm' :
							return formatNumber(date.getMinutes(),format);
						case 's' :
							return formatNumber(date.getSeconds(),format);
					}
				});
			},
			/**
			 *  判断字符串是否为url
			 */
			isUrl:function(str){
			var urlReg=new RegExp("^((news|telnet|nttp|file|http|ftp|https)://)(([-A-Za-z0-9]+(\\.[-A-Za-z0-9]+)*(\\.[-A-Za-z]{2,5}))|([0-9]{1,3}(\\.[0-9]{1,3}){3}))(:[0-9]*)?(/[-A-Za-z0-9_\\$\\.\\+\\!\\*\\(\\),;:@&=\\?/~\\#\\%]*)*","g");
				if(urlReg.test(str)){
					return true;
				}else{
					return false;
				}
			}
	
		};
		
	})();
	
	/**
	 * @description 浮点运算
	 * 
	 * 先将操作数和被操作数的小数点右移，化成整数，
	 * 然后进行整数的加减乘除运算，再将结果的小数点左移相应位。
	 * 
	 * 对于加减操作要对齐，而乘除没有这样的要求
	 *
	 * @author fredwu
	 * @date 2011.11.30
	 * @namespace
	 */
	$.f={
		_decimalBit:function(flt){
			var bit=0;
			try{bit=flt.toString().split(".")[1].length;}catch(e){}
			return bit;
		},
		_leftShiftNBit:function(flt){
			return flt.toString().replace(".","");
		},
								 
		/**
		 * 浮点数相加
		 * 
		 * @param {Number} arg1 被加数 
		 * @param {Number} arg2 加数
		 *            
		 * @return {Number} arg1和arg2之和
		 * @example 
		 *		$.f.add(0.8,1.45);
		 */
		 add:function(arg1,arg2){   
		   var r1,r2,m;   
		   r1=this._decimalBit(arg1);
		   r2=this._decimalBit(arg2);
		   m=Math.pow(10,Math.max(r1,r2));
		   return ($.f.mul(arg1,m)+$.f.mul(arg2,m))/m;
		},  
		  
		/**
		 * 浮点数相减
		 * 
		 * @param {Number} arg1 被减数
		 * @param {Number} arg2 减数
		 *
		 * @return {Number} ar1与arg2之差
		 * @example
		 * 		$.f.sub(0.8,1.45);
		 */
		sub:function(arg1,arg2){   
		   var r1,r2,m;   
		   r1=this._decimalBit(arg1);
		   r2=this._decimalBit(arg2);
		   m=Math.pow(10,Math.max(r1,r2));   
		   n=(r1>=r2)?r1:r2;   
		   return (($.f.mul(arg1,m)-$.f.mul(arg2,m))/m).toFixed(n);   
		},  
		  
		/**
		 * 浮点数相乘
		 * 
		 * @param {Number} arg1 被乘数
		 * @param {Number} arg2 乘数
		 *
		 * @return {Number} 积
		 * @example
		 *		$.f.mul(0.8,1.45);
		 */
		mul:function(arg1,arg2)   
		{   
			var m=0;
			m+=this._decimalBit(arg1);
			m+=this._decimalBit(arg2);
			return Number(this._leftShiftNBit(arg1))*Number(this._leftShiftNBit(arg2))/Math.pow(10,m);
		},
		  
		  
		/**
		 * 浮点数相除
		 * 
		 * @param {Number} arg1 被除数
		 * @param {Number} arg2 除数
		 * 
		 * @return {Number} 商
		 * @example
		 *		$.f.div(0.8,1.45);
		 */
		div:function(arg1,arg2){   
			var t1=0,t2=0,r1,r2;   
			t1=this._decimalBit(arg1);
			t2=this._decimalBit(arg2);
			r1=Number(this._leftShiftNBit(arg1));   
			r2=Number(this._leftShiftNBit(arg2));  
			return (r1/r2)*Math.pow(10,t2-t1);   
		}
	};
	
	/**
	 * @description 计算节点的样式，大小，位置等
	 * @author avenwu
	 * @date 2011.11.30
	 * @namespace
	 */
	$.css = function() {
		/**
		 * 判断浏览器是否支持cssFloat属性，如果不是则为styleFloat，
		 * 及判断是否为低于IE9的IE浏览器
		 * @ignore
		 */
		var div = document.createElement('div');
		div.innerHTML = '<div style="float: left;"></div>'+'<!--[if lt IE 8]><div></div><![endif]-->';
		var list = div.getElementsByTagName('div');
		var cssFloat = (list[0] && list[0].style.cssFloat == 'left') ? 'cssFloat' : 'styleFloat';
		var borderJustingWidth = list.length == 2 ? 1 : 0;
		
		//对css属性名称进行转换，转为驼峰式或正常的横杠连接
		var camelPart = /-([a-zA-Z])/g;
		var upperCase = /[A-Z]/g;
		/**
		 * @ignore
		 */
		function fcamelCase($0, $1) {
			return $1.toUpperCase();
		}
		/**
		 * @ignore
		 */
		function fnormalCase($0) {
			return '-' + $0.toLowerCase();
		}
		/**
		 * @ignore
		 * 驼峰化
		 */
		function camelCase(name) {
				return name.replace(camelPart, fcamelCase);
			}
		/**
		 * @ignore
		 * 正常的css属性形式
		 */
		function normalCase(name) {
				return name.replace(upperCase, fnormalCase);
			}
		
		var digitReg = /\d/;
		var pixelReg = /px$/;
		var percentageReg = /%$/;
		var doc = document.documentElement;
		
		var boderWidth = {
				thin: 1 + borderJustingWidth,
				medium: 3 + borderJustingWidth,
				thick: 5 + borderJustingWidth
		};
		var measurementNode = document.createElement('div');
		setStyles(measurementNode,{padding: 0,border: 'none',position: 'absolute',visibility: 'hidden'});
		
		
		/**
		 * 设置css属性值(可设置一组)
		 * @ignore 
		 */
		function setStyles(node,props,value) {
			node = $(node);
			if (node && props) {
				if (typeof props == 'object') {
					for (var i in props) {
						setStyle(node, i, props[i]);
					}
				} else{
					setStyle(node, props, value);
				}
			}
		}
		
			/**
		 * 设置css属性值(一对一设置)
		 * @ignore 
		 */
		function setStyle(node,prop,value) {
			node = $(node);
			if (node) {
				var isIE = $.browser("type")=="msie";
				if(prop==="float"||prop==="cssFloat"){
					prop = isIE ? "styleFloat":"cssFloat";
				}
				if(prop==="opacity"&&isIE&&$.browser("version")<9){
					if(!/^\d*(\.)?\d+$/.test(value*100)){
						report(node, prop, value);
					}
					
					node.style.filter='alpha(opacity="'+value*100+'")';
					if(!node.style.zoom) node.style.zoom=1;
				}
				else{
					if(/px$/.test(value) && !/^-?\d*(\.)?\d+px$/.test(value)){
						report(node, prop, value);
					}
					node.style[prop]=value;
				}
			}
		}
		//添加样式设置错误上报
		function report(node, prop, val){
			if(Math.ceil(Math.random() * 100) > 30) return;
			var arr = [];
			arr.push("--execption catch--");
			arr.push("id:" + node.id);
			arr.push("tagName:" + node.tagName);
			arr.push("className:" + node.className);
			arr.push("prop:" + prop);
			arr.push("val:" + val);
			$.badjs(arr.join(),　"simple.js", 0, 0);
		}
		
		/**
		 * 对一些非像素的度量转化为像素
		 * @ignore
		 */
		function convertToPixel(node, value){
			  if (!digitReg.test(value) || pixelReg.test(value)) {
				  return value;
			  }
			  node = $(node);
			  //如果为百分比，则必须用特殊的方法，因为改变子节点的大小可能会影响父元素的大小
			  if (percentageReg.test(value)) {
				  node.parentNode.appendChild(measurementNode);
				  setStyle(measurementNode,'width',value);
				  var width = measurementNode.offsetWidth;
				  node.parentNode.removeChild(measurementNode);
				  return width + 'px';
			  }
			  //http://erik.eae.net/archives/2007/07/27/18.54.15/#comment-102291
			  var style = node.style;
			  var left = style.left;
			  var rsLeft = node.runtimeStyle.left;
			  node.runtimeStyle.left = node.currentStyle.left;
			  style.left = '1em';	//@2012-09-27 将value改为1em
			  var px = style.pixelLeft;
			  style.left = left;
			  node.runtimeStyle.left = rsLeft;
			  return px;
		}
		/**
		 * 计算IE9以下所有IE浏览器的样式
		 * @ignore
		 */
		function getCurrentStyle(node,prop) {
			node = $(node);
			var value;
			/**
			 * 如果为float，则必须转为cssFloat，或styleFloat(看哪个支持)，
			 * 且属性名称必须为驼峰式
			 */
			if (prop == 'float') {
				prop = cssFloat ? 'cssFloat' : 'styleFloat';
			}  else {
				prop = camelCase(prop);
			}
			value = node.style[prop] || node.style[prop];
			if (!value) { 
				//对opacity属性需要特殊处理
				if (prop == 'opacity') {
					try {
						value = node.filters['DXImageTransform.Microsoft.Alpha'].opacity;
						//为了兼容其它浏览器
						value = value/100;
					} catch (e) {
						try {
							value = node.filters('alpha').opacity;
							//为了兼容其它浏览器
							value = value/100;
						} catch (err) {}
					}
					value = (value == undefined) ? 1 : value;
				} else if (node.currentStyle) {
					value = node.currentStyle[prop];
				}
			}
			
			return value;
		}
		/**
		 * 计算除IE9以下的所有浏览器的样式，如果有度量样式，则返回px值
		 * @ignore
		 */
		function getComputedStyle(node,prop) {
			node = $(node);
			
			//该方法的css属性必须为正常的横杠连接方式，否则无法正确取值
			var ret = document.defaultView.getComputedStyle(node, null);
			return ret && ret.getPropertyValue(normalCase(prop));
		}
		/**
		 * 判断浏览器是否具有getComputedStyle方法
		 * @ignore
		 */
		var supportedComputedStyle = !!(document.defaultView
				&& document.defaultView.getComputedStyle);
		
		/**
		 * 获取文档树的根节点
		 * @ignore
		 */
		var rootDoc = 0;
		var getRootDoc = function(){
			return rootDoc ? rootDoc : rootDoc = document.compatMode == 'CSS1Compat' ? document.documentElement : document.body;
		}
		return {
			/**
			 * 获取节点的样式，IE9以下的IE浏览器获得的是该节点的原始样式，
			 * 其它浏览器将获取计算后的样式
			 * 
			 * @param {Object} node dom对象或dom的id
			 * @param {String} prop 属性名称
			 * @return prop属性对应的样式值
			 */
			getOriginalStyle: supportedComputedStyle ? getComputedStyle : getCurrentStyle,
			/**
			 * 获取计算后的样式，即如果可以用px度量的，则返回px像素
			 * 
			 * @param {Object} node dom对象或dom的id
			 * @param {String} prop 属性名称
			 * @return prop对应的计算后的样式值
			 *
			 * 说明：如果prop='width'('height'),则将获取
			 * 该节点的内容部分的宽度（高度），不包括填充部分，及边框
			 */
			getComputedStyle : function(node, prop) {
				if (supportedComputedStyle) {
					return getComputedStyle(node,prop);
				}
				if (prop == 'width') {
					var width = this.getClientWidth(node)
							- (parseInt(this.getComputedStyle(node, 'paddingLeft')) || 0)
							- (parseInt(this.getComputedStyle(node, 'paddingRight')) || 0);
					return  (width < 0 ? 0 : width) + 'px';
				}
				
				if (prop == 'height') {
					var height = this.getClientHeight(node)
							- (parseInt(this.getComputedStyle(node, 'paddingTop')) || 0)
							- (parseInt(this.getComputedStyle(node, 'paddingBottom')) || 0);
					return (height < 0 ? 0 : height) + 'px';
				}
				
				//直接用css样式计算width，height有问题
				var value =convertToPixel(node,getCurrentStyle(node,prop));
				 if (digitReg.test(value)) {
					  return value;
				  }
				 
				 if (prop == 'border') {
					 return boderWidth[value] || value;
				 }
				
				return value;
			},
			/**
			 * @description设置节点的内联样式
			 * @param {Object | String} node dom对象或dom的id
			 * @param {String} props 如果props为对象，则该对象的所有属性将当成内联样式批量设置
			 * 		  		如果props为string，则当成内联样式的属性名称
			 * @param {String} value 内联样式的值，如果props为对象则该值将被忽略
			 */
			setStyle: function(node,props,value) {
				setStyles(node,props,value);
			},
			/**
			 * @description 获取页面的垂直滚动距离
			 * 
			 * @return 当前页面的垂直滚动距离
			 */
			getPageScrollTop: function() {
				return window.pageYOffset || doc.scrollTop  || document.body.scrollTop || 0;
			},
			/**
			 * @description 获取页面的水平滚动距离
			 * 
			 * @return 当前页面的水平滚动距离
			 */
			getPageScrollLeft: function() {
				return window.pageXOffset || doc.scrollLeft || document.body.scrollLeft || 0;
			},
			/**
			 * @description 获取当前鼠标的位置，一般用在鼠标事件的监听函数中调用
			 * 
			 * @param {Object} e 鼠标事件对象
			 * @return {
			 * 				left: 鼠标离页面左上角的水平距离,
			 * 				top:  鼠标离页面的左上角垂直距离
			 *         }
			 */
			getPointerPosition: function(e) {
				e = e || window.event;
				return {
						left: e.pageX || (e.clientX + this.getPageScrollLeft()),
						top: e.pageY || (e.clientY + this.getPageScrollTop())
						};
			},
			/**
			 * @description 获取节点在页面中的位置
			 * 
			 * @param {object | String} node dom对象或dom的id
			 * @return {
			 * 			left: 节点离页面左上角的水平距离,
			 * 			top: 节点离页面的左上角垂直距离
			 * 			}
			 */
			getOffsetPosition: function(node){
				node = $(node);
				var top = 0, left = 0;
				// 这里只检查document不够严谨, 在el被侵染置换(jQuery做了这么恶心的事情)
				// 的情况下, node.getBoundingClientRect() 调用会挂掉
				if ( doc.getBoundingClientRect  && node.getBoundingClientRect){// 现在IE，firefox3，chrome2，opera9.63都支持这个属性。
					var box = node.getBoundingClientRect(); 
					var clientTop = doc.clientTop || document.body.clientTop || 0; 
					var clientLeft = doc.clientLeft || document.body.clientLeft || 0;
					top  = box.top  + this.getPageScrollTop() - clientTop,
					left = box.left + this.getPageScrollLeft() - clientLeft;
				}else{// 这里只有safari执行。
					do{
						top += node.offsetTop || 0;
						left += node.offsetLeft || 0;
						node = node.offsetParent;
					} while (node);
			  }
				return {left:left, top:top};    
			},
			/**
			 * @description 获取节点的宽度，包括内容宽度，填充宽度，边框的宽度
			 * 
			 * @param {Object | String} node dom对象或dom的id
			 * @return ｛Number｝ 节点的宽度
			 */
			getWidth: function(node) {
				return $(node).offsetWidth;
			},
			/**
			 * @description 获取节点的宽度，包括内容高度，填充高度，边框的高度
			 * 
			 * @param {Object | String} node dom对象或dom的id
			 * @return {Number} 节点的高度
			 */
			getHeight: function(node) {
				return $(node).offsetHeight;
			},
			/**
			 * @description 获取节点的宽度，包括内容宽度，填充宽度，但不包括边框的宽度
			 * 
			 * @param {object | String} node dom对象或dom的id
			 * @return  {Number} 节点的宽度
			 * @see getComputedStyle
			 */
			getClientWidth: function(node) {
				node = node ? $(node) : getRootDoc();
				var width = node.clientWidth;
				if (!width) {
					width = this.getWidth(node)
							- (parseInt($.css.getComputedStyle(node, 'borderLeftWidth')) || 0) 
							- (parseInt($.css.getComputedStyle(node, 'borderRightWidth')) || 0);
				}
				width = width<0 ? 0 :width;	//当节点隐藏，this.getWidth(node)为0，border不一定为0，得到的width<0
				return width;
			},
			/**
			 * @description 获取节点的宽度，包括内容高度，填充高度，但不包括边框的高度
			 * 
			 * @param {object | String} node dom对象或dom的id
			 * @return  {Number} 节点的高度
			 * @see getComputedStyle
			 */
			getClientHeight: function(node) {
				node = node ? $(node) : getRootDoc();
				var height = node.clientHeight;
				if (!height) {
					height = this.getHeight(node)
							- (parseInt($.css.getComputedStyle(node, 'borderTopWidth')) || 0)
							- (parseInt($.css.getComputedStyle(node, 'borderBottomWidth')) || 0);
				}
				return height;
			},
			/**
			 * @description 获取页面的宽度
			 * 
			 * @return 页面的宽度
			 */
			getPageWidth: function() {
				var body = document.body;
				return Math.max(doc.clientWidth, body.clientWidth, doc.scrollWidth, body.scrollWidth);
			},
			/**
			 * @description 获取页面的高度
			 * 
			 * @return 页面的高度
			 */
			getPageHeight: function() {
				var body = document.body;
				return Math.max(doc.clientHeight, body.clientHeight, doc.scrollHeight, body.scrollHeight);
			},
			/**
			 * @description 获取文档树的根节点
			 * 
			 * @return 文档树的根节点
			 */
			getDocumentElement: getRootDoc,
			/**
			 * getPageWidth()获取的是页面的滚动宽度，
			 * 下面方法获取的是页面不包含滚动条的宽度，即获取的是可视宽度
			 * @return {Number} body的宽度
			 */
			getBodyWidth: function() {
				return getRootDoc().clientWidth;
			},
			/**
			 * 同上
			 * @return {Number} body的高度
			 */
			getBodyHeight: function() {
				return getRootDoc().clientHeight;
			},
			/**
			 * @description 显示某个元素
			 *
			 * @param {Object} element dom元素
			 * @example
			 * 		$.css.show(dom);
			 */
			show : function(element,display){
				var old;
				old = (old=element.getAttribute("_oldDisplay")) ? old : $.css.getComputedStyle(element,"display");
				display ? (element.style.display = display) : (old==="none") ? element.style.display="block" : element.style.display=old;
				//element.style.display = "";
				//if(element.tagName.toLowerCase() == "tr")element.style.display = "table-row";
			},
			/**
			 * @description 隐藏某个元素
			 *
			 * @param {Object} element dom元素
			 * @example
			 * 		$.css.hide(dom);
			 */
			hide : function(element){
				var old = $.css.getComputedStyle(element,"display");
				element.getAttribute("_oldDisplay") || (old === "none" ? element.setAttribute("_oldDisplay", "") : element.setAttribute("_oldDisplay", old));
				element.style.display="none";
			},
			/**
			 * @description 返回某个元素是否显示
			 *
			 * @param {Object} element dom元素
			 * @example
			 * 		$.css.isShow(dom);
			 */
			isShow : function(element){
				//return element.style.display === "none" ? false : true;
				return $.css.getComputedStyle(element,'display') === 'none' ? false : true;
			},
			/**
			 * @description 是否有样式名
			 *
			 * @param {Object} obj html对象
			 * @param {String} n 名称 
			 * @return {Boolean}
			 * @example
			 * 		$.css.addClass($('test'),'f-hover');
			 */
			hasClass:function(obj,n){
				if(!obj.className) return false;
				var name = obj.className.split(' ');
				for (var i=0,len=name.length;i<len;i++){
					if (n==name[i]) return true;	
				}
				return false;
			},
			/**
			 * 添加样式名
			 *
			 * @param {Object} obj html对象
			 * @param {String} n=名称 
			 * @example
			 * 		$.css.addClass($('test'),'f-hover');
			 */
			addClass:function(obj,n){
				 $.css.updateClass(obj,n,false);
			},
			/**
			 * 删除样式名
			 *
			 * @param {Object} obj html对象
			 * @param {String} n=名称 
			 * @example
			 * 		$.css.addClass($('test'),'f-hover');
			 */
			removeClass:function(obj,n){
				$.css.updateClass(obj,false,n);
			},
			/**
			 * 更新样式名
			 *
			 * @param {Object} obj html对象
			 * @param {String} addClass
			 * @param {String} removeClass, 
			 * @example
			 * 		$.css.addClass($('test'),'f-hover asdf','remove1 remove2');
			 */
			updateClass:function(obj,addClass,removeClass){
				var name = obj.className.split(' ');
				var objName = {}, i=0, len = name.length;
				for(;i<len;i++){
					name[i] && (objName[name[i]] = true);	
				}
				
				if (addClass){
					var addArr = addClass.split(' ');
					for(i=0,len=addArr.length;i<len;i++){
						addArr[i] && (objName[addArr[i]] = true);	
					}			
				}
	
				if (removeClass){
					var removeArr = removeClass.split(' ');
					for(i=0,len=removeArr.length;i<len;i++){
						removeArr[i] && (delete objName[removeArr[i]]);	
					}			
				}
				
				var res = [];
				for (var k in objName){
					res.push(k);
				}
				
				obj.className = res.join(' ');
			},
			/**
			 * 设置样式(直接覆写className)
			 *
			 * @param {Object} obj html对象
			 * @param {String} 要设置的样式 
			 * @example
			 * 		$.css.setClass($('test'),'f-hover asdf');
			 */
			setClass:function(obj,className){
				obj.className = className;
			}
		};
	}();
	
	/**
	 * @description 属性相关--模仿jQuery的设置方式
	 * 
	 * @param {Object} obj 设置属性的dom元素
	 * @param {String} name 属性名
	 * @param {String} value 属性值
	 * 
	 */
	$.set = function(obj,name,value){
		if(!value){
			return obj.getAttribute(name);	
		}
	} 
	
	/**
	 * @description 面向对象相关方法(类,继承,观察者...)
	 * 
	 * @author knightli
	 * @date 2011.12.29
	 * @namespace
	 */
	$.oop = {
		
		/**
		 * @description 继承
		 * @public
		 * @param {Object} baseObj 基础对象
		 * @param {Object} override_objs 覆盖对象,可有多个该参数跟在第一个参数后面, 用来覆盖第一个参数的基础对象中的一些属性
		 * @returns {String} 继承后的对象
		 * @example
		 * 		例1:
		 *			$.oop.extend({prop1:"prop1-value", prop2:"prop2-value"});
		 * 		例2:
		 * 			var myObj = $.oop.extend({}, baseObj, {prop1:"prop1-value", prop2:"prop2-value"}, {func1:function(){},fucn2:function(){}});
		 * 		例3:
		 * 			var myObj = {myprop1:"prop1-value", myfunc1:function(){}};
		 * 			myObj = $.oop.extend(myObj, baseObj, {prop1:"prop1-value", prop2:"prop2-value"}, {func1:function(){},fucn2:function(){}});
		 * @example
		 * 说明:
		 *     该函数存在两种调用方式:
		 *     (1) 传一个参数. 结果就是将baseObj中的属性添加到$.oop空间下.返回值是$.oop这个对象  比如:
		 *            $.oop.extend({prop1:"prop1-value", prop2:"prop2-value"});
		 *            执行结果是将prop1和prop2加入到$.oop下面.
		 *            这种调用方式并不太常见, 一般用于临时往simple库的oop空间下插入方法和属性
		 *     (2) 传两个或更多参数. 结果是将第2个参数往后的对象中的属性,覆写到第一个参数baseObj中,然后将baseObj返回. 如:
		 *            var myObj = $.oop.extend(baseObj, {prop1:"prop1-value", prop2:"prop2-value"}, {prop1:"prop1-value1", func1:func1,fucn2:fucn2);
		 *            执行结果是将第2,3个参数中的属性, 写入targetObj后,返回targetObj给myObj.
		 *            这里需要注意两点:
		 *              a) 若baseObj中的属性若在后面的参数对象中也存在, 则后面的会覆写前面的.
		 *                   比如在上例中, 如果baseObj在执行前是{prop0:"prop0-basevalue", prop1:"prop1-basevalue", func1:baseFunc}
		 *                   执行后: myObj=baseObj={prop0:"prop0-basevalue",prop1:"prop1-value1",prop2:"prop2-value",func1:func1,fucn2:fucn2}
		 *              b) 最终变量myObj其实就是baseObj的引用. 而这个baseObj如果传入的也是一个引用,事实上这个引用的对象已经被修改掉了.
		 *                   这也许与你的预期不符: 我只是想要把baseObj作为父类, 让myObj去继承它, 并不想修改掉baseObj.
		 *                   如果是这样,那么这里应该这么调用:
		 *                   var myObj = $.oop.extend({}, baseObj, {prop1:"prop1-value", prop2:"prop2-value"}, {func1:function(){},fucn2:function(){}});
		 *                   使用空对象作为第一个参数, 就可以避免这种问题.
		 *                   或者myObj已经有一些属性了,就这么调用:
		 *                   var myObj = {myprop1:"prop1-value", myfunc1:function(){}};
		 *                   myObj = $.oop.extend(myObj, baseObj, {prop1:"prop1-value", prop2:"prop2-value"}, {func1:function(){},fucn2:function(){}});
		 *                   使用对象自身作为第一个参数, 也可以避免这种问题
		 *            
		 */
		extend : function(target){
			var isObject = function(o){
				return o && String(o) !== "[object HTMLDivElement]" && o.constructor === Object || String(o) === "[object Object]";
			};
			
			var isArray = function(a){
				return a && String(a) !== "[object HTMLDivElement]" && a.constructor === Array || Object.prototype.toString.call(a) === "[object Array]";
			};
			
			var isFunction = function(f){
				return f && f.constructor === Function;
			};
			
			var i;
			if(arguments.length==1){
				target = this;
				i = 0;
			}
			else{
				target = arguments[0];
				i = 1;
			}
			var deepCopy = true;
			if(typeof arguments[arguments.length-1] == 'boolean'){
				deepCopy = arguments[arguments.length-1];
			}
			//将参数的各种覆盖属性添加到target上
			while(i<arguments.length){
				var tmp = arguments[i];
				for(p in tmp){
					var tp = target[p];
					var argp = tmp[p];
					if(tp!==argp){
						//若参数的属性为对象, 则进行深拷贝(迭代)
						if(deepCopy && argp && isObject(argp) && !isArray(argp) && !argp.nodeType && !isFunction(argp)){
							tp = target[p]||{};
							target[p] = $.oop.extend(tp, argp || (argp.length==null?{}:[]))
						}
						else{
							//否则对非空属性直接进行浅拷贝
							if(argp!==void 0){
								target[p] = argp;
							}
						}
					}
				}
				i++;
			}
			return target;
		},
		/**
		 * @description 创建类
		 * @public
		 * @param {Object} [extendCfg] 可选参数, 传送该参数时,说明创建的这个类是某个类的子类.
		 *              extendCfg格式: {extend: superObj} 或者 {extend: superClass}
		 * @param {Object} argObj 要创建的类的对象原型. 其中包含的属性和方法将成为该类的原型属性和原型方法
		 * @returns {String} 创建的Class
		 * @example
		 *     该函数存在两种调用方式:
		 *     (1) 只传argObj. 结果是创建一个类, 以argObj为原型. 例如:
		 *            var SuperMan = new $.oop.Class({
		 *                init:function(name){
		 *                    this.name = name;
		 *                },
		 *                getName:function(){
		 *                    return this.name;
		 *                },
		 *                eat:function(){
		 *                    //eat
		 *                },
		 *                walk:function(){
		 *                    //walk
		 *                },
		 *                say:function(str){
		 *                    alert(str);
		 *                }
		 *            });
		 *            接下来就可以创建SuperMan的实例并调用其中的方法了.
		 *            var god = new SuperMan("god"); //注意这里new myClass1,会自动执行类的init方法,传入new的参数
		 *            M.say("Let there be light!");
		 *            
		 *     (2) 先传{extend:supperClass}, 再传argObj. 结果是创建一个类, 其原型先继承supperClass中的属性和方法,再用argObj中的属性和方法去覆盖. 接上例:
		 *            var Man = new $.oop.Class({extend:SuperMan},{
		 *                init:function(name){
		 *                    this.name = name;
		 *                    this.sex = "male";
		 *                },
		 *                intro:function(){
		 *                    this.say("[man voice]My name is "+this.name+", I'm a "+this.sex);
		 *                }
		 *            });
		 *            var Woman = new $.oop.Class({extend:SuperMan},{
		 *                init:function(name){
		 *                    this.name = name;
		 *                    this.sex = "female";
		 *                },
		 *                intro:function(){
		 *                    this.say("[woman voice]My name is "+this.name+", I'm a "+this.sex);
		 *                },
		 *                childBirth:function(sex,name){
		 *                    if(!this.children) this.children = [];
		 *                    var baby = null;
		 *                    if(sex=="male") baby = new Man(name);
		 *                    else if(sex=="female") baby = new Woman(name);
		 *                    baby.mom = this;
		 *                    this.children.push(baby);
		 *                    return baby;
		 *                }
		 *            });
		 *            接下来就可以创建Man,Woman的实例并调用其中的方法了.
		 *            var adam = new Man("Adam");
		 *            var eve = new Man("Eve");
		 *            var abel = eve.childBirth("male","Abel");
		 *            var cain = eve.childBirth("male","Cain");
		 */
		Class : function(){
			var argLen = arguments.length;
			var argObj = arguments[argLen-1];
			argObj.init=argObj.init||function(){};
			
			/**
			 * Class在new的时候会默认执行init
			 * @ignore
			 */
			var retObj = function(){return this.init.apply(this, arguments);}//retObj在new的时候会默认执行init.
			
			//两个参数: 第一个参数是继承的对象, 第二个参数是定义的类原型
			if(argLen===2){
				var extObj = arguments[0].extend;//第一个参数可以是{extend:xxx},表明要从某个对象继承
				var f=function(){};//代理对象,隔离extObj和retObj,避免new一次extObj.
				f.prototype = extObj.prototype;
				
				retObj.superClass = extObj.prototype;//添加一个superClass属性, 保存父类的原型
				/**
				 * 子类可以通过callSuper调用父类的方法
				 * @ignore
				 */
				retObj.callSuper = function(thisObj, func){
					var s = Array.prototype.slice;
					var args = s.call(arguments,2);//需要传给super方法的参数数组
					func = retObj.superClass[func];
					if(func){
						func.apply(thisObj, args.concat(s.call(arguments)) );//在thisObj上调用super方法
					}
				}
				retObj.prototype = new f();//通过代理对象f,让retObj原型继承extObj
				retObj.prototype.constructor = retObj;
				$.oop.extend(retObj.prototype, argObj);//然后再用继承方法,将argObj的方法加入retObj的原型中
				/**
				 * @ignore
				 */
				retObj.prototype.init = function(){
					argObj.init.apply(this, arguments);
				}
			}
			//一个参数: 该参数就是类原型
			else if(argLen===1){
				retObj.prototype = argObj;
			}
			return retObj;
		},
		/**
		 * @description 为调用函数绑定一个作用域(因为this很容易跟丢它原来所在的作用域，直接指向顶层的window对象)
		 *
		 * @param {Function} fn 要绑定的调用函数
		 * @param {Object} context 要绑定的作用域对象, 绑定后函数的this指针即为该对象
		 * @example
		 * 		$.oop.bind(myFunc, this);
		 */
		bind: function(fn,context){
			var s = Array.prototype.slice;
			var args = s.call(arguments,2);
			return function(){
				return fn.apply(context, args.concat(s.call(arguments)));
			}
		},
		/**
		 * @description 添加关注. 用于关注某对象的某事件,并在触发时引发参数给定的回调
		 *
		 * @param {Object} target 被观察对象
		 * @param {String} e 被观察事件名称, 表明要观察对象的哪个行为
		 * @param {Function} cbk 回调函数. 当被观察对象的上述行为触发时(一般由被观察对象通过notifyObservers触发),引发的回调函数
		 * @example
		 * 		$.oop.addObserver(targetObj, "changeName", function(newName){setNewName(newName);});
		 */
		addObserver: function(target, e, cbk){
			if (cbk) {
				e = "on" + e;
				
				if (!target._$events) target._$events = {};
				
				if(e in target._$events){
					if(target._$events[e].length == 0){
						target._$events[e] = [];
					}
				}
				else{
					target._$events[e] = [];
				}
					
				var evts = target._$events[e];
				var m = -1;
				for(var i = 0,len=evts.length; i < len; i++){
					if (evts[i] == cbk) {
						m = i;
						break;
					}
				}
				if(m===-1) evts.push(cbk);
			}
			else{
				
			}
		},
		/**
		 * @description 通知关注者们,某被观察对象的某行为发生. 用于触发关注者们自己设置的一些回调函数
		 *
		 * @param {Object} target 发生行为触发事件的对象
		 * @param {String} e 发生行为对应的事件名称. 这个值应该和添加关注时设置的事件名称保持一致,才能正确触发回调
		 * @param {Object} param 参数. 引发回调函数的输入参数
		 * @example
		 * 		$.oop.notifyObservers(targetObj, "changeName", "newName");
		 */
		notifyObservers: function(target, e, param){
			var ret = true;
			e = "on" + e;
			if(target._$events && target._$events[e]){
				var evts = $.oop.extend([],target._$events[e]);
				for(var i=0,len=evts.length; i<len; i++){
					var r = evts[i].apply(target, [param]);
					if(r===false) ret = false;
				}
				evts = null;
			}
			return ret;
		},
		/**
		 * @description 移除关注. 根据传入的参数, 将对应的关注从目标对象的关注列表上移除
		 *
		 * @param {Object} target 被观察对象
		 * @param {String} e 被观察事件名称, 表明要观察对象的哪个行为
		 * @param {Function} cbk 回调函数.
		 * @example
		 * 		$.oop.removeObserver(targetObj, "changeName");
		 */
		removeObserver: function(target, e, cbk) {
			var i, len;
			var d = false;
			var events = target._$events;
			//如果传了cbk和e,则根据e找到对应的观察者回调集合,只将集合中该cbk回调移除
			if (cbk && e) {
				if (events && (evts = events["on" + e])) {
					for (i = 0,len = evts.length; i < len; i++){
						if (evts[i] == cbk){
							evts[i] = null;
							evts.splice(i, 1);
							d = true;
							break
						}
					}
				}
			}
			//若只传了e,没有传cbk,则将e对应的观察者回调集合中的所有回调移除
			else if(e){
				if (events && (e = "on" + e, evts = events[e])) {
					len = evts.length;
					for (i = 0; i < len; i++) evts[i] = null;
					delete events[e];
					d = true;
				}
			}
			//若cbk和e都没有传,则把target的events中所有回调集合均移除
			else if (target && events) {
				for (i in events) delete events[i];//TODO: 这里是否还需要加一个循环,将events[i]中的evts置null?
				delete target._$events;
				d = true;
			}
			return d;
		}
	}
	
	/**
	 * @description window.name相关的运用
	 *
	 * @author franckfang
	 * @date 2011.12.29
	 * @namespace
	 */
	$.winName = {
		/**
		 * 设置window.name
		 *
		 * @param {String} n 名称
		 * @param {String} v 值
		 * @example
		 *         $.winName.set('type',1);
		 */
		set:function (n, v) {
			var name = window.name || "";
			v = encodeURIComponent(v);
			if (name.match(new RegExp(";" + n + "=([^;]*)(;|$)"))) {//先验证是否存在
				window.name = name.replace(new RegExp(";" + n + "=([^;]*)"), ";" + n + "=" + v);
			} else {
				window.name = name + ";" + n + "=" + v;
			}
		},
		/**
		 * 获取window.name
		 *
		 * @param {String} n 名称
		 * @return {String} window.name值
		 * @example
		 *         $.winName.get('type');
		 */
		get:function (n) {
			var name = window.name || "";
			var v = name.match(new RegExp(";" + n + "=([^;]*)(;|$)"));
			return  decodeURIComponent(v ? v[1] : "");
		},
		/**
		 * 删除指定window.name
		 *
		 * @param {String} n 名称
		 * @example
		 *         $.winName.remove('type');
		 */
		remove:function (n) {
			var name = window.name || "";
			window.name = name.replace(new RegExp(";" + n + "=([^;]*)"), "");
		},
		/**
		 * 清空window.name
		 *
		 * @example
		 *         $.winName.clear();
		 */
		clear:function () {
			window.name = "";
		}
	};
	//异步加载文件
	(function(){
		var $ = window.$ || (window.$ = {});
		var http = $.http || ($.http = {});
		var file = (function(){
			/**
			 * 异步加载
			 *
			 * @param {String} url 路径
			 * @param {Function} callback 回调函数
			 * @return 
			 * @example
			 * 		$.http.file('http://4.url.cn/q/js/0/simple.js');
					$.http.file('http://4.url.cn/css/0/style.css')
			 */
			var init = function(url,callback,checkback){
				var _type = type(url);
				if(_type.tag){//存在
					var head = _type.tag == 'script'?document.body : (document.getElementsByTagName('head')[0] || document.documentElement);
					loadFile(head,url,_type.tag,callback,checkback);
				}
				return true;
			}
			/**
			 * 文件加载处理
			 * @param {String} head 头部节点
			 * @param {String} url 路径
			 * @param {String} tag 回调函数
			 * @return 
			 */
			var loadFile = function(head,url,tag,callback,checkback){
				var _file = create(url,tag);
				if(_file){
					jsonp(head,_file,callback,checkback);	
					head.appendChild(_file);
					return _file;
				}else{
					return false;
				}
			}
			
			/**
			 * 异步加载处理
			 * @param {String} head 头部节点
			 * @param {Object} obj 对象
			 * @return 
			 */
			var jsonp = function(head,obj,callback,checkback){
				//加载文件
		
				obj.onload = obj.onreadystatechange = function(){
					if(!this.ok && (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete')){
						this.ok = true;
						if(typeof callback == 'function'){
							callback();
						}	
						// Handle memory leak in IE
						obj.onload = obj.onreadystatechange = null;
						/*if(obj.parentNode){
							$.dom.remove(obj);
						}*/
					}
				}
		
				//chrome safari 解决link 不支持 onload属性
				if(obj.tagName == 'LINK' && typeof checkback == 'function' && ( $.browser('type') == 'webkit' || $.browser('type') == 'ff')){
					var jsLoadTimer;
					(function (){
						var callee = arguments.callee;
						//console.log(jsLoadTimer, obj.href,"+++++");
						jsLoadTimer = setTimeout(function(){
							if(obj.ok){
								window.clearTimeout(jsLoadTimer);//15秒之后清楚定时器
							}else{
								if(checkback()){
									obj.ok = true;
									if(typeof callback == 'function'){
										callback();
									}
								}else{
									callee();
								}
							}	
						},100);
					})();
					
					window.setTimeout( function(){
						//console.log(jsLoadTimer ,obj.href);
						window.clearTimeout(jsLoadTimer);//15秒之后清楚定时器
					},15000);
				}
			}
			/**
			 * 创建节点
			 * @param {String} url  路径
			 * @param {String} type 类型
			 * @return 
			 */
			var create = function(url,type){
				switch (type) {  
					case 'script':  
						var script = document.createElement(type);  
						script.setAttribute('language', 'javascript');  
						script.setAttribute('type', 'text/javascript');  
						script.setAttribute('src', url);  
						return script;
						break;  
					case 'link':  
						var css = document.createElement(type);  
						css.setAttribute('type', 'text/css');  
						css.setAttribute('rel', 'stylesheet');  
						css.setAttribute('href', url);  
						return css;
						break;  
					default:  
						return false;  
						break  
				}
			}
			/**
			 * 获取加载路径的类型
			 * @param {String} url  路径
			 * @return 
			 */
			var type = function(url){
				//获取文件的类型
				url = url.replace(/^\s|\s$/g,'');
				var _ma;
				if(/\w+$/.test(url)){//有字符串			
					_ma = url.match(/([^\/\/]+)\.(\w+[^?#])(\?[\w\W]*)?(#[\w\W]*)?$/);
					if(_ma){
						var _return = {
							filename: _ma[1],  
							ext: _ma[2]
						};
						switch(_ma[2]){
							case 'js':
								_return.tag = 'script';
								break;
							case 'css':
								_return.tag = 'link';
								break;
							default:
								_return.tag = null;
								break;
						}	
						return _return;
					}else{
						return {
							filename: null,  
							ext: null,
							tag: null
						};
						
					}
				}else{
					_ma = data.match(/([^\/\/]+$)/);
					return {
						filename: _ma?_ma[1]:null,
						tag: null,  
						ext: null
					};
				}
			}
			return init
		})();
		http.file = file;//设置加载
	}).call(this);
	
	//})();
	/**
	 * @description 各种工具函数
	*/
	/* $.util = function(){
		var class2Type = {};
		$.array.forEach('Number String Boolean Array Function RegExp Object Date'.split(' '),function(item,index){
			class2Type['[object '+ item+']'] = item.toLowerCase();
		});
		return {
			type: function(obj){　　//jquery里NaN类型没做特殊判断，$.type(NaN)输出为'number'，有点不理解
				return ( obj == null || isNaN(obj) ) ? String(obj).toLowerCase() :
														class2Type[Object.prototype.toString.call(obj)] || 'object';
			},
			isArray: function(obj){
				return this.type(obj) === 'array';
			},
			isNumber: function(obj){
				return this.typeof(obj) === 'number';
			}
		};	
	}(); */
	
	/**
	* @description ISD测速上报封装方法
	* 使用方法:
	* 	(1) 如果需要从html载入处就开始记录, 则在记录点前需要加入core代码段; 其他情况下只需要先引入本js文件即可.
	*	(2) 在记录点处, 使用TRecord.push(name,desc)来记录某个测速项的时间点. name是测速项的名称, desc是该测速点的描述字符串
	*	(3) 在需要上报的地方, 使用TRecord.report(url,name,map,factor)来上报测速数据
	*		report各参数含义:
	*			- url	上报前置字串. 是isd测速系统中上报项申请后, 系统给出的一个字符串. 比如: "flag1=1234&flag2=5&flag3=6"
	*			- name	上报项名称. 需要和push记录时间点时的name参数保持一致. 比如: "main"
	*			- map	此map映射表给出要上报哪些测速点, 对应的上报系统id是多少. 比如:
	*				{
	*					"css_load": 1,
	*					"dom_load": 2,
	*					"js_load": 3
	*				}
	*			- factor	上报率. 如果一个页面访问量非常大, 为了减小上报系统的负荷, 一般会设置一个比例. 如设置比例为50, 则表示50%几率上报数据
	*		根据以上参数, 将会拼接一个地址发起请求. 以上面例子中的参数来拼接, 拼接过程如下:
	*				"http://isdspeed.qq.com/cgi-bin/r.cgi?" +  //这是测速上报的基础url,不变
	*				"flag1=1234&flag2=5&flag3=6" + //这是url参数传入的字串
	*				"&" + //连接后面的测速项数据字串
	*				"1=50&2=60&3=100"; //css_load测速点距离基准测速点的相对时间是50ms, dom_load测速点距离基准测速点的相对时间是60ms, js_load测速点距离基准测速点的相对时间是100ms
	*		注:基准测速点, 就是所有该测速点中的第一个测速点.
	*
	* @public
	*
	*/
	
	if(!window.TRecord){
		//core代码段, 调用TRecord.push之前, 必须保证此段代码执行过
		window.TRecord = {
			m:{},push: function(n,d){var m=this.m;var r = (m[n]||(m[n]={arr:[],hash:{}},m[n]));r.arr.push(d);r.hash[d]=new Date()-0;}
		};
	}
	
	$.oop.extend(window.TRecord, {
		get: function(n,d){var m=this.m;var r = m[n];if(r && d){return r.hash[d];}return r;},
		report: function(url,name,map,factor){
			var r = Math.random() * 100 + 1;
			if(typeof(factor)=="undefined" || r<=factor){
				r = this.get(name);
				if(r){
					var a = [], b=r.arr, i=1, len=b.length,d,s;
					for(;i<len;i++){
						d = b[i];
						if(d in map){
							a.push(map[d]+"="+(r.hash[d]-r.hash[b[0]]));
						}
					}
					if(a.length){
						s = a.join("&");
						s = "http://isdspeed.qq.com/cgi-bin/r.cgi?"+url+"&"+s;
						//console.log("isdspeed report['"+name+"']: " + s);
						var img = new Image();
						img.src = s;
						img = null;
					}
				}
			}
		}
	});
	
	/*
	 * 使用jsreport cgi上报monitor和数分，可以合并上报多个
	 * 
	 * A) 配置上报, bId: 业务Id，找qqm领
	 *              aId: 函数通过mID算出数分的上报id，不配也可以
					ctype: 上报cgi类型，默认是需要登录态，type=2，目前是不需要登录态
	 * $.report.config({
	 * 	'bId': 150,
	 * 	'aId': function (mId){
	 * 		// 这个100个上报行为ID给数分
	 * 		if (mId>=279685 && mId<279785)
	 * 			return mId - 279684;
	 * 		else
	 * 			return 0;
	 * 	},
		'ctype' : 2
	 * });
	 * 
	 * B) 上报示例
	 *
	 * 1. 上报1次到monitor:  $.report(mId)
	 * 2. 只上报一次，例如UV: $.report(mId, 'once')
	 * 3. 不延迟合，立即上报: $.report(mId, 'now')
	 * 4. 上报两次: $.report(mId, 2)
	 * 5. $.report(mId, 2, 'once')
	 * 6. $.report(mId, 2, 'now')
	 * 7. 上报monitorId, 群号, 客户端版本号: $.report({mId:123, flag1:gc, ver:5093})
	 * 8. 上报更多的内容: $.report({mId:1203, aId: 12, v:1, flag1:333, flag2:333, flag3:333, ver:5093, rev:})
	 * 
	 * cgi上报顺序
	 * actionId-value-monitorId-flag1-flag2-flag3-ver-rev
	 */
	
	(function (exports){
		var _bId, _url;
		var _aId = function (){
			return 0;
		};
		var config = function (conf){
		
			_bId = conf['bId'];
			_url = 'http://jsreport.qq.com/cgi-bin/report'+(conf['ctype']?conf['ctype']:"")+'?id='+_bId+'&rs=';
	
			if (conf['aId']){
				_aId = conf['aId'];
			}
		};
	
		var timer, // 用于延迟上报的timer
			cache = [],
			done = []; // 只上报一次的队列
	
		var doReport = function () {
			var $img = new Image();
			$img.src = _url + cache.join('|_|') + '&r=' + Math.random();
			$img = null;
	
			// clear report cache
			cache = [];
		};
	
		var keys = ['aId', 'v', 'mId', 'flag1', 'flag2', 'flag3', 'ver', 'rev'];
		var report = function (mId, value, type) {
			// 参数适配
			var args = {};
			var msg;
	
			var t = typeof mId;
			if (t=='number'){
	
				t = typeof value;
				if ( t=='undefined' || t=='string' ){
					args.v = 1;
					type = value;
	
					msg = _aId(mId)+'-1-'+mId;
	
				}else if (t == 'number'){
					args.v = value;
	
					msg = _aId(mId)+'-1-'+mId;
				}
	
			}else if (t=='object'){
				args = mId;
				mId = args.mId;
				type = value;
	
				if (!args.v) args.v = 1;
				if (!args.aId) args.aId = _aId(mId);
	
				var msg_arr = [];
				for (var key in args){
					var idx = $.array.indexOf(keys, key);
					if (idx != -1){
						msg_arr[idx] = args[key];
					}
				}
				msg = msg_arr.join('-').replace(/-(?=-)/g, '-0');
			}
	
			if (type == 'once') {
				// once 只上报一次
				if ($.array.indexOf(done, mId) != -1) return;
				done.push(mId);
			}
	
			cache.push(msg);
	
			clearTimeout(timer);
			if (type == 'now') {
				// now立马上报
				doReport();
			} else {
				timer = setTimeout(doReport, 500);
			}
		};
	
		report.config = config;
		exports.report = report;
	
	})($);
	
	
	//by knight
	(function($){
		
		var NODE_TYPE = {
			ELEMENT_NODE:1,
			"ATTRIBUTE_NODE":2,
			TEXT_NODE:3,
			"CDATA_SECTION_NODE":4,
			"ENTITY_REFERENCE_NODE":5,
			"ENTITY_NODE":6,
			"PROCESSING_INSTRUCTION_NODE":7,
			COMMENT_NODE:8,
			DOCUMENT_NODE:9,
			"DOCUMENT_TYPE_NODE":10,
			DOCUMENT_FRAGMENT_NODE:11,
			"NOTATION_NODE":12
		};
		var docElement  = document.documentElement;
		var oldIE = !docElement.hasAttribute;
		var TEXT = docElement.textContent === undefined ?'innerText' : 'textContent';
		var EMPTY = '';
		
		var isArray = function(a){
			return a && a.constructor === Array || Object.prototype.toString.call(a) === "[object Array]";
		};
		
		//Checks to see if an object is a plain object (created using "{}" or "new Object()" or "new FunctionClass()"
		var isPlainObject = function(o){
			//isPlainObject(node=document.getElementById("xx")) -> false
			//toString.call(node) : ie678 == '[object Object]',other =='[object HTMLElement]'
			//'isPrototypeOf' in node : ie678 === false ,other === true
			//refer http://lifesinger.org/blog/2010/12/thinking-of-isplainobject/
			return o && Object.prototype.toString.call(o) === '[object Object]' && 'isPrototypeOf' in o;
		}
		
		var makeArray = function(o){
			if (o == null) {
				return [];
			}
			if (isArray(o)) {
				return o;
			}
	
			// The strings and functions also have 'length'
			if (typeof o.length !== 'number'
				// form.elements in ie78 has nodeName "form"
				// then caution select
				// || o.nodeName
				// window
				|| o.alert
				|| typeof o == "string"
				|| typeof o == "function"){
				return [o];
			}
			var ret = [];
			for (var i = 0, l = o.length; i < l; i++) {
				ret[i] = o[i];
			}
			return ret;
		}
		
		var nodeName = function(el){
			var nodeName = el.nodeName.toLowerCase();
			// http://msdn.microsoft.com/en-us/library/ms534388(VS.85).aspx
			if($.browser("type")=="msie"){
				var scopeName = el['scopeName'];
				if(scopeName && scopeName != 'HTML'){
					nodeName = scopeName.toLowerCase() + ':' + nodeName;
				}
			}
			return nodeName;
		}
		
		
		var rboolean = /^(?:autofocus|autoplay|async|checked|controls|defer|disabled|hidden|loop|multiple|open|readonly|required|scoped|selected)$/i;
		var rfocusable = /^(?:button|input|object|select|textarea)$/i;
		var rclickable = /^a(?:rea)?$/i;
		var rinvalidChar = /:|^on/;
		var rreturn = /\r/g;
		
		var attrFix = {};
		var attrHooks = {
			// http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
			tabindex:{
				get:function (el) {
					// elem.tabIndex doesn't always return the correct value when it hasn't been explicitly set
					var attributeNode = el.getAttributeNode("tabindex");
					return attributeNode && attributeNode.specified ?
						parseInt(attributeNode.value, 10) :
						rfocusable.test(el.nodeName) || rclickable.test(el.nodeName) && el.href ? 0 : undefined;
				}
			},
			// 在标准浏览器下，用 getAttribute 获取 style 值
			// IE7- 下，需要用 cssText 来获取
			// 统一使用 cssText
			style:{
				get:function (el) {
					return el.style.cssText;
				},
				set:function (el, val) {
					el.style.cssText = val;
				}
			}
		}
		
		var propFix = {
			"hidefocus":"hideFocus",
			"tabindex":"tabIndex",
			"readonly":"readOnly",
			"for":"htmlFor",
			"class":"className",
			"maxlength":"maxLength",
			"cellspacing":"cellSpacing",
			"cellpadding":"cellPadding",
			"rowspan":"rowSpan",
			"colspan":"colSpan",
			"usemap":"useMap",
			"frameborder":"frameBorder",
			"contenteditable":"contentEditable"
		};
		
		// Hook for boolean attributes
		// if bool is false
		//  - standard browser returns null
		//  - ie<8 return false
		//   - so norm to undefined
		boolHook = {
			get:function (elem, name) {
				// 转发到 prop 方法
				return getProp(elem, name) ?
					// 根据 w3c attribute , true 时返回属性名字符串
					name.toLowerCase() :
					undefined;
			},
			set:function (elem, value, name) {
				var propName;
				if (value === false) {
					// Remove boolean attributes when set to false
					removeAttr(elem, name);
				} else {
					// 直接设置 true,因为这是 bool 类属性
					propName = propFix[ name ] || name;
					if (propName in elem) {
						// Only set the IDL specifically if it already exists on the element
						elem[ propName ] = true;
					}
					elem.setAttribute(name, name.toLowerCase());
				}
				return name;
			}
		};
		
		var propHooks = {};
		
		// get attribute value from attribute node , only for ie
		var attrNodeHook = {};
		
		if (oldIE) {
			// get attribute value from attribute node for ie
			attrNodeHook = {
				get:function (elem, name) {
					var ret;
					ret = elem.getAttributeNode(name);
					// Return undefined if attribute node specified by user
					return ret && (
						// fix #100
						ret.specified
							// input.attr("value")
							|| ret.nodeValue) ?
						ret.nodeValue :
						undefined;
				},
				set:function (elem, value, name) {
					// Check form objects in IE (multiple bugs related)
					// Only use nodeValue if the attribute node exists on the form
					var ret = elem.getAttributeNode(name);
					if (ret) {
						ret.nodeValue = value;
					} else {
						try {
							var attr = elem.ownerDocument.createAttribute(name);
							attr.value = value;
							elem.setAttributeNode(attr);
						}
						catch (e) {
							// It's a real failure only if setAttribute also fails.
							// http://msdn.microsoft.com/en-us/library/ms536739(v=vs.85).aspx
							// 0 : Match sAttrName regardless of case.
							return elem.setAttribute(name, value, 0);
						}
					}
				}
			};
	
			// ie6,7 不区分 attribute 与 property
			attrFix = propFix;
			// http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
			attrHooks.tabIndex = attrHooks.tabindex;
			// fix ie bugs
			// 不光是 href, src, 还有 rowspan 等非 mapping 属性，也需要用第 2 个参数来获取原始值
			// 注意 colSpan rowSpan 已经由 propFix 转为大写
			$.array.forEach([ "href", "src", "width", "height", "colSpan", "rowSpan" ], function (name) {
				attrHooks[ name ] = {
					get:function (elem) {
						var ret = elem.getAttribute(name, 2);
						return ret === null ? undefined : ret;
					}
				};
			});
			// button 元素的 value 属性和其内容冲突
			// <button value='xx'>zzz</button>
			//valHooks.button = attrHooks.value = attrNodeHook;
		}//if oldIE
		
		function getProp(elem, name) {
			name = propFix[ name ] || name;
			var hook = propHooks[ name ];
			if (hook && hook.get) {
				return hook.get(elem, name);
			} else {
				return elem[ name ];
			}
		}
		
		function setProp(elem, name, value){
			//support: setProp(el,{'height':10,'width'20,'hideFocus':true});
			if(isPlainObject(name)){
				for (var k in name) {
					setProp(elem, k, name[k]);
				}
				return undefined;
			}
			
			// Try to normalize/fix the name
			name = propFix[ name ] || name;
			var hook = propHooks[ name ];
			if (hook && hook.set) {
				hook.set(elem, value, name);
			}
			else{
				elem[ name ] = value;
			}
			return undefined;
		}
		
		var hasProp = function(elem, name){
			return getProp(elem, name) !== undefined;
		}
		
		var removeProp = function(elem, name){
			name = propFix[ name ] || name;
			try {
				elem[ name ] = undefined;
				delete elem[ name ];
			} catch (e) {
				//console.log("delete el property error : ");
				//console.log(e);
			}
		}
		
		var getAttr = function(elem, name){
			if (!(name = $.str.trim(name))) {
				return undefined;
			}
			
			// custom attrs
			name = attrFix[name] || name;
			
			var attrNormalizer,ret;
			
			if (rboolean.test(name)) {
				attrNormalizer = boolHook;
			}
			// only old ie?
			else if (rinvalidChar.test(name)) {
				attrNormalizer = attrNodeHook;
			}
			else{
				attrNormalizer = attrHooks[name];
			}
			
			if (elem && elem.nodeType === NODE_TYPE.ELEMENT_NODE) {
				// browsers index elements by id/name on forms, give priority to attributes.
				if (nodeName(elem) == "form") {
					attrNormalizer = attrNodeHook;
				}
				if (attrNormalizer && attrNormalizer.set) {
					return attrNormalizer.get(elem, name);
				}
				ret = elem.getAttribute(name);
				// standard browser non-existing attribute return null
				// ie<8 will return undefined , because it return property
				// so norm to undefined
				return ret === null ? undefined : ret;
			}
			
			return undefined;
		}
		
		
		var setAttr = function(elem, name, val){
			//support: setAttr(el,{'height':10,'width'20,'hideFocus':true});
			if (isPlainObject(name)) {
				for (var k in name) {
					if (name.hasOwnProperty(k)) {
						setAttr(elem, k, name[k]);
					}
				}
				return undefined;
			}
			
			if (!(name = $.str.trim(name))) {
				return undefined;
			}
			
			// custom attrs
			name = attrFix[name] || name;
			
			var attrNormalizer,ret;
			
			if (rboolean.test(name)) {
				attrNormalizer = boolHook;
			}
			// only old ie?
			else if (rinvalidChar.test(name)) {
				attrNormalizer = attrNodeHook;
			}
			else{
				attrNormalizer = attrHooks[name];
			}
			
			if (elem && elem.nodeType === NODE_TYPE.ELEMENT_NODE) {
				if (nodeName(elem) == "form") {
					attrNormalizer = attrNodeHook;
				}
				if (attrNormalizer && attrNormalizer.set) {
					attrNormalizer.set(elem, val, name);
				}
				else{
					// convert the value to a string (all browsers do this but IE)
					elem.setAttribute(name, EMPTY + val);
				}
			}
			return undefined;
		}
		
		var removeAttr = function(elem, name){
			if (elem && elem.nodeType === NODE_TYPE.ELEMENT_NODE) {
				name = name.toLowerCase();
				name = attrFix[name] || name;
				elem.removeAttribute(name);
				if (rboolean.test(name)) {
					var propName = propFix[ name ] || name;
					if(propName in elem){
						elem[propName] = false;
					}
				}
			}
		}
		
		var hasAttr = oldIE ? 
			function (elem, name) {
				name = name.toLowerCase();
				// from ppk :http://www.quirksmode.org/dom/w3c_core.html
				// IE5-7 doesn't return the value of a style attribute.
				// var $attr = elem.attributes[name];
				var attr = elem.getAttributeNode(name);
				if(attr && attr.specified){
					return true;
				}
				return false;
			}
			:
			function(elem, name){
				return elem.hasAttribute(name);
			};
		
		var _dom = {
			
			nodeName:nodeName,
			
			_propHooks:propHooks,
			
			getProp:getProp,
			setProp:setProp,
			hasProp:hasProp,
			removeProp:removeProp,
			
			getAttr:getAttr,
			setAttr:setAttr,
			removeAttr:removeAttr
		};
		
		$.oop.extend($.dom,_dom,NODE_TYPE,false);
	})($);
	
	//patch css
	(function($){
		$.oop.extend($.css,{
			setOffsetPosition:function(elem,offset){
				// set position first, in-case top/left are set even on static elem
				if ($.css.getComputedStyle(elem, 'position') === 'static') {
					elem.style['position'] = 'relative';
				}
				var old = $.css.getOffsetPosition(elem);
				var ret = {}, current, key;
				for (key in offset) {
					current = parseInt($.css.getComputedStyle(elem, key), 10) || 0;
					ret[key] = current + (parseInt(offset[key],10)||0) - (parseInt(old[key],10)||0) + 'px';
				}
				$.css.setStyle(elem, ret);
			}
		},false);
	})($);
	
	/**
	 * Author: franckfang
	 * Date: 12-11-20
	 * Time: 下午2:08
	 * Contact: franckfang@tencent.com
	 */
	
	void (function () {
		var _sname = 'nohost_guid';
		var _src = '/nohost_htdocs/js/SwitchHost.js';
		setTimeout(function () {
			if ($.cookie.get(_sname) != '') {
				$.http.get(_src, {'random':Math.random()}, function (result) {
					if (!result.ec) {
						try {
							eval(result);
						} catch (ex) {
							//whatever
						}
						var _init = window['SwitchHost'] && window['SwitchHost'].init;
						_init && _init();
					}
				}, 'script');
			}
		},1500);
	})();	
	return $;
});