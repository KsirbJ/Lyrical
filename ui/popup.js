$(function(){

	// Open options page on-click
	$("#options").click(function(){
		chrome.tabs.create({ url: "ui/options.html" });
	});
});