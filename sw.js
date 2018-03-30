const cacheVersion = "v1.0.1";

const cacheList = [
	'/',
  './image/bg.jpg',
  './image/qq.webp',
  './image/robot.webp',
  './image/treeHole.webp',
  './mobile.css',
  './row.css',
	'./style.css'
]

//install
self.addEventListener('install', event => {
	event.waitUntil(
		caches.open(cacheVersion)
			.then(cache => cache.addAll(cacheList))
			.then(() => self.skipWaiting())
	)
})

//catch fetch
self.addEventListener('fetch', event => {
	event.respondWith(
		caches.match(event.request).then(response => {
			//有缓存则先取缓存
			if(response){
				return response;
			}
			//由于fetch请求的request和response都是stream所以多次使用要用副本
			let requestClone = event.request.clone();
			return fetch(requestClone).then(response => {
				//checking
				if(!response || response.status!==200|| response.type !== 'basic'){
					return response;
				}
				//response要用于缓存和渲染
				let responseClone = response.clone();

				caches.open(cacheVersion).then(cache => {
					cache.put(event.request, responseClone);
				})
				return response;
			})
		})
	)
})

//update
self.addEventListener('activate', event => {
	event.waitUntil(
		caches.keys().then(cacheNames => {
			return Promise.all(cacheNames.filter(cachename => {
						if(cacheList.includes(cachename)){
							return caches.delete(cachename);
						}
					})
				)
		}).then(() => {
			return self.clients.claim()
		})
	)
})
