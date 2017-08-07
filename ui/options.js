

$(function(){
	// Restore saved settings on page load
	chrome.storage.sync.clear();
	function pull_options(){
		chrome.storage.local.get({'run_on_gp': true, 'run_on_yt': true, 'run_on_sp': true, 'autoscroll': false, 
			'run_all': false, 'yt_detect_mode': true, 'yt_mem': true, 'pm_mem': true, 'sp_mem': true,
			'yt_as': false, 'pm_as': false, 'sp_as': false}, 
			function(response){
			//console.log(response);
			for(opt in response){
				if(response[opt]){
					$(`#${opt}`).prop("checked", true);
				}else{
					$(`#${opt}`).prop('checked', false);
				}
			}
		});
	}
	
	// Save options on click
	function update_options(e){
		let run_on_gp = $("#run_on_gp").prop('checked');
		let run_on_yt = $("#run_on_yt").prop('checked');
		let run_on_sp = $("#run_on_sp").prop('checked');
		let autoscroll = $("#autoscroll").prop('checked');
		let run_all = $('#run_all').prop('checked');
		let yt_detect_mode = $("#yt_detect_mode").prop('checked');
		let yt_mem = $("#yt_mem").prop('checked');
		let pm_mem = $("#pm_mem").prop('checked');
		let sp_mem = $("#sp_mem").prop('checked');
		let yt_as = $("#yt_as").prop('checked');
		let pm_as = $("#pm_as").prop('checked');
		let sp_as = $("#sp_as").prop('checked');

		chrome.storage.local.set({'run_on_gp': run_on_gp, 'run_on_yt': run_on_yt, 'run_on_sp': run_on_sp, 
			'autoscroll': autoscroll, 'run_all': run_all, 'yt_detect_mode': yt_detect_mode, 'yt_mem': yt_mem, 
			'pm_mem': pm_mem, 'sp_mem': sp_mem, 'sp_as': sp_as, 'yt_as': yt_as, 'pm_as': pm_as},
			function(){
			$("#response_msg").text("Options saved - Reload any pages with Lyrical running for changes to take effect");
			setTimeout(function(){
				$("#response_msg").text("");
			}, 2000);
		});
		e.preventDefault();
		e.stopPropagation();
	}

	// Restore default options
	function restore_defaults(e){
		chrome.storage.local.set({'run_on_gp': true, 'run_on_yt': true, 'run_on_sp': true, 'autoscroll': false, 
			'run_all': false, 'yt_detect_mode': true, 'yt_mem': true, 'pm_mem': true, 'sp_mem': true,
			'yt_as': false, 'pm_as': false, 'sp_as': false}, function(){
				pull_options();
				$("#response_msg").text("Options restored to defaults");
				setTimeout(function(){
					$("#response_msg").text("");
				}, 1500);
		});
		e.preventDefault();
		e.stopPropagation();
	}

	$("#save").click(function(e){update_options(e)});
	$("#reset").click((e) => { restore_defaults(e)})


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
	});

	$(".more").click(function(e){
		$(this).parent().parent().next().toggle();
		return false;
	})
	$(".more-text").width($("#yt_options").width());

	pull_options();
});