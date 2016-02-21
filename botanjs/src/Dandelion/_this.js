(function(){
	var ns = __namespace( "Dandelion" );
	var IE = __import( "System.Global.IE" );

	/* @type {System.utils.IKey}*/
	var IKey = __import( "System.utils.IKey" );

	/* @type {Dandelion.IDOMElement}*/
	var IDOMElement;

	var appendR = function( container, elements )
	{
		if( elements instanceof Array )
		{
			var l = elements.length;
			for( var i = 0; i < l; i ++ )
			{
				elements[i] && appendR( container, elements[i] );
			}
		}
		else if( typeof elements == "string" )
		{
			container.appendChild( _createTextNode( elements ) );
		}
		// append child, do not do any error handling!
		else if( elements )
		{
			container.appendChild( elements );
		}
	};

	var wrap = function ( wwith, id, wclass, elements, iKeys )
	{
		var tmp = document.createElement( wwith || "div" );
		if( id ) tmp.id = id;
		if( wclass )
		{
   			if( IE )
			{
				tmp.className = wclass;
			}
			else
			{	
				tmp.setAttribute( "class", wclass );
			}
		}

		if ( iKeys )
		{
			if ( iKeys instanceof Array )
			{
				for (var i in iKeys)
				{
					tmp.setAttribute( iKeys[i].keyName, iKeys[i].keyValue );
				}
			}
			else if ( iKeys instanceof IKey )
			{
				tmp.setAttribute( iKeys.keyName, iKeys.keyValue );
			}
		}

		if( elements )
		{
			appendR( tmp, elements );
		}

		return tmp;
	};

	var wrapc = function ( aClass, elements, iKeys ) {
		return wrap( false, false, aClass, elements, iKeys );
	};

	// wrap element afters
	var wrape = function ( elements, iKeys ) {
		return wrap( false, false, false, elements, iKeys );
	};

	// wrap name element after
	var wrapne = function ( name, elements, iKeys ) {
		return wrap( name, false, false, elements, iKeys );
	};

	// wrap name attirbutes after
	var wrapna = function ( name, iKeys ) {
		return wrap( name, false, false, false, iKeys );
	};

	var _createTextNode = function (s)
	{
		return document.createTextNode(s);
	};

	// Bubble up element if <condition>
	var bubbleUp = function ( elem, condition )
	{
		if( condition( elem ) ) return elem;

		return elem.parentNode && bubbleUp( elem.parentNode, condition );
	};

	var chainUpApply = function( elem, func )
	{
		if( !elem ) return;

		var chain = func( elem );

		if( chain && elem.parentNode )
		{
			chainUpApply( elem.parentNode, func );
		}
	};

	var id = function( name, idom )
	{
		var elem = document.getElementById( name );
		if( !elem ) return elem;

		if( idom && runtimeImport() )
		{
			return IDOMElement( elem );
		}

		return elem;
	};

	var elements = function( elem, idom )
	{
		if( idom && runtimeImport() )
		{
			var l = elem.length;
			var ielem = [];
			for( var i = 0; i < l; i ++ )
			{
				ielem[i] = IDOMElement( elem[i] );
			}
			return ielem;
		}

		return elem;
	};

	var tag = function( name, idom, target )
	{
		target = target === undefined ? document : target;
		var elem = target.getElementsByTagName( name );
		return elements( elem, idom );
	};

	var name = function( name, idom, target )
	{
		target = target === undefined ? document : target;
		var elem = target.getElementsByName( name );
		return elements( elem, idom );
	};

	var getClass = function( name, idom, target )
	{
		target = target === undefined ? document : target;
		var elem = target.getElementsByClassName( name );
		return elements( elem, idom );
	};

	var runtimeImport = function()
	{
		if( IDOMElement ) return true;

		try
		{
			var a = "Dandelion.IDOMElement";
			IDOMElement = __import( a );
			return true;
		}
		catch( e ) { }
		return false;
	};

	ns[ NS_EXPORT ]( EX_FUNC, "wrap", wrap );
	ns[ NS_EXPORT ]( EX_FUNC, "wrapc", wrapc );
	ns[ NS_EXPORT ]( EX_FUNC, "wrape", wrape );
	ns[ NS_EXPORT ]( EX_FUNC, "wrapne", wrapne );
	ns[ NS_EXPORT ]( EX_FUNC, "wrapna", wrapna );
	ns[ NS_EXPORT ]( EX_FUNC, "textNode", _createTextNode );
	ns[ NS_EXPORT ]( EX_FUNC, "bubbleUp", bubbleUp );
	ns[ NS_EXPORT ]( EX_FUNC, "chainUpApply", chainUpApply );
	ns[ NS_EXPORT ]( EX_FUNC, "id", id );
	ns[ NS_EXPORT ]( EX_FUNC, "tag", tag );
	ns[ NS_EXPORT ]( EX_FUNC, "name", name );
	ns[ NS_EXPORT ]( EX_FUNC, "glass", getClass );
})();
