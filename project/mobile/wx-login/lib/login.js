var T = require('common/tools.bom') , $ = require('zepto') ,
    mmticket , isLoading , myTask , _Storage = window.localStorage , getmmticket;

//weixin will put mmticket into page's location when you location in the white list
(getmmticket = function (){
	if(typeof(mmticket) == 'undefined'){
		mmticket =  T.bom.query('mmticket') || '';//https://github.com/imweb/mobile/blob/master/src/tools/tools.bom.js
		
		//put the mmtikect into localStorage for page location that weixin dosn't have query params mmtikect to page
//		if(mmticket){
//			_Storage && _Storage.setItem('wxlogin-mmticket' , mmticket);
//		}else{
//			mmticket = _Storage && _Storage.getItem('wxlogin-mmticket') || '';
//		}
	}
	return mmticket;
})();

//The Tasks will be used to set callback when you call class login
function Tasks(){
	var tasks = {
		succ : [],
		err : []
	};
	return myTask ||  (myTask = {
		set : function(cb , type){//add the callback into the task
			type = type || 'succ';
			var _tasks = tasks[type] || (tasks[type] = []);
			cb && (_tasks.push(cb));
		},
		clear : function(type){
			type = type || 'succ';
			var _tasks = tasks[type] || (tasks[type] = []);

			_tasks.length = 0;//clear tasks
		},
		run : function(data , type){//run tasks
			type = type || 'succ';
			var _tasks = tasks[type] || [];

			var flag = false;
			while(_tasks.length){
				var fun = _tasks.shift();
				flag = flag || (fun && fun(data));
			}
			return flag;
		}
	})
}

/**
 * @author herbertliu
 * @date 2015-03-3 update
 * @description auto login inner of weixin
 * @example new Login(param)
 *							isPt {Boolean} ptlogin auto or not , default is true
 *							url {String} isPt must be when isPt is true
 *							succ {Function} callback of success
 *							err {Function} callback of error
 *							login {Function} callback of ptlogin
 * @example (new Login(param)).login()
 */

function Login(options){
	options = options || {};
	this.url = options.url;//jump url that needed when ptlogin happened

	//need ptlogin location or not
	this.isPt = typeof(options.isPt) == 'undefined'? true : options.isPt;//jummp with auto or not

	if(!this.url && this.isPt){
		throw 'There is no url need to jump!';
	}
	this.mmticket =  getmmticket();
	//callback with success
	if(typeof(options.succ) == 'function'){
		Tasks().set(options.succ);
	}
	//callback with error
	if(typeof(options.err) == 'function'){
		Tasks().set(options.err, 'err');
	}
    //2015-3-6 by lqlongli
    //保存失败的mmticket
    var that = this;
    Tasks().set(function() {
        T.storage.set('wxLoginFailedMMticket', that.mmticket);
    }, 'err');
	//callback before ptlogin location
	if(typeof(options.login) == 'function'){
		Tasks().set(options.login, 'login');
	}

	this.login();
}

//
Login.prototype = {
	ptlogin : function(data, force){
		data = data || {};
		//clear the localStorage data when ptlogin happened
//		_Storage && _Storage.removeItem('wxlogin-mmticket');

		if(this.isPt || force){
            Tasks().run(data , 'login');
			var _this = this;
			window.setTimeout(function(){
				window.location.href = 'http://ui.ptlogin2.qq.com/cgi-bin/login?style=9' +
            		'&appid=716040006&s_url=' + encodeURIComponent(_this.url) + '&low_login=0';
        	},100);
		}
	},
	destroy : function(parent){
		var _this = this;
		if(_this.destroyed) return;
		_this.destroyed = true;

		//clear the localStorage data 
//		_Storage && _Storage.removeItem('wxlogin-mmticket');
	},
	getSkey : function(){
		if(isLoading) return;
		isLoading = true;
		var _mmticket = this.mmticket;
		var _this = this;
		//use ajax of $ , dependencies on zepto or jquery
		_this.destroyed = false;
		$.ajax({
            type: 'get',
            url: '/cgi-bin/login/weixinToQQLogin',
            data: {
            	mmticket : _mmticket
            },
            cache: false,
            success: function(data){
            	isLoading = false;
            	if(!data.retcode){
	            	//get skey success from cgi data
	            	var skey = T.cookie.get('skey');
	            	var uin = T.cookie.get('uin');
	            	//check the skey and uin from cookie
	            	if(skey && uin){
	            		//skey & uin is not empty
	            		Tasks().run(data);
	            	}else{
	            		//skey & uin is not exist , then the error wile be called
	            		var _flag = Tasks().run(data , 'err');
	            		if(!_flag) _this.ptlogin(data);
	            	}
            	}else{
            		//get skey error from cgi data
            		var _flag = Tasks().run(data , 'err');
	            	if(!_flag) _this.ptlogin(data);
            	}
            	_this.destroy();
            },
            error: function(data){
            	//ajax error , as the same as cgi error
            	isLoading = false;
            	var _flag = Tasks().run(data , 'err');
	            if(!_flag) _this.ptlogin(data);
	            _this.destroy();
            }
        });
	},
	login : function(){
        var failedMMticket = T.storage.get('wxLoginFailedMMticket') || '';
		if(T.mobile.isWeixin() && this.mmticket){
            if (failedMMticket && failedMMticket == this.mmticket) {
                var _flag = Tasks().run({ retcode: -1 } , 'err');
                if(!_flag) this.ptlogin({ retcode: -1 });
            } else {
                //the page is opened by weixin , mmticket will appear in locatiton
                this.getSkey();
            }
		}else{
			//no mmticket
			this.ptlogin();
		}
	}
};



module.exports = Login;
