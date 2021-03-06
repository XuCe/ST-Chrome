//扩展方法
String.prototype.replaceAll = function(reallyDo, replaceWith, ignoreCase) {
    if (!RegExp.prototype.isPrototypeOf(reallyDo)) {
        return this.replace(new RegExp(reallyDo, (ignoreCase ? "gi": "g")), replaceWith);
    } else {
        return this.replace(reallyDo, replaceWith);
    }
}

Array.prototype.unique = function()
{
	var n = []; //一个新的临时数组
	for(var i = 0; i < this.length; i++) //遍历当前数组
	{
		//如果当前数组的第i已经保存进了临时数组，那么跳过，
		//否则把当前项push到临时数组里面
		if (n.indexOf(this[i]) == -1) n.push(this[i]);
	}
	return n;
}

var allcookies = document.cookie;  
function getCookie(cookie_name)
{
	var allcookies = document.cookie;
	var cookie_pos = allcookies.indexOf(cookie_name);   //索引的长度
	// 如果找到了索引，就代表cookie存在，
	// 反之，就说明不存在。
	if (cookie_pos != -1)
	{
	// 把cookie_pos放在值的开始，只要给值加1即可。
		cookie_pos += cookie_name.length + 1;      //这里我自己试过，容易出问题，所以请大家参考的时候自己好好研究一下。。。
		var cookie_end = allcookies.indexOf(";", cookie_pos);
		if (cookie_end == -1)
		{
			cookie_end = allcookies.length;
		}
		var value = unescape(allcookies.substring(cookie_pos, cookie_end)); //这里就可以得到你想要的cookie的值了。。。
	}
	return value;
}

function setCookie(name, value)
{
	var Days = 90;
	var exp  = new Date();
	exp.setTime(exp.getTime() + Days*24*60*60*1000);
	document.cookie = name + "="+ escape (value) + ";expires=" + exp.toGMTString();
}

var hexToDec = function(str) {
    str=str.replace(/\\/g,"%");
    return unescape(str);
}

function ClickE(name)  
{  
    if(document.all)  
    {  
        document.getElementById(name).click();  
    }  
    else  
    {  
        var evt = document.createEvent("MouseEvents");  
        evt.initEvent("click", true, true);  
        document.getElementById(name).dispatchEvent(evt);  
    }
} 
//接受消息
chrome.runtime.onMessage.addListener(  function(request, sender, sendResponse) { 
	var cmd=request.cmd;
	GetHomeMusicToUrlAndTitle(cmd,function(result,title){
		if(result!=null){
			var timestamp = new Date().getTime();
			$("body").append("<a href='"+result+"' download='temp' id='down"+"_"+timestamp+"' style='display:none;'>download</a>");
			var obj=new Object();
			obj.name=title;
			var url=result.split("?")[0].split("/");
			obj.url=url[url.length-1].split(".")[0];
			obj.id=cmd;
			console.log(obj);
			chrome.runtime.sendMessage({cmd: obj});
			ClickE("down"+"_"+timestamp);
		}
	});
});
//公共方法
//获取歌曲信息
function GetInfo(id,callback){
	var userid=getCookie("CookID");
	var url="http://www.songtaste.com/api/android/songurl.php";
	if(undefined!=userid){
		url="http://www.songtaste.com/api/android/songurl.php?uid="+userid+"&version=ST0.2.0.05_A1.6 HTTP/1.1";
	}
	$.ajax({
		url:url,
		data:{songid:id},
		dataType:"xml",
		success:function(result){
			callback(result,id)
		}
	})
}

//歌曲详情xml解析
function parseXml(result){
	if($(result).find("msg").length>0){
		return null;
	}else{
		var info=new Object();
		info.song_name=$(result).find("song_name").text();
		info.url=$(result).find("url").text();
		info.singer_name=$(result).find("singer_name").text();
		info.iscollection=$(result).find("iscollection").text();
		return info;
	}
}

//收藏
function collectionSong(songid,callback){
	var userid=getCookie("CookID");
	if(undefined==userid){
		noLogin();
	}else{
		$.ajax({
			url:"http://www.songtaste.com/api/android/collection.php?uid="+userid+"&songid="+songid+"&format=xml HTTP/1.1",
			dataType:"json",
			success:callback
		});
	}
}

