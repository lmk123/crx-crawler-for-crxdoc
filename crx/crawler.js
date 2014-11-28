(function ( global , factory ) {
    if ( 'function' === typeof define && define.amd ) {
        define( factory );
    } else {
        global.c = factory();
    }
}( this , function () {

    var tools = {

            /**
             * 一个一个的处理队列中的项目
             * @param {{}} options
             * @param {Array} options.queue
             * @param {Function} options.handle 此函数必须接收两个参数：第一个是队列中的项，第二个是一个回调
             * @param {Function} options.complete
             * @returns {Function} start 开始函数，运行后即开始处理队列
             */
            oneByOne : function ( options ) {
                var index = 0 ,
                    arr = options.queue ,
                    cb = options.handle ,
                    cycle = function () {
                        cb( arr[ index ] , function () {
                            index += 1;
                            if ( arr.length === index ) {
                                options.complete();
                            } else {
                                setTimeout( cycle , 0 );
                            }
                        } );
                    };
                return cycle;
            } ,

            /**
             * 去掉链接里面的 hash
             * @param {string} url
             * @returns {string}
             */
            stripHash : function ( url ) {
                var hash;
                url = url.trim();
                hash = url.indexOf( '#' );
                return hash < 0 ? url : url.slice( 0 , hash );
            } ,

            /**
             * 包装了一层 forEach，用来遍历类数组对象
             * @param arr
             * @param handle
             */
            each : function ( arr , handle ) {
                Array.prototype.forEach.call( arr , handle );
            } ,

            /**
             * 解析一个网址的各个部分
             * @param url
             * @returns {{hash: string, host: (*|string), hostname: (*|string), pathname: (*|string), port: number, protocol: string, search: string}}
             */
            parseUrl : function ( url ) {
                var a = document.createElement( 'a' );
                a.href = url.trim();
                return {
                    hash : a.hash.slice( 1 ) ,
                    host : a.host ,
                    hostname : a.hostname ,
                    pathname : a.pathname ,
                    port : Number( a.port ) ,
                    origin : a.origin ,
                    protocol : a.protocol.slice( 0 , -1 ) ,
                    search : a.search.slice( 1 )
                };
            } ,

            /**
             * ajax get 方法
             * @param url
             * @param type
             * @param cb
             */
            get : function ( url , type , cb ) {
                var x = new XMLHttpRequest();
                x.open( 'get' , url );
                x.responseType = type;
                x.onload = function () {
                    var r;
                    if ( 200 === x.status ) {
                        r = x.response;
                    } else {
                        r = null;
                    }
                    setTimeout( cb , 0 , r );
                };
                x.send();
            } ,

            /**
             * 将一个文件上传到指定的服务器
             * @param url
             * @param path
             * @param blob
             * @param cb
             */
            post : function ( url , path , blob , cb ) {
                var x = new XMLHttpRequest() ,
                    f = new FormData();

                f.append( 'path' , path );
                f.append( 'file' , blob );
                x.open( 'post' , url );
                x.onload = function () {
                    setTimeout( cb , 0 );
                };
                x.send( f );
            } ,

            parseDoc : function ( doc ) {
                var r = [] ,
                    docs = doc.querySelectorAll( 'a[href]' ) ,
                    files = doc.querySelectorAll( 'img[src], script[src], link[rel=stylesheet][href]' );
                if ( docs ) {
                    tools.each( docs , function ( dom ) {
                        r.push( {
                            type : 'document' ,
                            url : tools.stripHash( dom.href )
                        } );
                    } );
                }

                if ( files ) {
                    tools.each( files , function ( dom ) {
                        r.push( {
                            type : 'blob' ,
                            url : tools.stripHash( dom.src || dom.href )
                        } );
                    } );
                }
                return r;
            }
        } ,

        crawler = function ( options ) {

            var start = options.start ,
                server = options.server ,
                pass = options.pass ,
                onAddQueue = options.onAddQueue ,
                origin = tools.parseUrl( start ).origin ,
                queue = [
                    {
                        type : 'document' ,
                        url : start
                    }
                ];

            return tools.oneByOne( {
                queue : queue ,
                handle : function ( item , next ) {

                    var itemUrl = item.url;

                    // 如果是同源的
                    //if ( item.url.indexOf( origin ) === 0 ) {

                    // 获取指定 url 的文件
                    tools.get( itemUrl , item.type , function ( response ) {
                        var blob;

                        if ( response ) {

                            // 获取之后先上传文件
                            if ( 'document' === item.type ) {

                                tools.parseDoc( response ).forEach( function ( v ) {
                                    var u = v.url;

                                    // 满足三个条件则加入队列：同源、通过断定函数、不重复
                                    if ( u.indexOf( origin ) === 0 && pass( u ) && queue.every( function ( itemIn ) {
                                            return itemIn.url !== u;
                                        } ) ) {

                                        queue.push( v );
                                        onAddQueue( v );
                                    }
                                } );
                                itemUrl += '.html';
                                blob = new Blob( [ response.documentElement.outerHTML ] , { type : 'text/html' } );
                            } else {
                                blob = response;
                            }

                            tools.post( server , tools.parseUrl( itemUrl ).pathname , blob , next );
                        } else {
                            next();
                        }
                    } );
                    //} else {
                    //    next();
                    //}

                } ,
                complete : function () {
                    options.onComplete( queue );
                }
            } );

        };

    return crawler( {
        start : 'https://crxdoc-zh.appspot.com/extensions/index' ,
        server : 'http://localhost:12345' ,
        pass : function ( url ) {
            return url.indexOf( '/examples' ) < 0;
        } ,
        onAddQueue : function ( item ) {
            console.log( item.url + '加入队列' );
        } ,
        onComplete : function ( queue ) {
            console.log( queue.length + '个文件抓取完成' );
        }
    } );
} ));
