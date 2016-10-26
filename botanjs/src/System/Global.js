(function(){
	var ns = __namespace( "System.Global" );

	var debug = function()
	{
		return window[ "debugEnv" ] && window[ "debugEnv" ];
	};

	// for IE < 10
	var IE = Boolean( document[ "all" ] );
	var ALLOWED_ORIGINS = window[ "allowed_origins" ] || [];

	var SECURE_HTTP = window.location.href.match( /^https:\/\// );

	var ua = navigator.userAgent;
	var MOBILE = Boolean(
		~ua.indexOf( "Android" )
		|| ~ua.indexOf( "webOS" )
		|| ~ua.indexOf( "iPhone" )
		|| ~ua.indexOf( "iPad" )
		|| ~ua.indexOf( "iPod" )
		|| ~ua.indexOf( "BlackBerry" )
		|| ~ua.indexOf( "Windows Phone" )
	);

	ns[ NS_EXPORT ]( EX_READONLY_GETTER, "debug", debug );
	ns[ NS_EXPORT ]( EX_CONST, "IE", IE );
	ns[ NS_EXPORT ]( EX_CONST, "ALLOWED_ORIGINS", ALLOWED_ORIGINS );
	ns[ NS_EXPORT ]( EX_CONST, "SECURE_HTTP", SECURE_HTTP );
	ns[ NS_EXPORT ]( EX_CONST, "MOBILE", MOBILE );
})();