//未登录操作
function noLogin(){
	alert("请先选登陆！");
	window.open("http://2012.songtaste.com/st/login.shtml");
}
//下载点击事件
$(document).on("click",".downloads",function(){
	var id=$(this).attr("data-id");
	clearTimeout(timeid);
	timeid=setTimeout(function(){
		GetInfo(id,downloadfile)
	},200);
});

//通过歌曲主页 获取url 以及歌名
function GetHomeMusicToUrlAndTitle(id,callback){
	$.ajax({
		url:"http://www.songtaste.com/song/"+id,
		dataType:"html",
		success:function(result){
			var rex=new RegExp("\<title\>(.*)\<\/title\>?");
			result.match(rex)[0];
			var title=(RegExp.$1).replace("  试听 -- SongTaste 用音乐倾听彼此","");
			/playmedia1\('playicon','player',\r*\s*\n*'(.*?)',.*\);/.exec(result);
			var strURL=RegExp.$1;
			$.ajax({
				url:"http://www.songtaste.com/time.php",
				data:{str:strURL,sid:id,t:0},
				success:function(result){
					callback(result,title);
				}
			})
		}
	});
}

//下载操作
function downloadfile(result,id){
	result=parseXml(result);
	if(result!=null){
		var timestamp = new Date().getTime();
		$("body").append("<a href='"+result.url+"' download='temp' id='down"+"_"+timestamp+"' style='display:none;'>download</a>");
		var obj=new Object();
		if(result.singer_name==""||result.singer_name==null||undefined==result.singer_name){
			obj.name=result.song_name;
		}else{
			obj.name=result.singer_name+"-"+result.song_name;
		}
		if(result.singer_name==""&&result.song_name==""){
			obj.name=GetSongName(id);
		}
		var url=result.url.split("?")[0].split("/");
		obj.url=url[url.length-1].split(".")[0];
		obj.id=id;
		chrome.runtime.sendMessage({cmd: obj});
		ClickE("down"+"_"+timestamp);
	}
}

//获取歌名信息
function GetSongName(id){
	var title="";
	$.ajax({
		url:"http://www.songtaste.com/song/"+id,
		dataType:"html",
		async:false,
		success:function(result){
			var rex=new RegExp("\<title\>(.*)\<\/title\>?");
			var str=result.match(rex)[0];
			title=(RegExp.$1).replace("  试听 -- SongTaste 用音乐倾听彼此","");
		}
	});
	return title;
}
//单手歌曲
var id=0;
if($("img[src='http://image.songtaste.com/imghandle/tmp/songa.jpg']").length>0){
	$("img[src='http://image.songtaste.com/imghandle/tmp/songa.jpg']").remove();
	var regex = /[1-9]\d*/;
	var url=window.location.href;
	var match = url.match(regex);
	if(typeof match != "undefined" && null != match){
		id=match[0];
		GetInfo(id,oneMusic);
	}
	$("#subcmt").after('<input id="subcmt1" type="button" value="提交" style="margin-left:208px; margin-top:5px; display:inline"/>').remove();//评论提交按钮

	$("#ratesong").parent().html('<a id="ratesong" href="javascript:void(0);" title="评价为好听"><img src="http://image.songtaste.com/images/rategood.gif" border=0></a>');//顶歌

	$("#subcmt1").before('<table><tr><td><input type="text" id="secoder" name="secoder" style="width:100px;" onclick="createcode()"/></td><td><span id="secoder_img"></span></td></tr></table>')

}

function check_code() {
	var code = $('#secoder').val();
	var re = $.ajax({
                  url: "http://www.songtaste.com/info_oper.php?tag=check_code",
                  data: "coder="+code,
                  type: 'POST',
                  async: false
             	}).responseText;
	if(re == 'error') return false;
	return true;
}

//顶歌
$(document).on("click","#ratesong",function(){
	clearTimeout(timeid);
	timeid=setTimeout(function(){
		var userid=getCookie("CookID");
		if(undefined==userid){
			noLogin();
		}else{
			$.ajax({
				url:"http://www.songtaste.com/api/android/support.php?uid="+userid+"&songid="+id+"&format=xml HTTP/1.1",
				dataType:"json",
				success:function(result){
					alert(result.msg);
				}
			})
		}
	},200);
});

