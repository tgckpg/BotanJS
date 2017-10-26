var BOTANJS_VERSION = "1.0.0b";
/*{{{ Shorthand Functions */
var __extends = function( obj, target ) {
	obj.prototype = Object.create( target.prototype );
	obj.prototype.constructor = obj;
};
var __readOnly = function( prototype, name, callback )
{
	Object.defineProperty( prototype, name, {
		get: callback
		, set: function( v ) {
			throw new Error( "Setting a read-only property: " + this.p );
		}.bind( { p: name } )
	} );
};
var __static_method = function( obj, name, callback )
{
	Object.defineProperty( obj, name, {
		get: function(){ return callback; }
		, set: function( v ) {
			throw new Error( "Setting a read-only property: " + this.p );
		}.bind( { p: name } )
	} );
};
var __const = __static_method;
/* End Shorthand Functions }}}*/

/*{{{ BotanEvent & EventDispatcher */
var BotanEvent = function( name, data )
{
	var __propagating = false;
	var __propagated = false;

	__static_method(
	   this, "propagate"
	   , function()
	   {
		   if( !__propagated )
		   {
			   __propagating = true;
		   }
		   __propagated = true;
	   }
	);

	__static_method(
	   this, "stopPropagating"
	   , function() { __propagating = false; }
	);

	__const( this, "type", name );

	__readOnly(
		this, "propagating"
		, function() { return __propagating; }
	);

	__const( this, "data", data );

	this.setTarget = function( target )
	{
		__const( this, "target", target );
		this.setTarget = undefined;
	}.bind( this );
};

/** @constructor
 *  @extends EventTarget
 **/
var EventDispatcher = function() {
	var events = {};
	var _self = this;

	var getStack = function( name )
	{
		if( !events[ name ] ) events[ name ] = [];
		return events[ name ];
	};

	var _dispatch = function()
	{
		this.evt.propagate();
		for( var i in this.stack )
		{
			if( this.evt.propagating )
			{
				this.stack[ i ]( this.evt );
			}
		}
		this.evt.stopPropagating();
	};

	this.addEventListener = function( type, handler )
	{
		var stack = getStack( type );
		stack[ stack.length ] = handler;
	};

	this.removeEventListener = function( type, handler )
	{
		var stack = getStack( type );
		var i = stack.indexOf( handler );
		if( i < 0 ) return;
		delete stack[ i ];
	};

	/** @type {Function}
	 *  @param {BotanEvent} evt
	 */
	this.dispatchEvent = function( _evt )
	{
		var _stack = getStack( _evt.type );
		if( _evt.setTarget ) _evt.setTarget( _self );
		// Dispatch the event asynchronously
		setTimeout( _dispatch.bind({ evt: _evt, stack: _stack }), 0 );
	};
};

/* End BotanEvent & EventDispatcher }}}*/

/** @type {Array}
 *  @extends {EventDispatcher}
 */
var NamespaceObj = function() {
	EventDispatcher.call( this );
};

NamespaceObj.prototype = new Array();

var packages = {};
var _global = {};
var _NSs = {};
var _cacheIMP = {};

/*{{{ Constants */
var EX_CONST = 0;
var EX_VAR = 1;
var EX_CLASS = 2;
var EX_FUNC = 3;

var EX_READONLY_GETTER = 10;

var NS_INVOKE = 0;
var NS_EXPORT = 1;
var NS_TRIGGER = 10;
var NS_THROW = 11;

var TGR_IMPORT = 0;
/* End Constants }}}*/

/*{{{ Multi-instance handle */
// Check if we are being imported 2nd time
// If yes, we get the instance and overload
// some core methods
var sGarden = window["BotanJS"];

/** @type {BotanJS} */
var BotanJS = null;
var __namespace = null;
var __import = null;

if( sGarden )
{
	BotanJS = sGarden["sg"][0];
	__namespace =  sGarden["sg"][1];
	__import = sGarden["sg"][2];
}
/* End Multi-instance handle }}}*/

/*{{{ Root level bug-free handlers */
BotanJS = BotanJS || (function()
{
	var i = 0;
	var mesg = [];
	var structures = [];
	var edp = new EventDispatcher();

	var log = {};
	log.write = function( m ) { mesg[ mesg.length ] = m; };
	__static_method( log, "read", function() { return mesg[ i ++ ]; } );
	__static_method( log, "end", function() { return ( mesg.length <= i ); } );

	__const( edp, "log", log );

	__static_method( edp, "define", function( f ) { structures[ structures.length ] = f; } );
	__static_method( edp, "getDef", function() { return structures.slice(); } );

	return edp;
})();
/* End Root level bug-free handlers }}}*/

