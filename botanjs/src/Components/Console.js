(function(){
	// Logger
	// log things.
	var ns = __namespace( "Components" );

	/** @type {System.utils.Perf} */
	var Perf                                = __import( "System.utils.Perf" );
	/** @type {System.Cycle} */
	var Cycle                               = __import( "System.Cycle" );
	/** @type {System.Cycle.Tick} */
	var sTick                               = __import( "System.Cycle.TICK" );
	/** @type {System.Global} */
	var _global                             = __import( "System.Global" );
	/** @type {System.Log} */
	var Log                                 = __import( "System.Log" );
	/** @type {System.Debug} */
	var debug                               = __import( "System.Debug" );
	/** @type {Dandelion} */
	var Dand                                = __import( "Dandelion" );
	/** @type {Dandelion.IDOMElement} */
	var IDOMElement                         = __import( "Dandelion.IDOMElement" );
	/** @type {Components.DockPanel} */
	var DockPanel                           = __import( "Components.DockPanel" );

	var objTreeView = function( obj, level, prepend )
	{
		var c = "";
		for (var p in obj)
		{
			if(typeof(obj[p]) == "object")
			{
				c +=
				prepend + Array( level + 1 ).join(" ")
				+ p + ":\n"
				+ objTreeView(
					obj[p]
					, level + 2
					, 0 < level ? prepend : Array( prepend.length ).join(" ")
				);
			}
			else
			{
				c += prepend + Array(level + 1).join(" ") + p + ": " + obj[p] + "\n";
			}
		}
		return c;
	};

	var Console = function ()
	{
		var stage = null
		, response_txt = null
		, lastMsg = null
		, time_txt = null
		, otop = ""
		, cycle = 0
		, sampling = 500
		, led = null

			, ticking = function () {
				if( debugEnv )
				{
					time_txt.innerHTML = ( sTick.count - cycle ) + " cps, Sampling " + sampling + "ms";
					cycle = sTick.count;
					if(led) led.style.color = "yellowgreen";
				}
			}

		, writeLine = function ( dat, type )
		{
			var res_txt = response_txt;

			res_txt.value += "\n" + ( dat = ( dat != undefined ? dat.toString() : "undefined" ) );

			lastMsg.textContent = lastMsg.innerText = dat;

			// disabling color will make led blink since ticking is frequently setting the color to default
			led.style.color = "";
			if( otop ) stage.style.top = otop;
			res_txt.scrollTop = res_txt.scrollHeight;
		}

		, writeError = function (dat)
		{
			writeLine( dat );
			led.setAttribute( "error", 1 );
			stage.setAttribute( "expanded", 1 );
		}
		, LogHandle = function( mesg, type )
		{
			if( type == Log.ERROR ) writeError( mesg );
			else writeLine( mesg );
		}
		;


		response_txt = Dand.wrap('textarea', null, 'response');
		// Time stamp on the bottom right corner
		time_txt = Dand.wrap('span', 'time_stmp');

		// append child
		document.body.appendChild(time_txt);

		response_txt.readOnly = true;

		stage = new DockPanel(
			"debugCons"
			, Dand.wrapc(
				'dbg_statusbar'
				, [
					Dand.wrapc('dbg_title', "Debug Console(Press F9)")
					, lastMsg = Dand.wrapc('dbg_lastMsg')
					, led = Dand.wrap('div', 'dbg_led', 'dbg_led', '\u25CF')
				]
			)
			, Dand.wrap( null, 'debugWrap', null, response_txt )
			, "dtop"
		);

		var istage = IDOMElement( stage );

		Cycle.next(
			function ()
			{
				// get otop
				otop = this.getDAttribute("top");
			}.bind( istage )
		);

		var autoHide = function () { this.style.top = ""; }.bind(stage);
		Cycle.perma('gTicker' + Perf.uuid, ticking, sampling);
		Cycle.perma('gTicker' + Perf.uuid, autoHide, 3000);
		debugEnv = true;

		ticking();

		var f9Binding = function ( e )
		{
			e = e || window.event;
			if ( e.keyCode ) code = e.keyCode;
			else if ( e.which ) code = e.which;

			if ( code == 120 )
			{
				if( this.hasAttribute( "expanded" ) )
				{
					this.removeAttribute( "expanded" );
					led.hasAttribute( "error" ) && led.removeAttribute( "error" );
					this.style.top = otop;
				}
				else
				{
					this.setAttribute( "expanded", "1" );
				}
			}
		}.bind( stage );

		//Attach the var with the event = function 
		if(document.addEventListener) document.addEventListener('keydown', f9Binding, false);
		else if(document.attachEvent) document.attachEvent('onkeydown', f9Binding);
		else document.onkeydown = f9Binding;

		this.log = writeLine;
		this.logError = writeError;

		Log.registerHandler( LogHandle );
		// This will output the debug info
		if( window["debug_info"] )
		{
			debug.Info( objTreeView( debug_info, 0, "[Server] " ) );
		}
	};

	__static_method( Console, "objTreeView", objTreeView );

	ns[ NS_EXPORT ]( EX_CLASS, "Console", Console );
})();
