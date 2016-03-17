(function(){
	// Performance Functions
	var ns = __namespace( "System.utils.Perf" );

	var lut = [];
	for ( var i=0; i < 256; i++ )
	{
		lut[i] = ( i < 16 ? '0' : '' ) + ( i ).toString(16);
	}

	var UUID = function()
	{
		var d0 = Math.random()*0xffffffff|0;
		var d1 = Math.random()*0xffffffff|0;
		var d2 = Math.random()*0xffffffff|0;
		var d3 = Math.random()*0xffffffff|0;
		return lut[d0&0xff]+lut[d0>>8&0xff]+lut[d0>>16&0xff]+lut[d0>>24&0xff]+'-'+
			lut[d1&0xff]+lut[d1>>8&0xff]+'-'+lut[d1>>16&0x0f|0x40]+lut[d1>>24&0xff]+'-'+
			lut[d2&0x3f|0x80]+lut[d2>>8&0xff]+'-'+lut[d2>>16&0xff]+lut[d2>>24&0xff]+
			lut[d3&0xff]+lut[d3>>8&0xff]+lut[d3>>16&0xff]+lut[d3>>24&0xff];
	};
	/* }}}*/

	// Reverse an array using XOR swap
	var ArrayReverse = function( array )
	{
		var i = null;
		var l = array.length;
		var r = null;
		for (i = 0, r = l - 1; i < r; i += 1, r -= 1)
		{
			var left = array[i];
			var right = array[r];
			left ^= right;
			right ^= left;
			left ^= right;
			array[i] = left;
			array[r] = right;
		}
	};

	// Count Occurance of a string
	var CountSubString = function ( str, search )
	{
		if ( search.length <= 0 )
		{
			return str.length + 1;
		}

		var c = 0;

		for( var i = str.indexOf( search ); 0 <= i ; i = str.indexOf( search, i ) )
		{
			c ++;
			i ++;
		}

		return c;
	};

	ns[ NS_EXPORT ]( EX_READONLY_GETTER, "uuid", UUID );
	ns[ NS_EXPORT ]( EX_FUNC, "CountSubstr", CountSubString );
	ns[ NS_EXPORT ]( EX_FUNC, "ArrayReverse", ArrayReverse );
})();
