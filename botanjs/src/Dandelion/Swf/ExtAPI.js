(function(){
	var ns = __namespace( "Dandelion.Swf.ExtAPI" );
	/** @type {System.Debug} */
	var debug = __import( "System.Debug" );

	var jsReady = false
		, as = 0
		, cutConnection = false

		, watchDogTime = new Date().getTime()
		, watchDogCounter = 0
		, lastCount = 0
	;

	var ExtAPI = function ()
	{
		// TODO
	};

	var isReady = function () { return jsReady; };

	var init = function ()
	{
		jsReady = true;
		debug.Info( "[ExtAPI] " + new Date().toString() );
	};

	var watch = function ()
	{
		if( watchDogCounter - lastCount < 300 )
		{
			lastCount = watchDogCounter;
		}
		else
		{
			cutConnection = true;
			debug.Warning( "[ExtAPI] Console Disabled: possible hanging dectected." )
		}
		watchDogTime = new Date().getTime();
	};

	ns[ NS_EXPORT ]( EX_FUNC, "init", init );
	ns[ NS_EXPORT ]( EX_FUNC, "ready", isReady );
})();