//收藏
$(document).on("click","#heart",function(){
	var t=$(this);
	var id=t.attr("data-id");
	clearTimeout(timeid);
	timeid=setTimeout(function(){
		collectionSong(id,function(result){
			var msg=hexToDec(result.msg);
			if(result.code==1){
				t.attr("src",chrome.extension.getURL("heart-r.png")).attr("title","取消收藏");
			}else{
				t.attr("src",chrome.extension.getURL("heart-r-o.png")).attr("title","取消收藏");
			}
			alert(msg);
		});
	},200);
})


$(document).on("click","#subcmt1",function(e){
	e.preventDefault();
	var userid=getCookie("CookID");
	if(undefined==userid){
		noLogin();
	}else{
		clearTimeout(timeid);
			timeid=setTimeout(function(){
			if(check_code()){
				var timestamp = Date.parse(new Date());
				var nowtime = parseInt(timestamp/1000);
				setCookie("LastCmt"+userid, nowtime);
				var cmturl = "http://www.songtaste.com/info_oper.php?tag=song_cmt&songid="+id+"&cont="+$("#cont").val()+"&uid="+userid;
				$.ajax({
					url:cmturl,
					contentType : "text/html;charset=gbk",
					success : function(msg){
						if(msg == 'nologin'){
							alert('对不起，您需要登录才能添加歌曲名');
						}
						else if(msg == 'userStatError') {
							alert('您的帐户已经被冻结，不能做任何操作');
						}
						else if(msg == 'nosongname') {
							alert('歌曲名不能为空');
						}
						else if(msg == 'exceedlimit') {
							alert('添加的歌曲名不能超过3个');
						}
						else if(msg == 'userlimit') {
							alert('您只能为该歌曲添加一个歌曲名');
						}
						else if(msg == 'existed') {
							alert('您添加的歌名已存在');
						}
						else if(msg == 'getNameError') {
							alert('获取歌名列表失败，请刷新');
						}
						else{
							$("div.cmt_list").html(msg);
						}

					}
				});
			}else{
				alert("验证码错误！");
			}
		},200);
	}
})

//播放器展现
function oneMusic(result){
	result=parseXml(result);
	if(result!=null){
		var str='<audio src="'+result.url+'" autoplay="true" controls="true" id="audio" loop="loop"></audio>'+"<img src='"+chrome.extension.getURL("download.png")+"' class='downloads' data-id='"+id+"' title='下载'>";
		$(".fir_rec").next("p").html(str);
		$("#audio")[0].addEventListener("error",function(){
			GetHomeMusicToUrlAndTitle(id,function(result){
				$("#audio").attr("src",result);
				$("#audio")[0].play();
			})
		},false);
		var heartimg=result.iscollection==1?chrome.extension.getURL("heart-r.png"):chrome.extension.getURL("heart-r-o.png");
		var title=result.iscollection==1?"取消收藏":"收藏";
		$(".mid_tit").css({"margin-left":0,"width":"315px","display":"inline-block"}).after("<img src='"+heartimg+"' id='heart' data-id='"+id+"' title＝'"+title+"'/>");	
	}
}


//多歌曲列表播放
//播放器
var audio;
var timeid=0;
var indexPlay=0;

//列表链接点击事件
$(document).on("click",".st_main li img.link",function(){
	var id=$(this).parent().attr("id");
	clearTimeout(timeid);
	timeid=setTimeout(function(){
		window.open("http://www.songtaste.com/song/"+id+"/");
	},200);
});

//点击列表文字播放
$(document).on("click",".st_main li>a",function(){
	indexPlay=$("li").index($(this).parent());
	playmusic();
});

//收藏
$(document).on("click",".st_main li img.heart",function(){
	var t=$(this);
	var id=t.attr("data-id");
	clearTimeout(timeid);
	timeid=setTimeout(function(){
		collectionSong(id,function(result){
			var msg=hexToDec(result.msg);
			if(result.code==1){
				t.attr("src",chrome.extension.getURL("heart.png"));
			}else{
				t.attr("src",chrome.extension.getURL("heart-o.png"));
			}
			alert(msg);
		});
	},200);
	
});

