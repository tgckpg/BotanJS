#!/usr/bin/env python3

import os
from sys import platform
from botanjs.config import Config as config

COMPILER = config[ "BotanJS" ][ "YuiCompressor" ]

if not os.path.isfile( COMPILER ):
	raise Exception( "Compiler not found" )

COMPILER_OPTIONS = [
	"--type css"
]

class Wrapper:

	C = None

	def __init__( self ):
		self.C = "java -jar " + COMPILER + " " + " ".join( COMPILER_OPTIONS )

	def compress( self, loc ):

		if platform == "win32":
			loc = loc.replace( "C:", "" ).replace( "\\\\", "/" )

		os.system( self.C + " " + loc + " -o " + loc[:-4] + ".c.css" )
