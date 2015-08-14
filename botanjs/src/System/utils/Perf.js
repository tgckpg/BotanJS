(function(){
	// Performance Functions
	var ns = __namespace( "System.utils.Perf" );

	/** {{{ Fast UUID generator, RFC4122 version 4 compliant.
	 * author: Jeff Ward (jcward.com).
	 * license: MIT license
	 * link: http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript/21963136#21963136
	 **/
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
	var Array_Reverse = function( array )
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

	ns[ NS_EXPORT ]( EX_READONLY_GETTER, "uuid", UUID );
	ns[ NS_EXPORT ]( EX_FUNC, "ArrayReverse", Array_Reverse );
})();
