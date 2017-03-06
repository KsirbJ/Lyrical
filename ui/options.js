

$(function(){
	// Restore saved settings on page load
	chrome.storage.sync.get({'run_on_gp': true, 'run_on_yt': true, 'autorun': false, 'auto_pop': false}, function(response){
		console.log(response);
		for(opt in response){
			if(response[opt]){
				$(`#${opt}`).prop("checked", true);
			}
		}
	});

	// Save options on click
	function update_options(e){
		let run_on_gp = $("#run_on_gp").prop('checked');
		let run_on_yt = $("#run_on_yt").prop('checked');
		let autorun = $("#autorun").prop('checked');
		let auto_pop = $("#auto_pop").prop('checked');

		chrome.storage.sync.set({'run_on_gp': run_on_gp, 'run_on_yt': run_on_yt, 'autorun': autorun, 'auto_pop': auto_pop}, function(){
			$("#response_msg").text("Options saved");
			setTimeout(function(){
				$("#response_msg").text("");
			}, 1500);
		});
		e.preventDefault();
		e.stopPropagation();

	}
	$("#_btn").click(function(e){update_options(e)});


	$("#tabs ul li").first().addClass("active");
	$("#tabs > div").hide();
	let first_tab = $("#tabs ul li a").first().attr("href");
	$(first_tab).show();

	$("#tabs > ul > li > a").click(function(e){
		let tab_id = $(this).attr("href");
		$("#tabs ul li").removeClass("active");
		$(this).parent().addClass("active");
		$("#tabs > div").hide();
		$(tab_id).show();

		e.preventDefault();
		e.stopPropagation();
	})
});