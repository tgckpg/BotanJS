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
	/** @type {Dandelion.IDOMElement} */
	var IDOMElement                      = __import( "Dandelion.IDOMElement" );
	/** @type {Dandelion} */
	var Dand                             = __import( "Dandelion" );

	var stage, cCallback;

	var init = function ()
	{
		if( !stage )
		{
			stage = Dand.wrapc('ch_obj no_transition no_transition_recursive');
			stage.style.width = "20px";
			stage.style.height= "20px";
			stage.style.overflow = "hidden";
			stage.style.cursor = "default";
			stage.style.opacity = "0";
			stage.style.background = "rgba( 0, 204, 255, 0.5 )";
			document.body.appendChild( stage );

			IDOMElement( stage ).addEventListener( "Click", function( e )
			{
				if( document.body.createTextRange )
				{
					var range = document.body.createTextRange();
					range.moveToElementText( stage );
					range.select();
				}
				else if( window.getSelection )
				{
					var sel = window.getSelection();
					var range = document.createRange();
					range.selectNodeContents( stage );
					sel.removeAllRanges();
					sel.addRange( range );
				}

				document.execCommand( "copy" );
				stage.style.display = "none";
				if( cCallback )
					cCallback();
			});
		}
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
				stage.style.left = ( e.pageX - 10 ) + "px";
				stage.style.top = ( e.pageY - 10 ) + "px";
			}
		}
	};

	var setTextToCopy = function( _text )
	{
		stage.innerHTML = _text;
	};

	var textCopied = function ()
	{
		if( cCallback ) cCallback();

		debug.Info( "[Clipboard] Text copied" );
		document.onmousemove = null;
	};

	var onMouseOver = function ( callback )
	{
		if( callback == undefined ) return stage.onmouseover;

		stage.style.display = "block";
		stage.onmouseover = callback;
	};

	var onMouseOut = function ( callback )
	{
		if( callback == undefined ) return stage.onmouseout;
		stage.onmouseout = function () {
			this._callback();
		}.bind({_callback: callback});
	};

	ns[ NS_EXPORT ]( EX_FUNC, "init", init );
	ns[ NS_EXPORT ]( EX_FUNC, "setTextToCopy", setTextToCopy );
	ns[ NS_EXPORT ]( EX_FUNC, "capture", capture );
	ns[ NS_EXPORT ]( EX_VAR, "onMouseOver", onMouseOver );
	ns[ NS_EXPORT ]( EX_VAR, "onMouseOut", onMouseOut );
})();
