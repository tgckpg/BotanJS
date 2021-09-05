#!/usr/bin/env python3

class log:
	def info( self, *args ):
		print( *args )

class dummyTask( object ):

	Func = None

	def delay( self, *args ):
		self.Func( *args )

	def __init__( self, *args ):
		self.Func = args[0]

	def __call__( self, *args ):
		pass

class dummyConf:
	def update( self, broker_url = None ):
		pass

class app:
	conf = dummyConf()

	def task():
		return dummyTask
