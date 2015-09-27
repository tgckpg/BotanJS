(function(){
	var ns = __namespace( "System.Cycle.Trigger" );

	/** @type {System.Cycle} */
	var Cycle                   = __import( "System.Cycle" );
	/** @type {System.Debug} */
	var debug                   = __import( "System.Debug" );

	// trigger list
	var tList = [];
	var stepperId = -1;

	var stepper = function( args )
	{
		var thisTime = new Date().getTime();
		for ( var i in tList )
		{
			var f = tList[i];
			if( f && thisTime > f[2] )
			{
				try
				{
					if( f[0]() )
					{
						f[1]();
						delete tList[i];
					}
					else f[2] = thisTime + f[3];
				}
				catch(e)
				{
					debug.Error(e);
					delete tList[i];
				}
			}
		}
	};

	var registerTrigger = function ( trigger, handler, peekInt )
	{
		tList[ tList.length ] = [ trigger, handler, new Date().getTime() + peekInt, peekInt ]
	};

	var heightTrigger = function ( __element, value, handler )
	{
		var k = function () {
			return ( this.a.clientHeight == this.b );
		}.bind({ a: __element, b: value });

		registerTrigger( k, handler, 50 );
	};

	var transitionTrigger = function (__style, value, handler)
	{
		var k = function ()
		{
			return ( this.a.transition == this.b );
		}.bind({a: __style, b: value });
		registerTrigger( k, handler, 50 );
	};

	var regTick = function( e )
	{
		if( stepperId < 0 )
		{
			stepperId = Cycle.TICK.putStepper( stepper );
		}
	};

	ns.addEventListener( "NS_IMPORT", regTick );

	ns[ NS_EXPORT ]( EX_FUNC, "register", registerTrigger );
	ns[ NS_EXPORT ]( EX_FUNC, "transition", transitionTrigger );
	ns[ NS_EXPORT ]( EX_FUNC, "height", heightTrigger );

	ns[ NS_TRIGGER ]( TGR_IMPORT, regTick );
})();
