(function(){
	var ns = __namespace( "Dandelion.Window" );

	ns[ NS_EXPORT ]( EX_READONLY_GETTER , "scrollTop"    , function() { return window.pageYOffset || document.documentElement.scrollTop; } );
	ns[ NS_EXPORT ]( EX_READONLY_GETTER , "scrollLeft"   , function() { return window.pageXOffset || document.documentElement.scrollLeft; } );
	ns[ NS_EXPORT ]( EX_READONLY_GETTER , "scrollHeight" , function() { return window.scrollHeight || document.documentElement.scrollHeight } );
	ns[ NS_EXPORT ]( EX_READONLY_GETTER , "clientHeight" , function() { return window.clientHeight || document.documentElement.clientHeight; } );
	ns[ NS_EXPORT ]( EX_READONLY_GETTER , "scrollWidth"  , function() { return window.scrollWidth || document.documentElement.scrollWidth } );
	ns[ NS_EXPORT ]( EX_READONLY_GETTER , "clientWidth"  , function() { return window.clientWidth || document.documentElement.clientWidth; } );
})();
