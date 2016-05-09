(function(){
	var ns = __namespace( "System.Net" );
	var className = "ClassLoader";

	/** @type {System.utils} */
	var utils                        = __import( "System.utils" );
	/** @type {System.utils.IKey} */
	var IKey                         = __import( "System.utils.IKey" );
	/** @type {Dandelion} */
	var Dand                         = __import( "Dandelion" );

	var LoadedClasses = {};

	var loadFile = function ( sapi, request, mode )
	{
		var head = Dand.tag( "head" )[0];

		// Add css
		head.appendChild(
			Dand.wrapna(
				"link"
				, IKey.quickDef(
					"rel", "stylesheet"
					, "type", "text/css"
					, "href", sapi + mode + "css/" + request
				)
			)
		);

		// Add js
		head.appendChild(
			Dand.wrapna(
				"script"
				, IKey.quickDef(
					"type", "text/javascript"
					, "src",  sapi + mode + "js/" + request
				)
			)
		);

	};

	var Loader = function( sapi, mode )
	{
		mode = ( mode === undefined ) ? "o" : mode;

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
			var loadc = null;

			var sp = mode ? { 'o': '/', 'r': '/' }[ mode ] : ',';

			loadFile(
				sapi
				, needed.join( sp ) + sp + excludes.join( sp )
				, mode
			);

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

