(function(){
	var ns = __namespace( "System.utils" );
	var IKey = ns[ NS_INVOKE ]( "IKey" );
	// Data key
	var DataKey = function ( name, value )
	{
		IKey.call(
			this
			, "data-" + name
			, value ? encodeURIComponent( String( value ) ) : ""
		);
	};

	__extends( DataKey, IKey );

	ns[ NS_EXPORT ]( EX_CLASS, "DataKey", DataKey );
})();
