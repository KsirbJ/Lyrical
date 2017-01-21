	
const $utils = {

	/**
	 *	Create a Mutation Observer
	 *	@param	The id of the element to observe
	 *	@param	The function to call when a mutation is observed
	 */
	create_observer: function(target, call_this_function){
			let observer = new MutationObserver(function(mutations) {
				mutations.forEach(function(mutation) {
					call_this_function();
				});    
			});

			let observerConfig = {
				attributes: true, 
				childList: true, 
				characterData: false
			};

			let targetNode = document.getElementById(target);
			observer.observe(targetNode, observerConfig);
	},

	

}

export default $utils;