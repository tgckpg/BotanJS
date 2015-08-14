(function(){
	var ns = __namespace( "Components" );

	/** @type {System.Cycle} */
	var Cycle                            = __import( "System.Cycle" );
	/** @type {System.utils.DataKey} */
	var DataKey                          = __import( "System.utils.DataKey" );
	/** @type {Dandelion} */
	var Dand                             = __import( "Dandelion" );
	/** @type {Dandelion.IDOMElement} */
	var IDOMElement                      = __import( "Dandelion.IDOMElement" );

	var DockPanel = function( w_id, w_title, w_content, align )
	{
		var w_div = Dand.wrapc('window')
			, w_titleBar = Dand.wrapc('titleBar', w_title)
		;

		if( align.indexOf('top') != -1 )
		{
			w_div.appendChild( Dand.wrapc( 'contentPanel', w_content ) );
			w_div.appendChild( w_titleBar );
			w_div.style.position = "absolute";

			Cycle.next(function ()
			{
				w_div.style.transition = "none";
				w_div.style.top = -w_content.clientHeight + "px";
				IDOMElement( w_div ).setAttribute( new DataKey( "top", w_div.style.top ) );
				Cycle.next( function () { w_div.style.transition = ""; } );
			});
		}
		else if( align.indexOf('bottom') != -1 )
		{
			w_div.appendChild(w_titleBar);
			w_div.appendChild( Dand.wrapc( 'contentPanel', w_content ) );

			Cycle.next(function ()
			{
				w_div.style.transition = "none";
				// w_div.style.bottom = String(w_content.clientHeight) + "px";
				// IDOMElement(w_div).addEventListeners();
				Cycle.next(function () { w_div.style.transition = ""; });
			});
		}

		w_div = Dand.wrap( null, w_id, 'fdock ' + align, w_div );

		document.body.appendChild( w_div );
		return w_div;
	};

	ns[ NS_EXPORT ]( EX_CLASS, "DockPanel", DockPanel );
})();
