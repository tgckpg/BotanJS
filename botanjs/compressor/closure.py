#!/usr/bin/env python3

import os
from tempfile import NamedTemporaryFile

COMPILER = "/opt/utils/closure.jar"

if not os.path.isfile( COMPILER ):
	raise Exception( "Compiler not found" )


COMPILER_OPTIONS = [
	"--compilation_level ADVANCED_OPTIMIZATIONS"
	, "--output_wrapper=\"(function(){%output%})();\""
]


class Wrapper:

	C = None
	# externs
	E = ""

	def __init__( self ):
		self.C = "java -jar "+ COMPILER + " " + " ".join( COMPILER_OPTIONS )

	def scanExterns( self, sdir ):
		for root, dirs, files in os.walk( sdir ):
			# Split file extensions
			files = list( os.path.splitext( x ) for x in files )
			files.sort()
			for f in files:
				files.remove( f ) if f[1] != ".js" else None

			self.E = " --externs " + " --externs ".join(
				os.path.join( root, x )
				# join back extensions
				for x in list( "".join( x ) for x in files )
			)
			break

	def compress( self, loc ):
		content = ""
		with open( loc, "rb" ) as f:
			content = f.read()

		with NamedTemporaryFile() as f:
			f.write( content[12:-5] )
			os.system( self.C + self.E + " --js " + f.name + " --js_output_file " + loc[:-3] + ".c.js" )


