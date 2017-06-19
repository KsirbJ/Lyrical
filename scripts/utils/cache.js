
const Cache = {
	max_items: 3000,
	max_size: 1000000,
	cache: null, 
	cache_item: {
		id: '',
		lyrics: '',
		url: '',
		domain: '',
		num_played: 0,
		scroll_stamps: []
	},
	// Locks
	events: {
		init_complete: false,
		init_started: false,
		put_started: false,
		put_complete: false,
		get_started: false,
		get_complete: false
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
			console.log(event.target.error.message)
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
	add_item: function(cache_item){

		if(Cache.events.init_complete){
			console.log("in add " + cache_item.id);
			let transaction = Cache.cache.transaction(["lyrics"], "readwrite");

			transaction.oncomplete = function(e){

			};

			transaction.onerror = function(e){
				console.log(e.target.error.message)
			};

			let obj_store = transaction.objectStore('lyrics');
			let req = obj_store.add(cache_item);
			req.onsuccess = function(e){

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

		console.log(callback);
		if(Cache.events.init_complete){
			console.log("in get");
			let transaction = Cache.cache.transaction(["lyrics"], "readwrite");
			let obj_store = transaction.objectStore("lyrics");
			let request = obj_store.get(id);

			request.onerror = function(event) {
				console.log(event.target.error.message)
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
					console.log("not found");
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

	update_item: function(obj, callback){
		let req = Cache.cache.transaction(["lyrics"], "readwrite").objectStore("lyrics").put(obj);

		req.onsuccess = function(e){
			if(callback)
				callback("success");
		};

		req.onerror = function(e){
			if(callback)
				callback(e.target.error.message);
		};
	},

	delete_item: function(id){
		let request = cache.transaction(["lyrics"], "readwrite").objectStore("lyrics").delete(id);
	},

	eject_lowest: function(){

	}
	
}


export default Cache