//上一首
$(document).on("click",".st_main #prevIcon",function(){
	clearTimeout(timeid);
	timeid=setTimeout(function(){
		if(indexPlay==0){
			indexPlay=arr.length-1;
		}else{
			indexPlay=indexPlay-1;
		}
		playmusic();
	},200)
})

//下一首
$(document).on("click",".st_main #nextIcon",function(){
	clearTimeout(timeid);
	timeid=setTimeout(function(){
		if(indexPlay==(arr.length-1)){
			indexPlay=0;
		}else{
			indexPlay=indexPlay+1;
		}
		playmusic();
	},200)
	
})

//多文件下载按钮
$(document).on("click","#moredownloads",function(){
	clearTimeout(timeid);
	timeid=setTimeout(function(){
		if(arr.length>0){
			GetInfo(arr[0],downloadfile);
			downtemp=1;
			down();
		}
	},200);
});

//多下载下载循环函数
var downtemp=1;
function down(){
	if(downtemp<arr.length){
		setTimeout(function(){
			GetInfo(arr[downtemp],downloadfile);
			downtemp++;
			down();
		},3000);
	}
}

//播放歌曲
function playmusic(){
	$("li").removeClass("cur");
	var t=$("li:eq("+indexPlay+")").addClass("cur");
	var id=$(t).attr("id");
	clearTimeout(timeid);
	timeid=setTimeout(function(){
		GetInfo(id,function(result){
			result=parseXml(result);
			audio.src=result.url;
			audio.play();
		});
	},200);
}

//判断是否是列表播放
var arr=new Array();
if($(".closemusic").length>0){
	window.resizeTo(430,673);
	$("body").css("overflow","hidden").html("<div class='st_main'><ul></ul><div class='playpanel'><img src='"+chrome.extension.getURL("download-b.png")+"' id='moredownloads' title='下载全部歌曲'/><div class='icon' id='prevIcon'><div id='prev' class='previous'></div></div><div id='player'></div><div class='icon' id='nextIcon'><div id='next' class='next'></div></div></div>").css({"background":"#fff","padding":"0px"});
	var rex= /=(.*)/
	var ids=(rex.exec(window.location.href)+"").replace("=","").split(",").unique();
	//若网址＝后面跟的是box 怎么说明是音乐盒 否则为连续播放界面 
	if(ids.length==1&&ids[0].indexOf("box")>=0){
		musicbox();
	}else{
		for(var i=0;i<ids.length;i++){
			createLi(ids[i]);
		}
	}
}

//根据id 创建一条歌曲记录
function createLi(id){
	var userid=getCookie("CookID");
	var url="http://www.songtaste.com/api/android/songurl.php?songid="+id;
	if(undefined!=userid){
		url="http://www.songtaste.com/api/android/songurl.php?songid="+id+"&uid="+userid+"&version=ST0.2.0.05_A1.6 HTTP/1.1";
	}
	$.ajax({
		url:url,
		dataType:"xml",
		success:function(data){
			var result=parseXml(data);
			if(result!=null){
				arr.push(id);
				var obj=new Object();
				if(result.singer_name==""||result.singer_name==null||undefined==result.singer_name){
					obj.name=result.song_name;
				}else{
					obj.name=result.singer_name+"-"+result.song_name;
				}
				obj.heartimg=result.iscollection==1?chrome.extension.getURL("heart.png"):chrome.extension.getURL("heart-o.png");
				obj.hearttitle=result.iscollection==1?"取消收藏":"收藏";
				$(".st_main ul").append("<li id='"+id+"'><img src='"+chrome.extension.getURL("remove.png")+"' class='remove' title='删除' data-id='"+id+"'><a href='javascript:void(0);' title＝'"+obj.name+"'><span>"+($("li").length+1)+"</span>."+obj.name+"</a><img src='"+chrome.extension.getURL("download.png")+"' class='downloads' title='下载' data-id='"+id+"'><img src='"+chrome.extension.getURL("link.png")+"' class='link'><img src='"+obj.heartimg+"' class='heart' data-id='"+id+"' title＝'"+obj.hearttitle+"'></li>");
				if($(".st_main li").length==1){
					//GetInfo(id,loadPlay)
					loadPlay(data);
					$(".st_main ul li:eq(0)").addClass("cur");
				}
			}
		}
	})
}

