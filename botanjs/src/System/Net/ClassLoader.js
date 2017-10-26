(function(){
	var ns = __namespace( "System.Net" );

	/** @type {System.utils} */
	var utils                        = __import( "System.utils" );
	/** @type {System.utils.IKey} */
	var IKey                         = __import( "System.utils.IKey" );
	/** @type {System.Encoding.CodePage} */
	var Utf8                         = __import( "System.Encoding.Utf8" );
	/** @type {System.Encoding.CodePage} */
	var Base64                       = __import( "System.Encoding.Base64" );
	/** @type {Dandelion} */
	var Dand                         = __import( "Dandelion" );

	var Deflate = __import( "System.Compression.Zlib.Deflate" );

	var LoadedClasses = {};

	var loadFile = function ( sapi, payload, mode )
	{
		var head = Dand.tag( "head" )[0];

		// Add css
		head.appendChild(
			Dand.wrapna(
				"link"
				, IKey.quickDef(
					"rel", "stylesheet"
					, "type", "text/css"
					, "href", sapi + mode + "css/?p=" + payload
				)
			)
		);

		// Add js
		head.appendChild(
			Dand.wrapna(
				"script"
				, IKey.quickDef(
					"type", "text/javascript"
					, "src", sapi + mode + "js/?p=" + payload
				)
			)
		);

	};

	var Loader = function( sapi, mode )
	{
		mode = ( mode === undefined ) ? "" : mode;

		this.load = function( classes, handler )
		{
			if( !classes.join ) classes = [ classes ];

			var excludes = BotanJS.getDef();

			var onLoad = function( e )
			{
				if( classes.indexOf( e.data.name ) < 0 ) return;
				handler( e.data.name );
			};

			// Handle the already loaded classes
			var needed = [];
			for( var i in classes )
			{
				var c = classes[i];
				if( ~excludes.indexOf( c ) || LoadedClasses[ c ] )
				{
					handler( c );
				}
				else
				{
					needed.push( c );
				}
			}

			if( !needed.length ) return;

			// Excludes
			utils.objMap( excludes , function( v ) { return "-" + v; } );

			// Compile the payload
			var payload = needed.join( ',' ) + ',' + excludes.join( ',' );
			payload = encodeURIComponent( Base64.Encode( Deflate( Utf8.Encode( payload ) ) ) );

			loadFile( sapi, payload, mode );

			BotanJS.addEventListener( "NS_INIT", onLoad );
			BotanJS.addEventListener( "NS_EXPORT", function( e )
			{
				if( e.data.name )
				{
					LoadedClasses[ e.data.name ] = 1;
				}
				onLoad( e );
			} );
		};
	};

	ns[ NS_EXPORT ]( EX_CLASS, "ClassLoader", Loader );
})();

