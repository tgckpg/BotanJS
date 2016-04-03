(function(){
	var ns = __namespace( "System.Cycle" );

	/** @type {System.Tick} */
	var utils                   = __import( "System.utils" );
	/** @type {System.Tick} */
	var Tick                    = __import( "System.Tick" );
	/** @type {System.Debug} */
	var debug                   = __import( "System.Debug" );

	var tList = [];

	var C_CALLBACK = 0;
	var C_TIME = 1;
	var C_ONCE = 2;
	var C_ID = 3;
	var C_INTVL = 4;

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
			if( f && thisTime > f[ C_TIME ] )
			{
				try
				{
					f[ C_CALLBACK ]();
				}
				catch(e)
				{
					debug.Error(e);
					delete tList[i];
					continue;
				}

				if( f[ C_ONCE ] )
				{
					delete tList[i];
				}
				else
				{
					f[ C_TIME ] = thisTime + f[ C_INTVL ];
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
			if( tList[i][ C_ID ] == id )
				return false;
		}

		tList[ tList.length ] = [ func, new Date().getTime() + interval, false, id, interval ];
	};

	var deletePermanentTicker = function ( id )
	{
		// 3: id
		for ( var i in tList )
		{
			if( tList[i][ C_ID ] == id )
				delete tList[i];
		}
	};

	var next = function( func )
	{
		var a = [];
		a[ C_CALLBACK ] = func;
		a[ C_TIME ] = 0;
		a[ C_ONCE ] = true;

		tList[ tList.length ] = a;
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
