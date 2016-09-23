(function($){

	var socket = io();

	$('button.submit').bind('click', function(){
		$('.result').html();
		var waitting = new Waitting();
		waitting.start();
		var address = $('.address-txt').val();
		// return;
		var chat = io( 'http://localhost:3000/chat' )
		chat.on( 'message', function( event ) {
			console.log( 'chat message:', event )
			$('.result').html(event);
			 waitting.clear();
		})
		chat.emit( 'message', $('.address-txt').val());

		console.log('socket', socket);

		return;
		$.ajax({
		　　url:'http://30.17.165.65:3000/addUser?address=http://30.17.165.65:8888/',  //请求的URL
		　　timeout : 200000, //超时时间设置，单位毫秒
		　　type : 'get',  //请求方式，get或post
		　　data :{},  //请求所传参数，json格式
		　　dataType:'text',//返回的数据格式
		　　success:function(data){ //请求成功的回调函数
		　　　　　console.log("成功", data);
				$('.result').html(data);
		　　},
		　　complete : function(XMLHttpRequest,status){ //请求完成后最终执行参数
		　　　　if(status=='timeout'){//超时,status还有success,error等值的情况

		 　　　　　 ajaxTimeOut.abort(); //取消请求
		　　　　　  alert("超时");

		　　　　}
		　　},
			error: function(XMLHttpRequest, textStatus, errorThrown) {
				console.log(XMLHttpRequest.status);
				console.log(XMLHttpRequest.readyState);
				console.log(textStatus);

			}
		});

		$('a').bind('click', function(e){
			console.log('---------')
			e.preventDefault();
			// window.open('')
			console.log('window', window);
		})

		// $.get("http://30.17.165.65:3000/addUser?address="+address, function(data, status){
		// $.post('http://30.17.165.65:3000/addUser', {na,me:'leon', age:'33'}, function(data){
			// if(status == 'success'){
				// console.log(data, 'back--->>');
				// $('.result').html(data);
				// waitting.clear();
  		// });
	})

	function Waitting(){
		var interval;
		var count = 0
		this.start = function(){
			interval = setInterval(function(){
				console.log('-----wait');
				var loadingString = '';
				if(count == 0){
					loadingString = '';
				}else if(count == 1){
					loadingString = '.';
				}else if(count ==2){
					loadingString = '..';
				}else{
					loadingString = '...'
				}
				$('.tip').html("查询中 请稍等"+loadingString);
				count++;
				count %= 4;
			}, 500);
		},
		this.clear = function(){
			$('.tip').html('');
			clearInterval(interval);
			interval = null
			
	}
		}

})(jQuery)


// http://localhost:3000/addUser?name=Arvo&age=24