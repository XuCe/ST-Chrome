var obj=new Object();
var errobj=new Object();
function checkForValidUrl(tabId, changeInfo, tab) {
	if(changeInfo.status=="complete"){
		chrome.tabs.executeScript(tab.id, {file: 'content.js'});  
	}
};

chrome.tabs.onUpdated.addListener(checkForValidUrl);

chrome.downloads.onDeterminingFilename.addListener(function(item, suggest) {
	var mime=item.filename.split(".");
	var name=item.filename;
	if(mime[mime.length-1]!="html"){
		name=(obj[mime[mime.length-2]].name.replace(/\.+/,"。"))+"."+mime[mime.length-1];
	}
	suggest({filename:name,
	           conflict_action: "overwrite",
	           conflictAction: 'overwrite'});
})

chrome.downloads.onChanged.addListener(function(delta) {
	if (!delta.state ||(delta.state.current != 'complete')) {
		var path=delta.filename.current.split("/");
		var name=path[path.length-1].split(".")[0];
		id=obj[name].id;
		if(undefined==errobj[id]){
			errobj[id]=name;
			sendMsg(id)	
		}
		return;    
	}
})

function sendMsg(id){
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) { 
		 chrome.tabs.sendMessage(tabs[0].id, {cmd: id});
	});
}

chrome.runtime.onMessage.addListener(  function(request, sender, sendResponse) { 
	var cmd=request.cmd;
	obj[cmd.url]=cmd;
});