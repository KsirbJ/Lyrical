	
const $utils = {

	/**
	 *	Create a Mutation Observer
	 *	@param	target {string} - The element to observe - Can be any valid jQuery selector
	 *	@param	call_this_function {function} - The function to call when a mutation is observed
	 *	@param config {array} - (optional) The configuration for the observer
	 */
	create_observer(target, call_this_function, config = [true, true, false, false]){
			let observer = new MutationObserver(function(mutations) {
				
				mutations.forEach(function(mutation) {
					// wait a bit to let page update
					setTimeout(() => { call_this_function(); }, 200);	
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