var obj=new Object();
function checkForValidUrl(tabId, changeInfo, tab) {
	if(changeInfo.status=="complete"){
		chrome.tabs.executeScript(tab.id, {file: 'content.js'});  
	}
};

chrome.tabs.onUpdated.addListener(checkForValidUrl);

chrome.downloads.onDeterminingFilename.addListener(function(item, suggest) {
	var mime=item.filename.split(".");
	var name=(obj[item.filename].replace(/\.+/,"。"))+"."+mime[mime.length-1];
	suggest({filename:name,
	           conflict_action: "overwrite",
	           conflictAction: 'overwrite'});
})

chrome.runtime.onMessage.addListener(  function(request, sender, sendResponse) { 
	var cmd=request.cmd;
	obj[cmd.url]=cmd.name;
});


var bUseChromeDownloadAPI = chrome.downloads ? true : false;
var bSelfQuit = false;
function connectNativeApp() {
    bSelfQuit = false;
    var hostName = "com.xunlei.thunder";
    port = chrome.runtime.connectNative(hostName);
    port.onMessage.addListener(onNativeMessage);
}

function onNativeMessage(msg){
	if (message.funcName == "GetPluginEnabled") {
        var ret = message.result;
		GetMoniterDynamicLinks();
		GetBlackListWebsites();
		GetBlackListPages();
		GetIsMonitorProtocol("MonitorEmule");
		GetIsMonitorProtocol("MonitorMagnet");
		GetIsMonitorProtocol("MonitorTradition");
		GetIsMonitorProtocol("MonitorIE");
		GetFiters("MonitorDemain");
		GetFiters("FilterDemain");
		GetFiters("MonitorFileExt");         
    }
}


function sendNativeMsg(msg) {
    if (port != null) {
        port.postMessage(msg);
        console.log("sendNativeMsg msg:%s sucess!", msg);
    }
    else {
        console.log("sendNativeMsg failed!");
    }
}

function SendQuitChrome() {
    bSelfQuit = true;
    var sendQuitChrome = { "funcName": "ChromeQuit", "paramters": [] };
    sendNativeMsg(sendQuitChrome);
    port = null;    
}

function InitPluginEnabled()
{	
    var getEnabled = { "funcName": "GetPluginEnabled", "paramters": [] };

    sendNativeMsg(getEnabled);
}

connectNativeApp();
var downLoadByThunder = { "funcName": "DownLoadByThunder", "paramters": ["https://www.baidu.com/img/bdlogo.png"] };
sendNativeMsg(downLoadByThunder);
SendQuitChrome();