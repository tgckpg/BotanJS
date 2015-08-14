(function(){
	var ns = __namespace( "System" );

	var Tick = function()
	{
		// cycle counter
		var nc = 0;
		this.__started = false;

		this.loop = function()
		{
			for( var i in this.steppers )
				this.steppers[i]();
			nc ++;
		};

		__readOnly( this, "count", function() { return nc; } );
	};

	Tick.prototype.putStepper = function( stepperCallback )
	{
		var l = this.steppers.length;
		this.steppers[l] = stepperCallback;
		return l;
	};

	Tick.prototype.start = function()
	{
		if( !this.__started )
		{
			this.id = setInterval( this.loop.bind( this ), 0 );
			this.__started = true;
		}
	};

	Tick.prototype.stop = function()
	{
		if( this.__started )
		{
			this.__started = false;
			clearInterval( this.id );
		}
	};

	Tick.prototype.steppers = [];

	__readOnly( Tick.prototype, "started", function() { return this.__started; } );

	ns[ NS_EXPORT ]( EX_CLASS, "Tick", Tick );
})();
