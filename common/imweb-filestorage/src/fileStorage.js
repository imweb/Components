/*!
 * fileStorage.js
 * v0.1.0 - 2014-07-27
 * written by Aaron Ou
 *
 * FileStorage.load(url, opts)
 *  url - String
 *  opts - object(optional)
 *      expire - Number(in seconds) - 1814400(as 21 days) - the time length the file should be storage
 *      execute - Boolean - true - whether execute the script once it's loaded
 *      noCache - Boolean - false - do not use cache
 *      refresh - Boolean - false - refresh the storage
 *      cors - Boolean - false - whether add crossorigin attribute to script tag if it comes to use script tag to load the file
 *      cb - Function - function(err, info){} - callback once it's done
 *          err - Event - null - if there is an error, it will not be null
 *          opts - Object
 *              time - Number(in microseconds) - the time spend on loading the script
 *              from - where this script coming from, its value and meaning is written at FileStorage.FROM
 *              url - String - the url you request
 *
 * FileStorage.clear()
 *      just clear all localStorage
 *
 * FileStorage.config(opts)
 *      configure default settings for FileStorage, should be call before FileStorage.load
 *      opts - Object
 *          timeout - Number(in microseconds) - 30000(as 30s) - ajax timeout for fetching
 *          expire - Number(in seconds) - 1814400(as 21 days) - the time length the file should be storage
 *          clearExpireTimeout - Number(in microseconds) - 10000(as 10s) - when to try clearing the expire file
 *
 *
 * FileStorage.FROM
 *      return Object
 *          File: 'file' // means loaded from regular script tag with src
 *          STORAGE: 'storage' // means loaded from localStorage
 *          FETCH: 'fetch' // means loaded from ajax call
 *
 */

