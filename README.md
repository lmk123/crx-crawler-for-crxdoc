# 书虫

一个偏爱文档类网站的爬虫扩展。目前专门设计为用于抓取[非官方的 Chrome 扩展/应用开发文档](https://crxdoc-zh.appspot.com/)，所以**不一定能在其它网站上正常工作**。

### 使用方法

*在这之前，先确保你的 Chrome 浏览器能正常打开 https://crxdoc-zh.appspot.com/ （下面称作“远程服务器”）。*

1. 下载代码库
2. 启动 nodejs 程序：`node app`（稍后会说明为什么）
3. 在 Chrome 的*扩展程序页面*（`chrome://extensions/`）勾选*开发者模式*，然后点击*加载正在开发的扩展程序*并指向代码库下的 `/crx` 文件夹
4. 点击`背景页`，在`Console`面板内输入`c()`

完成之后（我花了大约7分钟），代码库下会多出一个`chrome`文件夹，此时你就可以在浏览器中输入`http://localhost:12345/extensions/`来阅读文档了。

### 将它用于其它网站

见 [crawler.js](https://github.com/lmk123/crx-crawler-for-crxdoc/blob/master/crx/crawler.js#L211)

### 工作原理

传统的爬虫是基于对 html 字符串进行正则表达式解析来获取页面上的资源的，而书虫则是利用了浏览器里面的`XMLHttpRequest`对象能设定`responseType`来工作的：
```js
var x = new XMLHttpRequest();
x.open( 'get' , 'https://www.google.com/' );
x.responseType = 'document'; // 将返回类型设置为 document
x.onload = function () {
  x.response.nodeType; // 9，即 document 对象
};
x.send();
```
这样便能方便的获取一个网页上的所有链接和静态资源：
```js
x.response.querySelectorAll( 'a[href], img[src], script[src], link[rel=stylesheet][href]' );
```
并且**绝不出错**。

接下来，为了能使用`XMLHttpRquest`对象发起跨域请求，所以将它做成了一个 Chrome 扩展。**它最好运行于 Chrome 扩展环境中，否则就只能抓取同域的、或者在 HTTP 响应头中显式的允许跨域访问的网站**。

最后，Chrome 扩展环境不支持文件读写，所以我又加入了一个辅助的 nodejs app（下面称作“本地服务器”），书虫会在读取完内容后将文件发给`app.js`保存至本地：
```js
// server 默认为 http://localhost:12345/ ，即本地服务器的地址
var post = function ( server , path , blob , cb ) {
  var x = new XMLHttpRequest() ,
      f = new FormData();

  f.append( 'path' , path ); // 对应文件 url 的 pathname 部分
  f.append( 'file' , blob ); // blob 对象
  x.open( 'post' , url );
  x.onload = function () {
    setTimeout( cb , 0 );
  };
  x.send( f );
};
```
是的，书虫充当了一个中间人的角色，在远程服务器和本地服务器之间传输数据。
### 不直接用 nodejs 来爬取的原因
因为 https://crxdoc-zh.appspot.com/ 被墙，本地服务器无法直接访问远程服务器，然而VPN非常的不稳定，再加上正好我的 Chrome 上使用了[goagent](https://github.com/goagent/goagent)，于是就有了这个扩展。
### 许可
MIT