/*{{{ Namespace declarator */
__namespace = __namespace || function( ns )
{
	if( _NSs[ ns ] ) return _NSs[ ns ];

	var p = ns.split(".");
	var l = p.length;

	var target = packages;
	for( var i = 0; i < l; i ++ ) {
		target[ p[i] ] = target[ p[i] ] || {};
		target = target[ p[i] ];
	}

	target.__TRIGGERS = [];

	nsObj = new NamespaceObj;
	nsObj[ NS_EXPORT ] = function( type, name, obj )
	{
		if( this.t[ name ] ) return;
		this.t[ name ] = [ type, obj ];

		/** @type {BotanEvent} */
		var evt = new BotanEvent( "NS_EXPORT", {
			"name": this.n + "." + name
			, "type": type
		});

		BotanJS.dispatchEvent( evt );

	}.bind({ t: target, n: ns });

	nsObj[ NS_INVOKE ] = function( target )
	{
		if( !this.t[ target ] )
		{
			throw new Error(
				"[" + this.n + "] "
				+ "Invoke failed: " + target + " does not exists"
			);
		}

		return this.t[ target ][1];
	}.bind({ t: target, n: ns });

	nsObj[ NS_TRIGGER ] = function( code, func )
	{
		this.__TRIGGERS[ code ] = func;
	}.bind( target );

	nsObj[ NS_THROW ] = function( message, subclass )
	{
		subclass = subclass ? ( "." + subclass ) : "";
		throw new Error(
			"[" + this.n + subclass + "] " + message
		);
	}.bind({ n: ns });

	/** @type {BotanEvent} */
	BotanJS.dispatchEvent( new BotanEvent( "NS_INIT", ns ) );
	return ( _NSs[ ns ] = nsObj );
};
/* End Namespace declarator }}}*/

/*{{{ Import operator */
__import = __import || function( ns, noCache )
{
	var nss = ns.replace( ".*", "" );
	if( _NSs[ nss ] )
	{
		_NSs[ nss ].dispatchEvent( new BotanEvent( "NS_IMPORT", target ) );
	}

	// Read The Cache First
	if( !noCache && _cacheIMP[ ns ] ) return _cacheIMP[ ns ];

	var p = ns.split(".");
	var l = p.length;

	var target = packages;
	var wildcard = false;
	for( var i = 0; i < l; i ++ )
	{
		if( p[i] == "*" )
		{
			wildcard = true;
			break;
		}

		target = target[ p[i] ];

		if( !target )
			throw new Error( "No such class: " + ns );
	}

	if( target instanceof Array && p[i] != "*" )
	{
		var rtarget = null;
		if( target[0] == EX_READONLY_GETTER )
		{
			rtarget = target[1]();
		}
		else
		{
			rtarget = target[1];
		}

		_cacheIMP[ ns ] = rtarget;
		return rtarget;
	}

	var nsObj = {};

	for( var i in target )
	{
		var j = target[i];
		if( j instanceof Array )
		{
			if( wildcard && j[0] == EX_CLASS )
			{
				__const( nsObj, i, j[1] );
			}
			else if( j[0] == EX_FUNC )
			{
				__const( nsObj, i, j[1] );
			}
			else if( j[0] == EX_CONST )
			{
				Object.defineProperty( nsObj, i, {
					get: function() {
						return this.t[ this.p ][1];
					}.bind( { p: i, t: target } )
					, set: function( v ) {
						throw new Error( "Setting a read-only property: " + this.p );
					}.bind( { p: i } )
				});
			}
			else if( j[0] == EX_VAR )
			{
				Object.defineProperty( nsObj, i, {
					get: function() {
						return this.t[ this.p ][1]();
					}.bind( { p: i, t: target } )
					, set: function( v ) {
						this.t[ this.p ][1]( v );
					}.bind( { p: i, t: target } )
				});
			}
			else if( j[0] == EX_READONLY_GETTER )
			{
				Object.defineProperty( nsObj, i, {
					get: j[1]
					, set: function( v ) {
						throw new Error( "Setting a read-only property: " + this.p );
					}.bind( { p: i } )
				});
			}
		}
		// import the namespace
		else if( wildcard && j.__TRIGGERS )
		{
			__const( nsObj, i, __import( nss + "." + i ) );
		}
	}

	_cacheIMP[ ns ] = nsObj;
	return nsObj;
};
/* End Import operator }}}*/

window["BotanJS"] = {};
window["BotanJS"]["version"] = BOTANJS_VERSION;
window["BotanJS"]["codename"] = "Botanical framework.js";
window["BotanJS"]["import"] = function( p )
{
	try { return __import( p ); }
	catch( e )
	{
		if( sGarden ) return sGarden["import"]( p );
		throw e;
	}
};
window["BotanJS"]["sg"] = [ BotanJS, __namespace, __import ];
