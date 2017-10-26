(function(){
	var ns = __namespace( "System.Encoding.Base64" );

	var Encode = function( buffer )
	{
		var binary = '';
		var len = buffer.length;
		for ( var i = 0; i < len; i ++ )
		{
			binary += String.fromCharCode( buffer[ i ] );
		}
		return btoa( binary );
	};

	ns[ NS_EXPORT ]( EX_FUNC, "Encode", Encode );
})();
