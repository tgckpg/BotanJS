(function(){
	var ns = __namespace( "System.Policy" );

	/** @type {System.Global} */
	var Global = __import( "System.Global" );

	var isOriginAllowed = function( origin )
	{
		return -1 < Global.ALLOWED_ORIGINS.indexOf( origin );
	};

	ns[ NS_EXPORT ]( EX_FUNC, "isOriginAllowed", isOriginAllowed );
})();
