
const Cache = {
	max_items: 3000,
	max_size: 1000000,
	cache: null, // The actual storage 
	cache_item: {
		id: '',
		lyrics: '',
		url: '',
		domain: '',
		num_played: 0,
		scroll_stamps: []
	},
	// Locks - Prevent DB operations until it's initialized
	events: {
		init_complete: false,
		init_started: false
	},
	

	// Initilize the cache
	init: function(){
		Cache.events.init_started = true;

		window.indexedDB = window.indexedDB || window.webkitIndexedDB;
 
		window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction;
		window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange;
 
		if (!window.indexedDB) {
		   console.log("Your browser doesn't support a stable version of IndexedDB.")
		   Cache.events.init_started = false;
		   return;
		}

		let request = indexedDB.open('LyricCache', 1);

		request.onerror = function(event) {
			console.log(event.target.error.message);
			Cache.events.init_started = false;
		};

		request.onsuccess = function(event) {
			console.log("request.onsuccess");
		 	Cache.cache = event.target.result;
		 	Cache.events.init_complete = true;
		};

		request.onupgradeneeded = function(event) {
			console.log("request.onupgradeneeded " + event);
			Cache.cache = event.target.result;

			let obj_store = Cache.cache.createObjectStore("lyrics", { keyPath: "id" });
  			obj_store.createIndex("id", "id", { unique: true });
  			obj_store.createIndex("num_played", "num_played", { unique: false });

  			obj_store.transaction.oncomplete = function(e){
  				Cache.events.init_complete = true;
  			}
		};
	},

	/**
	 *	Add an item to the cache
	 *
	 *	@param cache_item {Object} - The song to add
	 */
	add_item: function(cache_item, callback){

		if(Cache.events.init_complete){

			//console.log("in add " + cache_item.id);
			let req = Cache.cache.transaction(["lyrics"], "readwrite")
									.objectStore('lyrics')
									.add(cache_item);

			req.onsuccess = function(e){
				//console.log(e.target)
				if(callback)
					callback(true);
			};

			req.onerror = function(e){
				if(callback)
					callback(false);
				console.log(e.target.error.message);
			};

		}else if(Cache.events.init_started){
			setTimeout(function(){
				Cache.add_item(cache_item);
			}, 300);
		}else{
			console.log("DB not initilized");
			return -1;
		}
		
	},

	/**
	 *	Get an item from the cache 
	 *
	 *	@param id {string} - The ID of the song to get
	 * 	@param callback {function} - A callback function
	 */
	get_item: function(id, callback){

		if(Cache.events.init_complete){
			//console.log("in get");
			let transaction = Cache.cache.transaction(["lyrics"], "readwrite");
			let obj_store = transaction.objectStore("lyrics");
			let request = obj_store.get(id);

			request.onerror = function(event) {
				console.log(event.target.error.message);
				callback(null);
			};


			request.onsuccess = function(event) {
				// Return result
				if(event.target.result){
					let data = event.target.result;
					callback(data);
					data.num_played++;

					let update_req = obj_store.put(data);
				}else{
					callback(null);
				}
			  
			};

		}else if(Cache.events.init_started){
			// Wait for cache initilization to complete
			setTimeout(function(){
				Cache.get_item(id, callback);
			}, 300);
		}else{
			console.log("DB not initilized");
			return -1;
		}
		
	},

	/**
	 *	Update a record in tha cache
	 *
	 *	@param obj {Object} - The updated record
	 *	@param callback {function} - An optional callback function
	 */
	update_item: function(obj, callback){
		let req = Cache.cache.transaction(["lyrics"], "readwrite").objectStore("lyrics").put(obj);

		req.onsuccess = function(e){
			if(callback)
				callback(true);
		};

		req.onerror = function(e){
			if(callback)
				callback(false);
			console.log(e.target.error.message);
		};
	},

	/**
	 *	Delete a record from the cache
	 *
	 *	@param id {string} - The ID of the record to delete
	 *	@param callback {function} - An optional callback function
	 */
	delete_item: function(id, callback){
		let request = cache.transaction(["lyrics"], "readwrite").objectStore("lyrics").delete(id);

		request.onsucces = function(e){
			if(callback)
				callback(true);
		};

		request.onerror = function(e){
			if(callback)
				callback(false);
			console.log(e.target.error.message);
		};
	},

	// Remove the least frequently accessed item in the cache
	eject_lowest: function(callback){
		let obj_store = Cache.cache.transaction(["lyrics"]).objectStore("lyrics");

		let index = obj_store.index('num_played');

		index.openCursor().onsuccess = function(e){
			let cursor = e.target.result;

			if(cursor){
				console.log("got lowest value : " + cursor.key + " " + cursor.value.num_played);
				Cache.delete_item(cursor.value.id, callback);
			}
		}

	}
	
}


export default Cache