var FileStorage = (function(win, storage){

    var keyPrefix = 'FileStorage-',
        timeout = 30*1000, clearExpireTimeout = 10*1000;

    var TYPE = {
        JS: 'js',
        CSS: 'css',
        UNKNOWN: 'unknown'
    }, FROM = {
        FILE: 'file',
        STORAGE: 'storage',
        FETCH: 'fetch'
    };

    function setItem(key, value){
        try{
            storage.setItem(key, value);
        }catch (e){
            clearLocalStorage();
            return false;
        }
        return true;
    }

    function extend(){
        var ret = arguments[0] || {};
        for(var i= 1, len=arguments.length; i<len; i++){
            var obj = arguments[i];
            if(typeof obj!='object') continue;
            for(var key in obj){
                ret[key] = obj[key];
            }
        }
        return ret;
    }

    var defaultFileOptions = {
        expire: 1814400, // in seconds
        execute: true,
        noCache: false,
        refresh: false,
        cors: false,
        cb: function(){} // args: err, url, info
    };

    function isSameDomain(url){
        // relative path
        if(/^\/|^\./.test(url)) return true;
        // absolute path
        var match = url.match(/^https?:\/\/([^\/$\?\#]+)/);
        return match && match.length>1 && match[1]==win.location.host;
    }

    function getType(url){
        if(/\.js(?:$|#|\?)/.test(url)){
            return TYPE.JS;
        }else if(/\.css(?:$|#|\?)/.test(url)){
            return TYPE.CSS;
        }else{
            return TYPE.UNKNOWN;
        }
    }

    function ajaxFetch(url, cb){
        var xhr = new XMLHttpRequest();
        xhr.open( 'GET', url );

        xhr.onreadystatechange = function() {
            if ( xhr.readyState === 4 ) {
                if( xhr.status === 200 ) {
                    cb(null, xhr.responseText);
                } else {
                    //reject( new Error( xhr.statusText ) );
                    cb({retcode: xhr.status || 10001, msg:xhr.statusText, type:'error'});
                }
            }
        };

        // By default XHRs never timeout, and even Chrome doesn't implement the
        // spec for xhr.timeout. So we do it ourselves.
        setTimeout( function () {
            if( xhr.readyState < 4 ) {
                xhr.abort();
            }
        }, timeout);

        xhr.send();
    }

    function appendContent(content, type, opts){
        if(type == TYPE.JS){
            var $script = win.document.createElement('script');
            $script.innerHTML = content;
            win.document.body.appendChild($script);
            opts.cb(null, {url:opts.url, time:+new Date() - opts.start, from: opts.from || FROM.FETCH});
        }else if(type == TYPE.CSS){
            var $style = win.document.createElement('style');
            $style.innerHTML = content;
            win.document.head.appendChild($style);
            opts.cb(null, {url: opts.url, time:+new Date() - opts.start, from: opts.from || FROM.FETCH});
        }
    }

    function readyHandler(opts){
        return function(e){
            opts.cb(
                e.type=='error'?e:null,
                {url:opts.url, time:+new Date() - opts.start, from: FROM.FILE});
        }
    }

    function appendFile(url, type, opts){
        if(type == TYPE.JS){
            var $script = win.document.createElement('script');
            $script.src = url;
            $script.onerror = $script.onload = $script.onreadystatechange = readyHandler(opts);
            if(opts.cors && !isSameDomain(url)) $script.crossorigin = true;
            win.document.body.appendChild($script);
        }else if(type == TYPE.CSS){
            var $link = win.document.createElement('link');
            $link.type = 'text/css';
            $link.rel = 'stylesheet';
            $link.href = url;
            $link.onerror = $link.onload = $link.onreadystatechange = readyHandler(opts);
            win.document.head.appendChild($link);
        }
    }

    function getObject(str){
        try{
            return JSON.parse(str);
        }catch (e){
            return null;
        }
    }

    function load(url, opts){
        if(!url) return;
        opts = extend({}, defaultFileOptions, {url:url, start: +new Date()}, opts);
        if(opts.noCache){
            appendFile(url, getType(url), opts);
            return;
        }

        // if has cache but expired, delete it so that content will be empty
        var storageObj = getObject(storage.getItem(keyPrefix+url));
        if(storageObj && storageObj.expire && storageObj.content && storageObj.expire<opts.start){
            deleteItem(keyPrefix+url);
        }

        if(opts.refresh || !storageObj){
            // ajax fetch file
            ajaxFetch(url, function(err, content){
                if(err){
                    if(opts.execute){
                        appendFile(url, getType(url), opts);
                    }else{
                        opts.cb(null, {url:url, time:+new Date() - opts.start});
                    }
                    return;
                }
                var now = + new Date();
                storageObj = {content:content, fetchTime: now, expire: now + opts.expire*1000};

                try{
                    storage.setItem(keyPrefix+url, JSON.stringify(storageObj));
                }catch(e){
                    // storage is full;
                    clearFiles();
                    try{
                        storage.setItem(keyPrefix+url, JSON.stringify(storageObj));
                    }catch (e){
                        clearLocalStorage();
                        try{
                            storage.setItem(keyPrefix+url, JSON.stringify(storageObj));
                        }catch (e){}
                    }
                }

                if(opts.execute){
                    appendContent(content, getType(url), opts);
                }else{
                    opts.cb(null, {url:url, time:+new Date() - opts.start});
                }
            });
        }else{
            // has file in storage
            opts.from = FROM.STORAGE;
            if(opts.execute && storageObj.content){
                appendContent(storageObj.content, getType(url), opts);
            }else{
                opts.cb(null, {url:url, time:+new Date()-opts.start});
            }
        }
    }

    function clearExpire(){
        var now = + new Date();
        for (var i = 0; i < storage.length; i++){
            var key = storage.key(i);
            if(key && key.match(new RegExp("^"+keyPrefix))){
                var storageObj = getObject(storage.getItem(key));
                if(!(storageObj && storageObj.content && storageObj.expire>now)){
                    deleteItem(key);
                }
            }
        }
    }

    function clearFiles(){
        for (var i = 0; i < storage.length; i++){
            var key = storage.key(i);
            if(key && key.match(new RegExp("^"+keyPrefix))){
                deleteItem(key);
            }
        }
    }

    function deleteItem(key){
        storage.removeItem(key);
    }

    function clearLocalStorage() {
        storage.clear();
    }

    function config(opts){ // only accept timeout & expire
        timeout = opts.timeout || timeout;
        defaultFileOptions.expire = opts.expire || defaultFileOptions.expire;
        clearExpireTimeout = opts.clearExpireTimeout || clearExpireTimeout;
    }

    setTimeout(clearExpire, clearExpireTimeout);

    return {
        load: load,
        clear: clearLocalStorage,
        config: config,
        FROM: FROM
    };
})(window, window.localStorage);