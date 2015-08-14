(function(){
	var ns = __namespace( "Components" );

	/** @type {System.Cycle} */
	var Trigger                             = __import( "System.Cycle.Trigger" );
	/** @type {Dandelion} */
	var Dand                                = __import( "Dandelion" );

	// __import( "Dandelion.CSSAnimations" ); CSS_RESERVATION

	var MessageBox = function ( title, content, yes, no, handler )
	{
		var _yes = Dand.wrap(
			"span", null
			, "mbox_button"
			, Dand.wrap( "span", null, "comp flsf", yes || "OK" )
		);

		// left right button
		_yes.onclick = function()
		{
			// if handler is set
			if( this.clickHandler ) this.clickHandler( true );
			document.body.removeChild( this.stage );
			this.stage = null;
		}.bind( this );

		if ( no )
		{
			var _no = Dand.wrap(
				"span", null
				, "mbox_button"
				, Dand.wrap( "span", null, "comp flsf", no )
			);

			_no.onclick = function()
			{
				if( this.clickHandler ) this.clickHandler( false );
				document.body.removeChild( this.stage );
				this.stage = null;
			}.bind( this );
		}


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
