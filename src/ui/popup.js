

// Open options page on-click
document.getElementById("options").addEventListener("click", function(){
	chrome.tabs.create({ url: "src/ui/options.html" });
});