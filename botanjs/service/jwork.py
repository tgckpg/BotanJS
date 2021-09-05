#!/usr/bin/env python3
import os
from botanjs.compressor.closure import Wrapper as ClosureWrapper
from botanjs.compressor.yui import Wrapper as YUIWrapper
from botanjs.classmap import ClassMap

CeleryExists = True 
try:
	from celery import Celery
except ImportError:
	CeleryExists = False

if CeleryExists:
	from celery.utils.log import get_task_logger
	app = Celery( "botanJWork" )
	log = get_task_logger( __name__ )

	if os.path.exists( "settings.ini" ):
		from botanjs.config import Config
		app.conf.update( broker_url = Config["BotanJS"]["CeleryBroker"] )

else:
	from botanjs.dummy import app
	from botanjs.dummy import log

class JWork:

	def saveCache( location, content = None, mode = None, externs = "" ):
		if content != None:
			log.info( "Writing file(" +  str( len( content ) ) + "): " + os.path.abspath( location ) )
			with open( location, "w" ) as f:
				f.write( content )

		if mode == "js":
			JWork.compressJs.delay( location, externs )
		elif mode == "css":
			JWork.compressCss( location )

	@app.task()
	def compressJs( md5, externs ):
		log.info( "Compress js: " + md5 )
		w = ClosureWrapper()
		w.scanExterns( externs )
		w.compress( md5 )

	@app.task()
	def compressCss( md5 ):
		log.info( "Compress css: " + md5 )
		w = YUIWrapper()
		w.compress( md5 )

	@app.task()
	def buildClassMap( src, location ):
		log.info( "Building Class Map" )
		c = ClassMap( src )

		os.makedirs( os.path.dirname( location ), exist_ok = True )
		with open( location, "w" ) as f:
			f.write( c.build() )