//根据下标 删除li以及数组记录
$(document).on("click",".st_main li img.remove",function(){
	clearTimeout(timeid);
	var t=$(this);
	timeid=setTimeout(function(){
		var index=$("li").index(t.parent());
		if(t.parent().hasClass("cur")){
			indexPlay=index;
			if(indexPlay==(arr.length-1)){
				indexPlay=0;
			}else{
				indexPlay=indexPlay+1;
			}
			playmusic();
		}
		t.parent().remove();
		arr.splice(index,1);
		$(".st_main li").each(function(i){
			$(this).find("a>span").html(i+1);
		});
	},200)
});

//列表加载音乐播放器 并绑定失败事件 播放完成事件
function loadPlay(result){
	result=parseXml(result);
	var str='<audio src="'+result.url+'" autoplay="true" controls="true" id="audio"></audio>';
	$("#player").html(str);
	audio = document.getElementById('audio');
	audio.loop = false;
	audio.addEventListener('ended', function () {  
		indexPlay
	    $("#nextIcon").click();
	}, false);
	audio.addEventListener("error",function(){
		GetHomeMusicToUrlAndTitle($(".st_main ul li.cur").attr("id"),function(result){
			$("#audio").attr("src",result);
			$("#audio")[0].play();
		})
	},false)
}


//专辑页操作
var aid=0;
//http://songtaste.com/user/album/a609220 取数字即可 前面a无意
if(window.location.href.indexOf("songtaste.com/user/album/")>=0||window.location.href.indexOf("songtaste.com/album/")>=0){
	clearTimeout(timeid);
	timeid=setTimeout(function(){
		var regex = /[1-9]\d*/;
		var url=window.location.href;
		var match = url.match(regex);
		if(typeof match != "undefined" && null != match){
			aid=match[0];
		}
		if($("#albumdownloads").length==0){
			$(".song_fun_btn").append('<input type="button" value="下载本专辑歌曲" id="albumdownloads" class="graycol"/>');
		}
		$(".song_fun_btn").css("width","416px");
	},200);
	$(".graycol:last").after('<input type="button" value="下载勾选歌曲" class="graycol" id="HomeDownload">');
}

//多文件下载按钮
$(document).on("click","#albumdownloads",function(){
	clearTimeout(timeid);
	timeid=setTimeout(function(){
		$.ajax({
			url:"http://songtaste.com/api/android/album_song.php?aid="+aid+"&p=1&n=999999&tmp=0.34633729001507163&callback=dm.st.getDetailBcakAl&code=utf8",
			dataType:"html",
			success:function(result){
				var result=result.replace("dm.st.getDetailBcakAl","");
				result=eval(result);
				if(result.data!=null&&result.data.length>0){
					GetInfo(result.data[0].songid,downloadfile);
					downtemp=1;
					albumdown(result.data);
				}else{
					alert(result.msg);
				}
			}
		});
	},200);
});

//多下载下载循环函数
function albumdown(arr){
	if(downtemp<arr.length){
		setTimeout(function(){
			GetInfo(arr[downtemp].songid,downloadfile);
			downtemp++;
			albumdown(arr);
		},3000);
	}
}

//音乐盒
//http://www.songtaste.com/home.php?tag=box&curpage=1
function musicbox(){
	var userid=getCookie("CookID");
	if(undefined==userid){
		noLogin();
		window.close();
	}else{
		//匹配id和歌名 正则
		clearTimeout(timeid);
		timeid=setTimeout(function() {
			arr=[];
			//开始匹配获取数据
			GetMusicBoxList(1);	
		}, 200);
	}
}

