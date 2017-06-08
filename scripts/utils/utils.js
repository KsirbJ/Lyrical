	
const $utils = {

	/**
	 *	Create a Mutation Observer
	 *	@param	target {string} - The element to observe - Can be any valid jQuery selector
	 *	@param	call_this_function {function} - The function to call when a mutation is observed
	 *	@param config {array} - (optional) The configuration for the observer
	 */
	create_observer: function(target, call_this_function, config = [true, true, false, false]){
			let observer = new MutationObserver(function(mutations) {
				
				mutations.forEach(function(mutation) {
					call_this_function();
				});    
			});

			let observerConfig = {
				attributes: config[0], 
				childList: config[1], 
				characterData: config[2],
				subtree: config[3]
			};

			let targetNode = $(target)[0];
			observer.observe(targetNode, observerConfig);
	},

}

export default $utils;