(function(){
	var ns                              = __namespace( "System.Net" );
	/** @type {System.Debug} */
	var debug                           = __import( "System.Debug" );
	/** @type {Dandelion.IDOMObject} */
	var IDOMObject                      = __import( "Dandelion.IDOMObject" );

	// Handles all http transfers
	var getData = function (uri, handler, failedHandler)
	{
		var request = new XMLHttpRequest();
		debug.Info("[Net] GET: " + uri);
		request.onreadystatechange = function()
		{
			/*
				0: request not initialized 
				1: server connection established
				2: request received 
				3: processing request 
				4: request finished and response is ready
			*/
			if(request.readyState == 2)
			{
				debug.Info("[Net] GET R2:" + uri);
			}
			else if (request.readyState == 4)
			{
				debug.Info("[Net] GET R4:" + uri);
				if (request.status == 200)
				{
					try
					{
						handler(request.responseText);
					}
					catch(e)
					{
						debug.Error(e);
						failedHandler(null);
					}
				}
				else
				{
					debug.Info("[Net] Status: " + request.status.toString());
					debug.Info(request.responseText);
					failedHandler && failedHandler(null);
				}
			}
		}
		request.open("GET", uri, true);
		request.send();
	};

	var postFile = function (uri, data, handlers)
	{
		var request = new XMLHttpRequest()
			, generalExchange = new IDOMObject( request )
			, uploadExchange = new IDOMObject( request.upload )
		;

		if ( uploadExchange ) {
			handlers.progress && uploadExchange.addEventListener("Progress", handlers.progress);
			handlers.failed && uploadExchange.addEventListener("Error", handlers.failed);
		}

		generalExchange.addEventListener("ReadyStateChange", function(e) {
			if ( 4 == this.readyState ) {
				handlers.complete && handlers.complete(request.responseText);
			}
		});

		request.open("POST", uri, true);
		// request.setRequestHeader("Content-Type", "multipart/form-data");
		request.send(data);
	};

	var postData = function (uri, data, handler, failedHandler)
	{
		var request = new XMLHttpRequest();
		// compile post string
		data = compilePostData(data);
		debug.Info("[Net] PostString: " + data);
		request.onreadystatechange = function()
		{
			/*
				0: request not initialized 
				1: server connection established
				2: request received 
				3: processing request 
				4: request finished and response is ready
			*/
			if(request.readyState == 2)
			{
				debug.Info("[Net] POST R2:" + uri);
			}
			else if (request.readyState == 4)
			{
				debug.Info("[Net] POST R4:" + uri);
				if (request.status == 200)
				{
					try
					{
						var obj = JSON.parse(request.responseText);
						obj.status ? handler(obj): failedHandler(obj);
					}
					catch(e)
					{
						debug.Error(e);
						failedHandler(null);
					}
				}
				else
				{
					debug.Info("[Net] Status: " + request.status.toString());
					debug.Info(request.responseText);
					failedHandler(null);
				}
			}
		};

		request.open( "POST", uri );
		request.setRequestHeader( "Content-Type", "application/x-www-form-urlencoded" );
		request.send( data );
	};

	var compilePostData = function (obj)
	{
		var postdata = "timestamp=" + new Date().getTime();
		for(var name in obj)
		{
			postdata += "&" + name + "=" + encodeURIComponent(obj[name]);
		}

		return postdata;
	};

	ns[ NS_EXPORT ]( EX_FUNC, "getData", getData );
	ns[ NS_EXPORT ]( EX_FUNC, "postData", postData );
	ns[ NS_EXPORT ]( EX_FUNC, "postFile", postFile );
	// ns[ NS_EXPORT ]( EX_FUNC, "compilePostData", compilePostData );
})();

