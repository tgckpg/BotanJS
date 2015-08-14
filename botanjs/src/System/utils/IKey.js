(function(){
	var ns = __namespace( "System.utils" );
	var ClassName = "IKey";

	////// Class IKey
	var IKey = function (name, value)
	{
		if ( name && ( typeof name != "string" ) ) return;
		this.keyName = name;

		if( value instanceof IKey )
		{
			this.keyValue = value;
		}
		else
		{
			this.keyValue = (value != undefined) ? String(value) : "";
		}

		this["keyName"] = this.keyName;
		this["keyValue"] = this.keyValue;
	};

	IKey.prototype.keyName = "";
	IKey.prototype.keyValue = "";

	var quickDef = function()
	{
		var l = arguments.length;

		if( l % 2 != 0 )
		{
			ns[ NS_THROW ]( "Invalid Definition Count", ClassName );
		}

		var keys = [];
		for( var i = 0; i < l; i += 2 )
		{
			keys[ keys.length ] = new IKey( arguments[i], arguments[ i + 1 ] );
		}

		return keys;
	};

	__static_method( IKey, "quickDef", quickDef );

	ns[ NS_EXPORT ]( EX_CLASS, "IKey", IKey );

})();
