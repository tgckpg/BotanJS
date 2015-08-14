(function(){
	var ns = __namespace( "Dandelion" );
	/** @type {System.utils.EventKey} */
	var EventKey = __import( "System.utils.EventKey" );

	var EvtsArr = function () { Array.call( this ); };

	/** @param {System.utils.EventKey} e */
	EvtsArr.prototype.indexOf = function( e )
	{
		var l = this.length;
		for( var i = 0; i < l; i ++ )
		{
			/** @type {System.utils.EventKey} */
			var evt = this[i];
			if( evt.type == e.type && evt.handler == e.handler )
			{
				return i;
			}
		}

		return -1;
	};

	__extends( EvtsArr, Array );

	var IDOMObject = function ( obj, sw )
	{
		if ( obj instanceof IDOMObject ) return obj;

		if ( sw )
		{
			this["addEventListener"] = this.addEventListener.bind(obj);
			this["addEventListeners"] = this.addEventListeners.bind(this);
			this["hasListener"] = this.hasListener.bind(obj);
			this["removeEventListener"] = this.removeEventListener.bind(obj);
		}
		else if ( obj )
		{
			return new IDOMObject( obj, true );
		}
		else
		{
			throw new Error( "[Dandelion.IDOMObject] Invalid argument" );
		}
	}

	IDOMObject.prototype.hasListener = function(e)
	{
		if( e instanceof EventKey
			&& this._events
			&& this._events.indexOf(e) != -1
		)
		{
			return this._events[ this._events.indexOf(e) ];
		}
		return null;
	};

	IDOMObject.prototype.addEventListener = function (event, handler)
	{
		var e;
		if (typeof event == "string" && handler)
		{
			e = new EventKey(event, handler);
		}
		else if (event instanceof EventKey)
		{
			e = event;
		}
		else
		{
			return false;
		}

		if ( this._events )
		{
			if ( this._events.indexOf( e ) < 0 )
			{
				this._events.push( e );
			}
			else
			{
				return false;
			}
		}
		else
		{
			this._events = new EvtsArr();
			this._events[0] = e;
		}

		if( this.addEventListener )
		{
			this.addEventListener( e.type, e.handler, false );
		}
		// IE
		else if( this.attachEvent )
		{
			this.attachEvent('on' + e.type, e.handler);
		}
		else
		{
			this['on' + e.type] = e.handler;
		}
		return true;
	};

	IDOMObject.prototype.addEventListeners = function(evtKeys)
	{
		if(evtKeys instanceof Array)
		{
			for (var i in evtKeys)
			{
				this.addEventListener(evtKeys[i]);
			}
		}
	};

	IDOMObject.prototype.removeEventListener = function( e, handler )
	{
		if( handler )
		{
			e = new EventKey( e, handler );
		}

		if( this._events )
		{
			delete this._events[ this._events.indexOf(e) ];
		}

		if( this.removeEventListener )
		{
			this.removeEventListener( e.type, e.handler );
		}
		// IE
		else if( this.detachEvent )
		{
			this.detachEvent( 'on' + e.type, e.handler );
		}
		else
		{
			this['on' + e.type] = null;
		}
	};

	ns[ NS_EXPORT ]( EX_CLASS, "IDOMObject", IDOMObject );
})();

