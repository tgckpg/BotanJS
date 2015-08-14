(function(){
	var ns = __namespace( "System.Debug" );
	/** @type {System.Log} */
	var Log = __import( "System.Log" );
	/** @type {System.Global} */
	var _global = __import( "System.Global" );

	var st_info = _global.debug;
	var st_error = true;

	var Error = function( e )
	{
		if( st_error )
		Log.writeLine( e.name + "\n\t" + e.message + "\n\t" + e.stack, Log.ERROR );
	};

	var Info = function(e)
	{
		if( st_info )
		Log.writeLine( e, Log.INFO );
	};

	var turnOff = function( what )
	{
		if( what == "info" ) st_info = false;
		else if( what == "error" ) st_error = false;
	};

	var turnOn = function( what )
	{
		if( what == "info" ) st_info = true;
		else if( what == "error" ) st_error = true;
	};

	/* {{{ Root log override */
	BotanJS.log.write = Info;

	while( !BotanJS.log.end() )
		Info( BotanJS.log.read() );
	/* End Root log override }}}*/

	ns[ NS_EXPORT ]( EX_FUNC, "Error", Error );
	ns[ NS_EXPORT ]( EX_FUNC, "Info", Info );
	ns[ NS_EXPORT ]( EX_FUNC, "turnOff", turnOff );
	ns[ NS_EXPORT ]( EX_FUNC, "turnOn", turnOn );
})();
