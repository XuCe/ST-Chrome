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


