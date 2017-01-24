$(function(){


	$("#options").click(function(){
		chrome.tabs.create({ url: "ui/options.html" });
	});
});