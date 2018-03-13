/**
 *	This module contains the code to autoscroll the lyrics over the duration of the song
 */
export class LyricsScroller {
	constructor(){
		this._panel = null;
		this._panel_inner = null
		this._scroll_speed = 0;
		this._scroll_init_time = 0;
		this._rem_time = 0;
	}

	/**
	 *	Set the lyrics panel to work with
	 *	@param panel_in {jQuery Object} - The panel
	 */
	set panel(panel_in){
		this._panel = panel_in;
		this._panel_inner = this._panel.find("#words");
		this._addStopHandler();
	}

	/**
	 *	Scroll the lyrics over the duration of a song
	 *	@param duration {String} - The song duration in m:ss format
	 */
	scrollSong(duration){
		let split_dur = duration.split(":");
		let speed_in_milli = Number(split_dur[0]) * 60000 + Number(split_dur[1]) * 1000;
		this._scroll_speed = speed_in_milli;
		this._scroll_init_time = new Date().getTime();

		if(this._panel_inner){
			this._panel_inner.stop();
			this._panel_inner.scrollTop(0);			
			this._panel_inner.off('mouseenter mouseleave');
			this._panel_inner.on('mouseenter', this.pauseScroll.bind(this)).on('mouseleave', this.resumeScroll.bind(this))

			// scroll
			this._panel_inner.scroll();
			this._panel_inner.animate({ scrollTop: this._panel_inner[0].scrollHeight}, speed_in_milli);
		}
	}

	pauseScroll(){
		// calculate remaining scroll time 
		// = song length - amount played (time - scroll begin time)
		this._rem_time = this._scroll_speed - (new Date().getTime() - this._scroll_init_time);
		this._scroll_init_time = new Date().getTime(); // Pause init time
		// stop scrolling
		this._panel_inner.stop();
	}

	resumeScroll(){
		if(this._rem_time > 0){
			// Calculate remaining time
			// = remaining time - pause time (time - pause init time)
			this._rem_time -= (new Date().getTime() - this._scroll_init_time );
			this._scroll_init_time = new Date().getTime(); // Scroll reinit time
			this._scroll_speed = this._rem_time; // Scroll over the remaining time
			// Scroll
			this._panel_inner.animate({ scrollTop: this._panel_inner[0].scrollHeight}, this._rem_time);
		}	
	}

	_addStopHandler(){
		// Stop autoscroll onclick
		this._panel_inner.unbind('scroll mousedown wheel DOMMouseScroll mousewheel keyup keydown');
		this._panel_inner.bind('scroll mousedown wheel DOMMouseScroll mousewheel keyup keydown', e => {
			if ( e.which > 0  || e.type == "mousedown" || e.type == "mousewheel"){
				this._panel_inner.stop();
				this._panel_inner.off('mouseenter mouseleave');
			}
		});
	}
}