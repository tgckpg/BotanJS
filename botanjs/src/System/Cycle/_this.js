(function(){
	var ns = __namespace( "System.Cycle" );

	/** @type {System.Tick} */
	var utils                   = __import( "System.utils" );
	/** @type {System.Tick} */
	var Tick                    = __import( "System.Tick" );
	/** @type {System.Debug} */
	var debug                   = __import( "System.Debug" );

	var tList = [];

	var stepper = function()
	{
		var thisTime = new Date().getTime();
		// 0: Callback
		// 1: scheduled run time
		// 2: Permanent
		// ( 3: id )
		// 4: interval
		for ( var i in tList )
		{
			var f = tList[i];
			if( f && thisTime > f[1] )
			{
				try
				{
					f[0]();
				}
				catch(e)
				{
					debug.Error(e);
					delete tList[i];
					continue;
				}

				if( f[2] )
				{
					delete tList[i];
				}
				else
				{
					f[1] = thisTime + f[4];
				}
			}
		}
	};

	// Should bind "func" before register
	var registerDelay = function (func, milliSec)
	{
		tList[ tList.length ] = [ func, new Date().getTime() + milliSec, true ];
	};

	var registerPermanentTicker = function ( id, func, interval )
	{
		for ( var i in tList )
		{
			if( tList[i][3] == id )
				return false;
		}

		tList[ tList.length ] = [ func, new Date().getTime() + interval, false, id, interval ];
	};

	var deletePermanentTicker = function ( id )
	{
		// 3: id
		for ( var i in tList )
		{
			if( tList[i][3] == id )
				delete tList[i];
		}
	};

	var next = function( func )
	{
		tList[ tList.length ] = [ func, 0, true ];
	};

	var ourTick = new Tick();
	ourTick.putStepper( stepper );

	var gTickStart = function( e )
	{
		e.target.removeEventListener( "NS_IMPORT", gTickStart );

		var TICK = __import( "System.Cycle.TICK", true );

		if( TICK != ourTick && TICK.started )
		{
			debug.Info( "[System.Cycle] Global Tick exists" );
			ourTick = null;
			return;
		}

		debug.Info( "[System.Cycle] Creating global Tick" );
		ourTick.start();
	};

	ns.addEventListener( "NS_IMPORT", gTickStart );

	ns[ NS_EXPORT ]( EX_FUNC, "next", next );
	ns[ NS_EXPORT ]( EX_FUNC, "delay", registerDelay );
	ns[ NS_EXPORT ]( EX_FUNC, "perma", registerPermanentTicker );
	ns[ NS_EXPORT ]( EX_FUNC, "permaRemove", deletePermanentTicker );
	ns[ NS_EXPORT ]( EX_READONLY_GETTER, "TICK", function(){ return ourTick; } );
})();
