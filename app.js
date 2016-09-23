var debug = require('debug')('koacasper');
var koa = require('koa');
var IO = require('koa-socket');
var co = require('co');
var timeout = require('koa-timeout')(500000);
//配置文件
var config = require('./config/config');

var app = koa();
var io = new IO();
var chat = new IO('chat');
var linkData = '';
// io.attach(app);


app.use(function *(next){
    //config 注入中间件，方便调用配置信息
    if(!this.config){
        this.config = config;
    }
    yield next;
});

app.use(timeout);



//log记录
var Logger = require('mini-logger');
var logger = Logger({
    dir: config.logDir,
    format: 'YYYY-MM-DD-[{category}][.log]'
});

//router use : this.logger.error(new Error(''))
app.context.logger = logger;

var onerror = require('koa-onerror');
onerror(app);

//xtemplate对koa的适配
var xtplApp = require('xtpl/lib/koa');
//xtemplate模板渲染
xtplApp(app,{
    //配置模板目录
    views: config.viewDir
});

var session = require('koa-session');
app.use(session(app));


//post body 解析
var bodyParser = require('koa-bodyparser');
app.use(bodyParser());
//数据校验
var validator = require('koa-validator');
app.use(validator());

//静态文件cache
var staticCache = require('koa-static-cache');
var staticDir = config.staticDir;
app.use(staticCache(staticDir+'/js'));
app.use(staticCache(staticDir+'/css'));
app.use(staticCache(staticDir+'/csv'));


//路由
var router = require('koa-router');

var queryString = require('queryString');
app.use(router(app));

chat.attach(app);

//应用路由
var appRouter = require('./router/index');
appRouter(app);

app.listen(config.port);
console.log('listening on port %s',config.port);


var system = require('system');


console.log('主进程开启');

/**
 * Chat handlers
 */



chat.on( 'connection', ctx => {
  console.log( 'Joining chat namespace', ctx.socket.id )
})

chat.on( 'message', ctx => {
	// console.log( 'chat message received', ctx.data )
  	linkData = '';
  	var url = ctx.data;
	var spawn = require('child_process').spawn;
	var last = spawn('casperjs', ['check.js', url, '.wrapper a']);

	last.stdout.on('data', function (data) { 
		console.log('标准输出：' + data); 
		if(data.indexOf('-') != -1 && data.indexOf('-') == 0){
		linkData += data+"<br />";
		}
	}); 

	last.on('exit', function (code) {
		sendMsg()
		console.log('子进程已关闭1，代码：' + code, linkData); 
	}); 

	last.on('close', function(code){
		if(code == 1){
			console.log('child process 异常结束。 目标：'+url);
		}
	})


	function sendMsg(){
		app.chat.broadcast( 'message', linkData )
	}

	// Broadcasts to everybody, including this connection
	// Broadcasts to all other connections
	ctx.socket.broadcast( 'message', 'ok connections:chat:broadcast' )
	// Emits to just this socket
	// ctx.socket.emit( 'message', 'check...' )
})




app.context.capture = function *(url){
	linkData = '';
	var data =  yield new Promise(function(resolve, reject){
		// var exec = require('child_process').exec;
		var spawn = require('child_process').spawn;
		// var last = exec('casperjs check.js');
		var last = spawn('casperjs', ['check.js', url, '.wrapper a']);

		last.stdout.on('data', function (data) { 
			console.log('标准输出：' + data); 
			if(data.indexOf('-') != -1 && data.indexOf('-') == 0){
				linkData += data+"<br />";
			}
		}); 

		last.on('exit', function (code) {
			resolve(linkData);
			console.log('子进程已关闭1，代码：' + code, linkData); 
		}); 

		last.on('close', function(code){
			if(code == 1){
				console.log('child process 异常结束。 目标：'+url);
			}
		})
	});

	console.log('wo yun----', data);
	return data;
}


module.exports = app;

