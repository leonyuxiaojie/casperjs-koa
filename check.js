var fs = require('fs');
var casper = require("casper").create({
	clientScripts:[
		'./includes/jquery.min.js'
	],
	pageSettings: {
    	loadImages: false,
    	loadPlugins: false,
    	 // userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 7_0 like Mac OS X; en-us) AppleWebKit/537.51.1 (KHTML, like Gecko) Version/7.0 Mobile/11A465 Safari/9537.53'
  	}
});
var checked = [];
var currentLink = 0;
var fs = require('fs');
var upTo = ~~casper.cli.get('max-depth') || 200;
var url = casper.cli.get(0) || 'http://30.17.165.65:8888/';
var sel = '.wrapper a'//casper.cli.get(1);
var baseUrl = url;
var documentTitle = '';
var links = [url];
var utils = require('utils');
var f = utils.format;


console.log('start:  ', url, upTo, sel);

function getLinks() {
	// console.log(sel, '-------getLinks');
    // var links = document.querySelectorAll('.wrapper a');
    var links = $('a');
    return Array.prototype.map.call(links, function(e) {
    			return e.getAttribute("href");	
    });
}

function outputToCsv(linksArr) {

    var csvData = [], lineData = [];
    var header = '网站标题： '+documentTitle;
    csvData.push(header);

    for (var i= 0; i < linksArr.length; i++) {
    	// if(new RegExp('^(ftp|javascript|http|https)').test(linksArr[i].link)){
    		lineData = [];
        	lineData.push( enquote(i+1) ); //make start at 1
       		lineData.push( enquote(linksArr[i].link) );
        	lineData.push( enquote(linksArr[i].status) );
        	csvData.push(lineData.join(','));
    	// }
    }

    csvData = csvData.join("\r\n");

    try {
        var outputFile = 'link.csv';
        fs.write(outputFile, csvData , 'w');
        console.log('输出文件路径: ' + outputFile);
    } catch (e) {
        console.log('File' + outputFile + ' in use or already exists.');
    }
}

function enquote(val) {
    if (arguments.length == 0 || val == null) {
        return '""';
    }

    return '"'+val.toString().replace(/\"/gm,'""')+'"';
}


casper.start(url, function() {
	// Wait for the page to be loaded
   	// this.waitForSelector('form[action="/search"]');
   	documentTitle = this.getTitle();
   	this.echo("-网站标题: "+this.getTitle());

   	var nameCount = this.evaluate(function() {
    var names = $(sel)
    	return names.length;
	});
	this.echo(nameCount+" - "+sel);
   	// this.click('a');
   	// this.capture('baidu-homepage.png');
   	// this.log("I'm logging an error", "error");
});

casper.then(function() {
    // aggregate results for the 'casperjs' search
    links = this.evaluate(getLinks);
    // console.log('-------->>>',links.length);
    var urlReg=/^(http|https|ftp):\/\/([^\/]+)/i; 
    var domain = url.match(urlReg);
    this.echo('-网站域名: '+ domain[0]);
    baseUrl = domain[0];
});

function crawl(link){
	var lb = new Object();
	this.start().then(function(){
		// this.echo(link, ' open link');
		var strRegex = "^(http|https|ftp)\://[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,3}(:[a-zA-Z0-9]*)?/?([a-zA-Z0-9\-\._\?\,\'/\\\+&amp;%\$#\=~])*$";
	 	var re = new RegExp(strRegex); 	
		// var urlReg=/http:\/\/([^\/]+)/i; 
		link = re.test(link) ? link : baseUrl+link;
		// console.log('打开链接: ', link);
		this.open(link);
		
	});
	this.then(function(){
		// if(this.currentHTTPStatus === 404){
		// 	this.warn(link+' is missing(HTTP 404)');
		// }else if(this.currentHTTPStatus === 500){
		// 	this.warn(link+' is broken (HTTP 500)');
		// }else{
		// 	this.echo(link + f(' is okay (HTTP %s)', this.currentHTTPStatus));
		// }
		console.log('-链接状态: ', "<a href='"+this.requestUrl+"' target='_blank'>"+this.requestUrl+"</a>"+"  &nbsp;&nbsp;&nbsp;<span>"+this.currentHTTPStatus+"</span>");
		lb.status = this.currentHTTPStatus || "无效链接";
		lb.link = link;
	});
	
	// lb.status = this.currentHTTPStatus;
	checked.push(lb);
}


function check(){
	// console.log('---check', links, links.length);
	// console.log(links[links.length-1])
	// if(links[currentLink]){
	if(currentLink<=links.length-1 && currentLink<=upTo){
		// console.log('------>>', currentLink)		
		crawl.call(this, links[currentLink]);
		currentLink++;
		this.run(check);
	}else{
		outputToCsv(checked);
		this.echo('-完成！');
		this.exit();
	}
}


casper.run(function() {
    // echo results in some pretty fashion
    this.echo('-全部 '+links.length + ' 个链接');
    currentLink = 0;
    this.run(check);
});

