import Cache from "../utils/cache.js"

Cache.init();

// Used to handle the response of a "get" call to the cache. 
// The sendResponse function will return the lyrics to the tab that requested it
// Class so that different instances of tab won't be overwritten
class ResponseHandler {
	constructor(tab){
		this._tab = tab;
	}
	sendResponse(res){
		chrome.tabs.sendMessage(this._tab.tab.id, {message: res}, function(res){
			cur_tab = null;
		});
	}
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
	switch(request.message){
		case 'store-song':
			Cache.add_item(request.song);
			break;
		case 'get-song':
			const responder = new ResponseHandler(sender);
			Cache.get_item(request.id, responder.sendResponse.bind(responder));
			break;
		default:
			break;
	}
});