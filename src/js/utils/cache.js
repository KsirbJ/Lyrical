
const Cache = {
	_size: {
		max_items: 3000,
		max_size: 1000000,
		cur_items: 0,
		cur_size: 0 // TO-DO
	},	
	_cache: null, // The actual storage 
	/*cache_item: {
		id: '',
		lyrics: '',
		url: '',
		domain: '',
		num_played: 0,
		scroll_stamps: []
	},*/
	// Locks - Prevent DB operations until it's initialized
	_events: {
		init_complete: false,
		init_started: false
	},
	

	// Initilize the cache
	init(){
		Cache._events.init_started = true;

		window.indexedDB = window.indexedDB || window.webkitIndexedDB;
		window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction;
		window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange;
 
		if (!window.indexedDB) {
		   console.log("Your browser doesn't support a stable version of IndexedDB.")
		   Cache._events.init_started = false;
		   return;
		}

		const request = indexedDB.open('LyricCache', 1);

		request.onerror = (event) => {
			console.log(event.target.error.message);
			Cache._events.init_started = false;
		};

		request.onsuccess = (event) => {
		 	Cache._cache = event.target.result;
		 	// Update size
		 	const count_req = Cache._cache.transaction(["lyrics"], "readonly").objectStore("lyrics").count();
		 	count_req.onsuccess = (e) => { 
		 		Cache._size.cur_items = count_req.result;
			 	Cache._events.init_complete = true;
			};
		};

		request.onupgradeneeded = (event) => {
			//console.log("request.onupgradeneeded " + event);
			Cache._cache = event.target.result;

			const obj_store = Cache._cache.createObjectStore("lyrics", { keyPath: "id" });
  			obj_store.createIndex("id", "id", { unique: true });
  			obj_store.createIndex("num_played", "num_played", { unique: false });

  			obj_store.transaction.oncomplete = (e) => {
  				Cache._events.init_complete = true;
  			}
		};
	},

	/**
	 *	Add an item to the cache
	 *	@param cache_item {Object} - The song to add
	 */
	add_item(cache_item, callback){

		if(Cache._events.init_complete){
			if(Cache._size.cur_size >= Cache._size.max_size || Cache._size.cur_items >= Cache._size.max_items){
				const cb = [Cache.add_item, cache_item, callback];
				Cache.eject_lowest(cb);
				return;
			}

			const req = Cache._cache.transaction(["lyrics"], "readwrite").objectStore('lyrics').add(cache_item);
			req.onsuccess = (e) => {
				Cache._size.cur_items++;
				if(callback)
					callback(true);
			};

			req.onerror = (e) => {
				if(callback)
					callback(false);
				console.log(e.target.error.message);
			};

		}else if(Cache._events.init_started){
			setTimeout(() => {
				Cache.add_item(cache_item, callback);
			}, 300);
		}else{
			console.log("DB not initilized");
			return -1;
		}
		
	},

	/**
	 *	Get an item from the cache 
	 *	@param id {string} - The ID of the song to get
	 * 	@param callback {function} - A callback function
	 */
	get_item(id, callback){

		if(Cache._events.init_complete){
			//console.log("in get");
			const transaction = Cache._cache.transaction(["lyrics"], "readwrite");
			const obj_store = transaction.objectStore("lyrics");
			const request = obj_store.get(id);

			request.onerror = (event) => {
				console.log(event.target.error.message);
				callback(null);
			};

			request.onsuccess = (event) => {
				// Return result
				if(event.target.result){
					let data = event.target.result;
					callback(data);
					data.num_played++;
					const update_req = obj_store.put(data);
				}else{
					callback(null);
				}
			  
			};

		}else if(Cache._events.init_started){
			// Wait for cache initilization to complete
			setTimeout(() => {
				Cache.get_item(id, callback);
			}, 300);
		}else{
			console.log("DB not initilized");
			return -1;
		}
		
	},

	/**
	 *	Update a record in tha cache
	 *	@param obj {Object} - The updated record
	 *	@param callback {function} - An optional callback function
	 */
	update_item(obj, callback){
		let req = Cache._cache.transaction(["lyrics"], "readwrite").objectStore("lyrics").put(obj);

		req.onsuccess = (e) => {
			if(callback)
				callback(true);
		};

		req.onerror = (e) => {
			if(callback)
				callback(false);
			console.log(e.target.error.message);
		};
	},

	/**
	 *	Delete a record from the cache
	 *	@param id {string} - The ID of the record to delete
	 *	@param callback {function} - An optional callback function
	 */
	delete_item(id, callback){
		const request = Cache._cache.transaction(["lyrics"], "readwrite").objectStore("lyrics").delete(id);

		request.onsuccess = (e) => {
			Cache._size.cur_items--;
			if(callback){
				if(callback instanceof Array){
					callback[0](callback[1], callback[2]);
				}else{
					callback(true);
				}	
			}
		};

		request.onerror = (e) => {
			if(callback)
				callback(false);
			console.log(e.target.error.message);
		};
	},

	/**
	 *	Remove the least frequently accessed item in the cache
	 *	@param callback {Function} - A callback function
	 */
	eject_lowest(callback){

		const obj_store = Cache._cache.transaction(["lyrics"], "readwrite").objectStore("lyrics");
		const index = obj_store.index('num_played');

		index.openCursor().onsuccess = (e) => {
			const cursor = e.target.result;
			if(cursor){
				Cache.delete_item(cursor.value.id, callback);
			}
		}
	},

	// clear the song cache
	clear(callback){
		const transaction = Cache._cache.transaction(["lyrics"], "readwrite");
		transaction.oncomplete = evt => {
			if(callback) callback(true);
		}
		transaction.onerror = e => {
			console.error(transaction.error);
			if(callback) callback(false);
		}
		const obj_store = transaction.objectStore("lyrics");
		obj_store.clear();
	}
	
}


export default Cache