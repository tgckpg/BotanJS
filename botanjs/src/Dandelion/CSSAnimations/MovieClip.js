(function(){
	var ns = __namespace( "Dandelion.CSSAnimations" );

	/** @type {System.utils.EventKey} */
	var EventKey                         = __import( "System.utils.EventKey" );
	/** @type {System.Cycle.Trigger} */
	var Trigger                          = __import( "System.Cycle.Trigger" );
	/** @type {Dandelion} */
	var Dand                             = __import( "Dandelion" );
	/** @type {Dandelion.IDOMElement} */
	var IDOMElement                      = __import( "Dandelion.IDOMElement" );

	var MovieClip = function (
		__target
		, __row, __col
		, __width, __height
		, frame, start
	)
	{
		if( frame == __row * __col ) frame = 0;

		var canvas = Dand.wrapc( "motion_block no_transition" )
			, r = __row - 1
			, c = __col - 1
			, w = __width
			, h = __height
			, i = 0, j = 0
			, k = 0, l = frame - 1
		;

		var _next, _prev, _goto;

		if( frame )
		{
			_next = function ()
			{
				( c < ++ i ) && ( ( i = 0 ) || ( ( r < ++ j ) && ( j = 0 ) ) );
				( l < ++ k ) && ( i = j = k = 0 );
			};

			_prev = function ()
			{
				( -- k < 0 ) && ( k = l );
				_goto( k );
			};

			_goto = function ( f )
			{
				for ( i = j = k = 0; 0 < f; f -- ) _next();
			};
		}
		else
		{
			_next = function ()
			{
				( c < ++ i ) && ( ( i = 0 ) || ( ( r < ++ j ) && ( j = 0 ) ) );
			};

			_prev = function ()
			{
				( -- i < 0 ) && ( ( i = c ) && ( ( -- j < 0 ) && ( j = r ) ) );
			};

			_goto = function ( f )
			{
                for ( i = j = k = 0; k < f; k ++ ) _next();
			};
		}

		canvas.style.backgroundImage = "url(" + __target + ")";
		canvas.style.width = w + "px";
		canvas.style.height = h + "px";
		canvas.style.backgroundPosition = "0px 0px";

		var updateCanvas = function()
		{
			canvas.style.backgroundPosition = ( -i * w ) + "px " + ( -j * h ) + "px";
		};

		// At 0 position
		var at0 = function() { return ( i == 0 && j == 0 ) };

		var obj = {
			_next: function() { _next(); updateCanvas(); return at0(); }
			, _prev: function() { _prev(); updateCanvas(); return at0(); }
			, _goto: function( n ) { _goto( n ); updateCanvas(); }
		};

		this["stage"] = canvas;
		this["nextFrame"] = this.nextFrame.bind( obj );
		this["prevFrame"] = this.prevFrame.bind( obj );
		this["gotoFrame"] = this.gotoFrame.bind( obj );
	};

	MovieClip.prototype.nextFrame = function ()
	{
		return this._next();
	};

	MovieClip.prototype.prevFrame = function ()
	{
		return this._prev();
	};

	MovieClip.prototype.gotoFrame = function ( frameNumber )
	{
		return this._goto( frameNumber );
	};

	MovieClip.prototype.stage = null;

	/** @param {Dandelion.CSSAnimations.MovieClip} mc
	 *  @param {Boolean} whenStatic
	 */
	var MouseOverMovie = function ( mc, whenStatic )
	{
		if ( mc instanceof MovieClip )
		{
			var canRegister = true;
			var terminate = false;

			var registrar = function () { return mc.nextFrame() || terminate; }; 

			var handler = function ()
			{
				mc.gotoFrame( whenStatic );
				canRegister = true;
				terminate = false;
			};

			var mouseOverHandler = function ( e )
			{
				if( canRegister )
				{
					canRegister = false;
					mc.gotoFrame(0);
					Trigger.register( registrar, handler, 33 );
				}
			};

			var mouseOutHandler = function ( e )
			{
				if( !canRegister )
					terminate = true;
			};

			mc.gotoFrame( whenStatic );

			IDOMElement( mc.stage ).addEventListeners([
				new EventKey( "MouseOver", mouseOverHandler )
				, new EventKey( "MouseOut", mouseOutHandler )
			]);
		}
	};

	ns[ NS_EXPORT ]( EX_CLASS, "MovieClip", MovieClip );
	ns[ NS_EXPORT ]( EX_FUNC, "MouseOverMovie", MouseOverMovie );
})();