//获取每页音乐盒数据 
function GetMusicBoxList(page){
	var boxrex=/\<td\>\<input type=checkbox name=\"sel\[\]\" value=([1-9]\d*) .*<\/td\>/g;//匹配有id的那个td
	//var regex=new RegExp(boxrex,"g");
	$.ajax({
		url:"http://www.songtaste.com/home.php?tag=box&curpage="+page,
		dataType:"html",
		success:function(result){
			var isNextPage=/\<a href='\/home.php\?tag=box\&curpage=.\d*'>\&raquo;<\/a>/.test(result);//判断有下一页
			result=result.match(boxrex);
			for(var i=0;i<result.length;i++){
				var id=/[1-9]\d*/.exec(result[i]);//匹配数字找到id
				createLi(id[0]);//创建li
				arr.push(id[0]);//将id放入数组 用于下载
				if(arr.length>=200){//音乐盒只能存200条数据
					return;
				}
			}
			if(isNextPage){
				GetMusicBoxList(page++);
			}
		}
	});
}

//推荐歌曲或者收藏歌曲下载
var name="chkSongID";
if(window.location.href.indexOf("songtaste.com/home.php")>=0){
	if($("#subnav .active:eq(0)").text()=="推荐"){
		$(".song_fun_btn").append('<input type="button" value="下载勾选歌曲" class="graycol" id="HomeDownload">');
	}
	if($("#subnav .active:eq(0)").text()=="收藏"){
		$(".mid_tit").prev().append('<input type="button" value="下载勾选歌曲" class="graycol" style="margin-top:19px;cursor: pointer;" id="HomeDownload">');
		$(".mid_tit").prev().css("overflow","hidden");
	}
	if($("#subnav .active:eq(0)").text()=="音乐盒"){
		$(".pages").next().find("ul").before('<input type="button" value="下载勾选歌曲" class="grayform" id="HomeDownload">');
		name="sel[]";
	}
}

//别人眼中我的主页 勾选下载
if(window.location.href.indexOf("songtaste.com/user")>=0){
	if($("#subnav .active:eq(0)").text()=="音乐"||$("#subnav .active:eq(0)").text()=="试听记录"){
		$(".graycol:last").after('<input type="button" value="下载勾选歌曲" class="graycol" id="HomeDownload">');
	}
	
}

//音乐分类勾选下载
if(window.location.href.indexOf("songtaste.com/music/catsong")>=0){
	if($("#subnav .active:eq(0)").text()=="音乐分类"){
		$(".graycol:last").after('<input type="button" value="下载勾选歌曲" class="graycol" id="HomeDownload">');
	}
}

//排行下载
if($("#subnav .active:eq(0)").text()=="一周排行"){
	$(".graycol:last").after('<input type="button" value="下载勾选歌曲" class="graycol" id="HomeDownload">');
}

//标签页操作
if(window.location.href.indexOf("songtaste.com/tag")>0&&$("#subnav .active:eq(0)").text()=="标签列表"){
	//列表下方增加操作按钮
	$(".u_song_tab:eq(0)").after('<div class="song_fun_btn"><input type="button" value="全 选" class="graycol" onclick="javascript:selAll(1);"><input type="button" value="连续播放" class="graycol" onclick="doMusicList()"><input type="button" value="放入音乐盒" class="graycol" onclick="addBoxList()"><input type="button" value="下载勾选歌曲" class="graycol" id="HomeDownload"></div>');
	
	//替换行数字 未勾选框
	$(".u_song_tab:eq(0) .tdidx").each(function(){
		var href=$(this).next().html();
		var id=/[1-9]\d*/.exec(href)[0];
		$(this).html("<input type='checkbox' name='chkSongID' value='"+id+"'>");
	});
}

setTimeout(function(){
	if($("#HomeDownload").length>0){
		$("#HomeDownload").click(function(){
			DownloadHtmlSongList(name);
		})
	}
},200);


function DownloadHtmlSongList(name){
	var userid=getCookie("CookID");
	if(undefined==userid){
		noLogin();
	}else{
		var data=new Array();
		if($("input[name='"+name+"']:checked").length>0){
			$("input[name='"+name+"']:checked").each(function(){
				data.push({songid:$(this).val()});
			});	
		}else{
			if(confirm("并无选中歌曲，是否下载本页全部歌曲？")){
				$("input[name='"+name+"']").each(function(){
					data.push({songid:$(this).val()});
				});	
			}
		}
		if(data.length>0){
			GetInfo(data[0].songid,downloadfile);
			downtemp=1;
			albumdown(data);
		}
	}
	
}