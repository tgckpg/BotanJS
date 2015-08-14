(function(){
	var ns = __namespace( "Dandelion" );

	/** @type {System.utils} */
	var utils                        = __import( "System.utils" );
	/** @type {System.utils.IKey} */
	var IKey                         = __import( "System.utils.IKey" );
	/** @type {System.Policy} */
	var Policy                       = __import( "System.Policy" );
	/** @type {System.Debug} */
	var Dand                         = __import( "Dandelion" );

	var IE                           = __import( "System.Global.IE" );

	var s_current = {player: false, mask: false, stage: false, listener: false, sid: null};

	var Swf = function (movieName)
	{
		if ( navigator.appName.indexOf("Microsoft") != -1 )
		{
			return window[movieName];
		}
		else
		{
			return document[movieName];
		}
	};

	var realize = function (id)
	{
		var movieElement = Dand.id('swfWrapper_' + id)
		, swf_origin = Dand.wrap('a')
		, _src = movieElement.getAttribute("value")

		swf_origin.href = _src;

		if( Policy.isAllowedOrigin( stf_origin.host ) ) {
			swf_origin = "always";
		} else {
			swf_origin = "never";
		}

		movieElement.onclick = ( IE ? createMovieIE : createMovie ).bind({
			sid: id
			, src: _src
			, width: movieElement.style.width
			, height: movieElement.style.height
			, s_stage:movieElement
			, origin: swf_origin
		});
	};

	/*
	var getCurrentMovie = function (args)
	{
		if ( window.ExtAPI )
		{
			return thisMovie( s_current.sid );
		}
		return null;
	};
	*/

	var createMovieIE = function ()
	{
		// Remove previous movie if exists
		if(s_current.stage)
		{
			s_current.stage.firstChild.className = "swf_inactive";
			s_current.stage.firstChild.innerHTML = s_current.player;
			s_current.stage.childNodes[1].style.bottom = "";
			s_current.stage.onclick = s_current.listener;
		}

		this.s_stage.childNodes[1].style.bottom = "-2em";
		s_current.sid = "swf_" + this.sid;

		s_current.stage = this.s_stage;
		s_current.player = this.s_stage.firstChild.innerHTML;

		this.s_stage.firstChild.className = "swf_active";
		this.s_stage.firstChild.innerHTML = makeStageIE(this.src, this.width, this.height, s_current.sid, this.origin);

		// Save event listener
		s_current.listener = this.s_stage.onclick;

		// disable click event
		this.s_stage.onclick = null;
	};

	var createMovie = function ()
	{

		// Remove previous movie if exists
		if(s_current.stage)
		{
			s_current.stage.removeChild(s_current.player);
			s_current.stage.firstChild.style.bottom = "";
			s_current.stage.insertBefore(mask, stage.firstChild);
			s_current.stage.onclick = s_current.listener;
		}


		this.s_stage.childNodes[1].style.bottom = "-2em";
		s_current.sid = "swf_" + this.sid;

		// Remove mask
		(s_current.stage = this.s_stage).removeChild(s_current.mask = this.s_stage.childNodes[0]);

		s_current.player = makeStage(this.src, this.width, this.height, s_current.sid, this.origin);
		this.s_stage.appendChild(s_current.player);

		// Save event listener
		s_current.listener = this.s_stage.onclick;

		// disable click event
		this.s_stage.onclick = null;

	};

	var makeStage = function (src, width, height, sid, origin, wmode)
	{
		return Dand.wrapna("embed",
			[
				new IKey("src", src)
				, new IKey("quality", "high")
				, new IKey("bgcolor", "#869ca7")
				, new IKey("width", width)
				, new IKey("height", height)
				, new IKey("name", sid)
				, new IKey("align", "middle")
				, new IKey("wmode", wmode || "direct")
				, new IKey("play", "true")
				, new IKey("loop", "false")
				, new IKey("quality", "high")
				, new IKey("allowScriptAccess", origin)
				, new IKey("type", "application/x-shockwave-flash")
				, new IKey("pluginspage", "http://www.macromedia.com/go/getflashplayer")
			]
		);
	};

	var makeStageIE = function (src, width, height, sid, origin, wmode)
	{
		return Dand.wrape(
			Dand.wrapne('object',
				[
					Dand.wrapna("param", [new IKey("name", "wmode"), new IKey("value", wmode || "direct")])
					, Dand.wrapna("param", [new IKey("name", "quality"), new IKey("value", "high")])
					, Dand.wrapna("param", [new IKey("name", "movie"), new IKey("value", src)])
					, Dand.wrapna("param", [new IKey("name", "bgcolor"), new IKey("value", "#869ca7")])
					, Dand.wrapna("param", [new IKey("name", "allowScriptAccess"), new IKey("value", origin)])
				]
				,
				[
					new IKey("classid", "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000")
					, new IKey("id", sid)
					, new IKey("name", sid)
					, new IKey("width", width)
					, new IKey("height", height)
					, new IKey("data", src)
					, new IKey("type", "application/x-shockwave-flash")
					, new IKey("codebase", "http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab")
				]
			)
		).innerHTML;
	};

	__static_method( Swf, "create", IE ? makeStageIE : makeStage );
	__static_method( Swf, "realize", realize );

	ns[ NS_EXPORT ]( EX_CLASS, "Swf", Swf );
})();
