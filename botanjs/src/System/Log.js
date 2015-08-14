(function(){
	var ns = __namespace( "System.Log" );
	var handler = [];

	var SYSTEM = 1;
	var INFO = 16;
	var ERROR = 32;

	var writeLine = function ( mesg, type )
	{
		type = ( type === undefined ) ? INFO : type;

		var handled = false;
		for( var i in handler )
		{
			handler[i]( mesg, type );
			handled = true;
		}

		if( !handled
			&& window[ "console" ]
			&& console.log
		) console.log( mesg );
	};

	var registerHandler = function( func )
	{
		var index = -1;
		handler[ index = handler.length ] = func;

		return index;
	};

	var removeHandler = function( index )
	{
		delete handler[ index ];
	};

	ns[ NS_EXPORT ]( EX_FUNC, "writeLine", writeLine );
	ns[ NS_EXPORT ]( EX_FUNC, "registerHandler", registerHandler );
	ns[ NS_EXPORT ]( EX_FUNC, "removeHandler", removeHandler );

	ns[ NS_EXPORT ]( EX_CONST, "INFO", INFO );
	ns[ NS_EXPORT ]( EX_CONST, "ERROR", ERROR );
	ns[ NS_EXPORT ]( EX_CONST, "SYSTEM", SYSTEM );
})();
