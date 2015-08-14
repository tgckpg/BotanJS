(function(){
	var ns = __namespace( "System.utils" );
	var IKey = ns[ NS_INVOKE ]( "IKey" );
	// Event key
	var EventKey = function ( eventType, eventHandler )
	{
		IKey.call( this, eventType, eventHandler );

		this.type = eventType.toLowerCase();
		this.handler = eventHandler;
	}

	__extends( EventKey, IKey );

	EventKey.prototype.type = "";
	EventKey.prototype.handler = null;

	ns[ NS_EXPORT ]( EX_CLASS, "EventKey", EventKey );
})();
