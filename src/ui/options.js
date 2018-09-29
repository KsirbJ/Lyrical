

$(function(){

	const OPTS = {
		'run_on_gp': true, 
		'run_on_yt': true, 
		'run_on_sp': true, 
		'autoscroll': false, 
		'run_all': false, 
		'yt_detect_mode': true, 
		'yt_mem': true, 
		'pm_mem': true, 
		'sp_mem': true,
		'yt_as': false, 
		'pm_as': false, 
		'sp_as': false
	};

	const showResMsg = (msg) => {
		$("#response_msg").text(msg);
		setTimeout(() => {
			$("#response_msg").text("");
		}, 2000);
	}

	// Restore saved settings on page load
	function pullOptions(){
		chrome.storage.local.get(OPTS, (response) => {
			for(const opt in response){
				if(response[opt] === true){
					$(`#${opt}`).prop("checked", true);
				}else{
					$(`#${opt}`).prop('checked', false);
				}
			}
		});
	}
	
	// Save options on click
	function updateOptions(e){
		for(const opt in OPTS){
			OPTS[opt] = $(`#${opt}`).prop('checked');
		}

		chrome.storage.local.set(
			OPTS,
			() => {
				showResMsg("Options saved - Reload any pages with Lyrical running for changes to take effect");
			}
		);
		e.preventDefault();
		e.stopPropagation();
	}

	// Restore default options
	function restoreDefaults(e){
		chrome.storage.local.set(OPTS, () => {
			pullOptions();
			showResMsg("Options restored to defaults");
		});
		e.preventDefault();
		e.stopPropagation();
	}

	$("#save").click(function(e){updateOptions(e)});
	$("#reset").click((e) => { restoreDefaults(e)})


	$("#tabs ul li").first().addClass("active");
	$("#tabs > div").hide();
	let first_tab = $("#tabs ul li a").first().attr("href");
	$(first_tab).show();

	$(".tab-btn").click(function(e){
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

	$('.clear-cache').on('click', e => {
		e.preventDefault();
		chrome.runtime.sendMessage({message: "clear-cache"});
		showResMsg("Lyrics cache cleared");

	})

	pullOptions();
});