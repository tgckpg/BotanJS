#!/usr/bin/env python3

import os

COMPILER = "/opt/utils/yuicompressor.jar"

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
		os.system( self.C + " " + loc + " -o " + loc[:-4] + ".c.css" )

