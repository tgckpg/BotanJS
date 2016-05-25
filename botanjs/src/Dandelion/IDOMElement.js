(function(){
	var ns = __namespace( "Dandelion" );

	/** @type {System.utils.IKey} */
	var IKey                         = __import( "System.utils.IKey" );
	/** @type {System.utils.Perf} */
	var Perf                         = __import( "System.utils.Perf" );

	var wrap = ns[ NS_INVOKE ]( "wrap" );
	var IDOMObject = ns[ NS_INVOKE ]( "IDOMObject" );

	// IDOMElement, augmented element wrapper utilizing IKeys
	var IDOMElement = function ( element, sw )
	{
		if ( element instanceof IDOMElement ) return element;

		if ( sw )
		{
			IDOMObject.call( this, element, true );

			this["getDAttribute"] = this.getDAttribute.bind( element );

			this["loot"] = this.loot.bind( element );

			this["foreach"] = this.foreach.bind(element);
			this["reverseChild"] = this.reverseChild.bind( element );
			this["clear"] = this.clear.bind( element );
			this["first"] = this.first.bind( element );
			this["last"] = this.last.bind( element );
			this["contains"] = this.contains.bind( element );

			// Org values
			this["style"] = element.style;
			this["hasAttribute"] = function ( key ) { this.hasAttribute( key ); }.bind( element );
			this["removeAttribute"] = function ( key ) { this.removeAttribute( key ); }.bind( element );
			this["element"] = element;

			// Overrides
			this["setAttribute"] = this.setAttribute.bind( element );
		}
		else if ( element && element[ "nodeType" ] != undefined && element.nodeType == 1 )
		{
			return new IDOMElement( element, true );
		}
		else if( element === undefined )
		{
			return new IDOMElement( wrap(), true );
		}
		else
		{
			throw new Error( "[Dandelion.IDOMElement] Invalid argument" );
		}
		return this;
	};

	__extends( IDOMElement, IDOMObject );

	IDOMElement.prototype.setAttribute = function( k, v )
	{
		if( k instanceof IKey )
		{
			this.setAttribute( k.keyName, k.keyValue );
		}
		else if( k instanceof Array )
		{
			for ( var i in k )
			{
				if ( k[i] instanceof IKey )
				{
					this.setAttribute( k[i].keyName, k[i].keyValue );
				}
			}
		}
		else
		{
			this.setAttribute( k, v );
		}
	};

	IDOMElement.prototype.loot = function ( element )
	{
		var _nodes = element.childNodes;
		while(_nodes.length)
		{
			this.appendChild( element.removeChild( _nodes[0] ) );
		}
	};

	IDOMElement.prototype.clear = function ()
	{
		var _nodes = this.childNodes;
		while( _nodes.length )
			this.removeChild( _nodes[0] );
	};

	IDOMElement.prototype.getDAttribute = function(name)
	{
		var i = this.getAttribute("data-" + name);
		return i && decodeURIComponent(i);
	};

	IDOMElement.prototype.foreach = function(type, callback)
	{
		var c = Array.apply( [], this.childNodes ), l = c.length;
		for(var i = 0; i < l; i ++)
		{
			if (c[i].nodeType == type)
			{
				callback(c[i], this);
			}
		}
	};

	var matchNone = function() { return false; };
	var matchType = function( c, t ) { return c.nodeType == t; };
	var matchName = function( c, t ) { return c.nodeName == t; };

	var getMatch = function( type )
	{
		type = typeof( type );
		if( type == "number" ) return matchType;
		else if( type == "string" ) return matchName;

		return matchNone;
	};

	IDOMElement.prototype.first = function ( type, callback )
	{
		var c = this.childNodes;
		var l = c.length;
		var elem = null;
		var tc = getMatch( type );

		for( var i = 0; i < l; i ++ )
		{
			if ( tc( c[i], type ) )
			{
				if( callback === undefined || callback( c[i], this ) )
				{
					elem = c[i];
					break;
				}
			}
		}

		return elem;
	};

	IDOMElement.prototype.last = function ( type, callback )
	{
		var c = this.childNodes;
		var l = c.length - 1;
		var elem = null;
		var tc = getMatch( type );

		for( var i = l; -1 < i ; i -- )
		{
			if ( tc( c[i], type ) )
			{
				if( callback === undefined || callback( c[i], this ) )
				{
					elem = c[i];
					break;
				}
			}
		}

		return elem;
	};

	IDOMElement.prototype.contains = function ( target )
	{
		if( target.parentElement )
		{
			if( target == this )
			{
				return true;
			}
			return this.contains( target.parentElement );
		}
		return false;
	};

	// attribute keys
	IDOMElement.prototype.aKeys = function()
	{
		var ikeys = [];
		var attrs = this.element.attributes;
		var l = attrs.length;
		for( var i = 0; i < l; i ++ )
		{
			ikeys.push( new IKey( attrs[i].name, attrs[i].value ) );
		}
		return ikeys;
	};

	IDOMElement.prototype.reverseChild = function()
	{
		var l = this.childNodes.length - 1;
		while( -1 < -- l )
		{
			this.appendChild( this.childNodes[l] );
		}
	};

	ns[ NS_EXPORT ]( EX_CLASS, "IDOMElement", IDOMElement );
})();
