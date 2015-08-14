(function(){
	var ns = __namespace( "Components.Mouse.Clipboard" );

	/** @type {System.Global} */
	var Global                           = __import( "System.Global" );
	/** @type {System.Debug} */
	var debug                            = __import( "System.Debug" );
	/** @type {System.utils.Perf} */
	var Perf                             = __import( "System.utils.Perf" );
	/** @type {System.Cycle} */
	var Cycle                            = __import( "System.Cycle" );
	/** @type {Dandelion} */
	var Dand                             = __import( "Dandelion" );
	/** @type {Dandelion.Swf} */
	var Swf                              = __import( "Dandelion.Swf" );
	/** @type {Dandelion.Swf.ExtAPI} */
	var ExtAPI                           = __import( "Dandelion.Swf.ExtAPI" );

	var stage
		, helperAddress = "/assets/swf/iClipboard.swf"
		, helperId
		, cCallback
	;

	/** @type {Components.Mouse.Clipboard.SwfHelperObj */
	var clipboardHelper = null;

	var init = function ()
	{
		if( stage ) return;
		stage = Dand.wrapc('ch_obj no_transition no_transition_recursive');

		if( Global.IE )
		{
			document.body.appendChild(stage);
			Cycle.next(
				function (){
					stage.innerHTML = Swf.create(
						helperAddress, 20, 20, helperId = Perf.uuid, 'always', 'transparent'
					);
				}
			);
		}
		else
		{
			stage.appendChild(
				Swf.create(
					helperAddress, 20, 20, helperId = Perf.uuid, 'always', 'transparent'
				)
			);

			document.body.appendChild(stage);
		}

		stage.style.visibility = "hidden";

		ExtAPI.init();
	};

	// Using onmouse<action> properties since event needs to be unique. e.g. single handler

	// Capture mouse by trigger
	var capture = function ( trigger, callback )
	{
		cCallback = callback;

		document.onmousemove = function (e)
		{
			if( trigger() )
			{
				Global.IE && (event || (event = e));
				stage.style.visibility = "";
				stage.style.left = ( e.pageX - 10 ) + "px";
				stage.style.top = ( e.pageY - 10 ) + "px";
			}
		}
	};

	var setTextToCopy = function (textToCopy)
	{
		if( clipboardHelper && clipboardHelper.copy )
		{
			clipboardHelper.copy( textToCopy );
			if( Global.debug && clipboardHelper.debug ) clipboardHelper.debug();
		}
		else
		{
			// This will loop though cycle by cycle until the movie is ready
			Cycle.next(function () {
				clipboardHelper = Swf( helperId );
				setTextToCopy( textToCopy );
			});
		}
	};

	// Called by swf
	var textCopied = function ()
	{
		if( cCallback ) cCallback();

		debug.Info( "[Clipboard] Text copied" );
		stage.style.visibility = "hidden";

		// Release the focus on swf
		clipboardHelper.blur();

		document.onmousemove = null;
	};

	var onMouseOver = function ( callback )
	{
		if( callback == undefined ) return stage.onmouseover;
		stage.onmouseover = callback;
	};

	var onMouseOut = function ( callback )
	{
		if( callback == undefined ) return stage.onmouseout;
		stage.onmouseout = function () {
			stage.style.visibility = "hidden";
			this._callback();
		}.bind({_callback: callback});
	};

	ns[ NS_EXPORT ]( EX_FUNC, "init", init );
	ns[ NS_EXPORT ]( EX_FUNC, "setTextToCopy", setTextToCopy );
	ns[ NS_EXPORT ]( EX_FUNC, "capture", capture );
	ns[ NS_EXPORT ]( EX_VAR, "onMouseOver", onMouseOver );
	ns[ NS_EXPORT ]( EX_VAR, "onMouseOut", onMouseOut );
	ns[ NS_EXPORT ]( EX_FUNC, "_textCopied", textCopied );
})();
