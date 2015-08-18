(function(){
	var ns = __namespace( "Components" );

	/** @type {System.Cycle} */
	var Trigger                             = __import( "System.Cycle.Trigger" );
	/** @type {Dandelion} */
	var Dand                                = __import( "Dandelion" );
	/** @type {Dandelion.IDOMObject} */
	var IDOMObject                          = __import( "Dandelion.IDOMObject" );
	/** @type {System.utils.EventKey} */
	var EventKey                            = __import( "System.utils.EventKey" );

	// __import( "Dandelion.CSSAnimations" ); CSS_RESERVATION

	var MessageBox = function ( title, content, yes, no, handler )
	{
		var _self = this;
		var doc = IDOMObject( document );

		var _yes = Dand.wrap(
			"span", null
			, "mbox_button"
			, Dand.wrap( "span", null, "comp flsf", yes || "OK" )
		);

		// left right button
		_yes.onclick = function()
		{
			// if handler is set
			if( _self.clickHandler ) _self.clickHandler( true );
			document.body.removeChild( _self.stage );
			_self.stage = null;
		};

		if ( no )
		{
			var _no = Dand.wrap(
				"span", null
				, "mbox_button"
				, Dand.wrap( "span", null, "comp flsf", no )
			);

			_no.onclick = function()
			{
				if( _self.clickHandler ) _self.clickHandler( false );
				document.body.removeChild( _self.stage );
				_self.stage = null;
			};
		}

		var keyBinding = new EventKey(
			"KeyDown", function ( e )
			{
				e = e || window.event;
				if ( e.keyCode ) code = e.keyCode;
				else if ( e.which ) code = e.which;

				if ( no && code == 27 )
				{
					_no.click();
					doc.removeEventListener( keyBinding );
				}
				else if( code == 13 && ( e.ctrlKey || e.altKey ) )
				{
					_yes.click();
					doc.removeEventListener( keyBinding );
				}
			}
		);

		doc.addEventListener( keyBinding );

		// set handler
		if ( handler ) this.clickHandler = handler;

		this.stage = Dand.wrapc(
			"mbox_mask"
			, this.mbox = Dand.wrapc(
				"mbox_body cubic500"
				, [
					Dand.wrapc( "mbox_titlebar flsf", title )
					, Dand.wrapc( "mbox_content", content )
					, Dand.wrapc( "mbox_buttons", no ? [ _yes, _no ] : _yes )
				]
			)
		);
	};

	MessageBox.prototype.setHandler = function( handler ) { this.clickHandler = handler };

	MessageBox.prototype.show = function ()
	{
		document.body.appendChild( this.stage );
		// Center the box
		var m_style = this.mbox.style;

		m_style.transition = "none";
		m_style.top = m_style.left = "50%";
		m_style.marginLeft = String( -0.5 * this.mbox.clientWidth ) + "px";
		m_style.overflow = "hidden";
		m_style.minHeight = m_style.opacity = m_style.height = 0;
		// The interval in firefox seems independent to etablishing element style
		// using heightTriggers-hack instead
		Trigger.height(
			this.mbox, 0
			, function()
			{
				m_style.transition = m_style.minHeight = m_style.height = m_style.overflow = "";
				m_style.marginTop = String( -0.5 * this.mbox.clientHeight ) + "px";

				m_style.opacity = 1;
			}.bind( this )
		);

		return this.stage;
	};

	ns[ NS_EXPORT ]( EX_CLASS, "MessageBox", MessageBox );
})();
