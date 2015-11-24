(function(){
	var ns = __namespace( "System.utils" );
	var Global = __import( "System.Global" );


	// Get prop from obj if obj.<prop> is <type>
	var objGetProp = function ( obj, prop, type )
	{
		if(obj && obj[prop])
		{
			var t = obj[prop].constructor.toString().match(/function ([^\(]+)/);
			if(t && t.length == 2 && t[1].toUpperCase() == type.toUpperCase())
			{
				return obj[prop];
			}
		}
		return null;
	};

	var objSearch = function ( obj, cond, prop )
	{
		for( var i in obj )
		{
			if( cond( obj[i] ) )
			{
				return obj[i][prop] || obj[i];
			}
		}
		return null;
	};

	var objMap = function( obj, callback )
	{
		for( var i in obj )
		{
			obj[i] = callback( obj[i] );
		}
	};

	var SiteProto = function( path )
	{
		if( path.match( /^https?:\/\// ) )
		{
			if( Global.SECURE_HTTP )
			{
				return path.replace( /^http:\/\//, "https://" );
			}
			else
			{
				return path.replace( /^https:\/\//, "http://" );
			}
		}
		else
		{
			return "http" + ( Global.SECURE_HTTP ? "s" : "" ) + "://" + path;;
		}
	};

	ns[ NS_EXPORT ]( EX_FUNC, "objGetProp", objGetProp );
	ns[ NS_EXPORT ]( EX_FUNC, "objSearch", objSearch );
	ns[ NS_EXPORT ]( EX_FUNC, "objMap", objMap );

	ns[ NS_EXPORT ]( EX_FUNC, "siteProto", SiteProto );
})();
