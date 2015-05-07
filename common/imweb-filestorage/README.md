# imweb-filestorage
filestorage

## install
```html
npm install-imweb-filestorage
```

## API

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
