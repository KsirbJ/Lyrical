

$(function(){
	// Restore saved settings on page load
	chrome.storage.sync.get({'run_on_gp': true, 'run_on_yt': true, 'autorun': false}, function(response){
		console.log(response);
		if(response.run_on_yt){
			$("#run_on_yt").prop("checked", true);
		}
		if(response.run_on_gp){
			$("#run_on_gp").prop("checked", true);
		}
		if(response.autorun){
			$("#autorun").prop("checked", true);
		}
	});

	// Save options on click
	function update_options(){
		let run_on_gp = $("#run_on_gp").prop('checked');
		let run_on_yt = $("#run_on_yt").prop('checked');
		let autorun = $("#autorun").prop('checked');

		chrome.storage.sync.set({'run_on_gp': run_on_gp, 'run_on_yt': run_on_yt, 'autorun': autorun}, function(){
			$("#response_msg").text("Options saved");
			setTimeout(function(){
				$("#response_msg").text("");
			}, 1500);
		});

	}
	$("#_btn").click(update_options);
});