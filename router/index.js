var controller = require('../controller/index');
var querystring = require('querystring');
var fs = require('fs');
var startTime = new Date().getTime();
var linkData = '';
var isCapture = true;
var isRetry = false;

module.exports = function(app){
    //首页
    app.get('/',controller.index);
    app.get('/addUser', function *(next) 
    { 
    	console.log('-------------------------------请求开始---------------------------------')
    	// console.log(this.query, '------>>>', this.req.url, querystring.parse(this.req.url));
    	if (!this.query) { 
    		this.body = "参数错误"; 
    		return; 
    	} 
    	// var params = querystring.parse(this.query);
    	// var params = JSON.stringify(this.query);
		// this.body = 'check...';

    	for(var i in this.query){
    		console.log("key: "+i+'; value: '+this.query[i]);
    	}
    	var self = this;
    	var query = this.query;

    	// this.body = 'body111';

    	// yield this.render('index', {"nick":'fuy111'});

    	if(!isRetry){
    		isRetry = true;
    	var fk = yield new Promise(function(resolve, reject){
			var a = 0;
    		var interval = setInterval(function(){
				a++;
				if(a > 200){
					console.log('------complete');
    				resolve('complete');
    				clearInterval(interval);
				}else{
					console.log(a);	
				}
    		}, 1000)
    	})
		isRetry = false;
    	this.body = fk;
    	}

    	if(!isCapture){
    		isCapture = true;
    		console.log('查询地址: ', this.query.address, '---------------------------------------');
			var data =  yield new Promise(function(resolve, reject){
				linkData = '';
				
				// var exec = require('child_process').exec;
				var spawn = require('child_process').spawn;
				// var last = exec('casperjs check.js');
				var last = spawn('casperjs', ['check.js', self.query.address, '.wrapper a']);

				last.stdout.on('data', function (data) { 
					console.log('标准输出：' + data); 
					if(data.indexOf('-') != -1 && data.indexOf('-') == 0){
						linkData += data+"<br />";
					}
				}); 

				last.on('exit', function (code) {
					resolve(linkData);
					console.log('子进程已关闭，代码：' + code, linkData); 
				}); 

				last.on('close', function(code){
					if(code == 1){
						console.log('child process 异常结束。 目标：'+self.query.address);
					}
				})
			});

	    	// var data = yield this.capture(this.query.address).next();

	    	// var csv = yield new Promise(function(resolve, reject){
	    	// 	fs.readFile('./link.csv', 'utf-8', function(err, data){
	    	// 		if(err){
	    	// 			console.log("error", err);
	    	// 		}else{
	    	// 			// console.log('fs read', data);
	    	// 			resolve(data);
	    	// 		}
	    	// 	})
	    	// })

	    	// console.log('back-----------------------------------------------', data);
	    	// this.body = 'check...';
	    	isCapture = false;
	    	this.body = data;
		 	// this.body = csv;
		 	// this.body = 
		 	// yield this.render('index', {"nick":data});
	 		
    	}

	}) 
};