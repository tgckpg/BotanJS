#!/usr/bin/env python3
from flask import Flask
from flask import Response
from flask import render_template
from botanjs.service.jclassresv import BotanClassResolver as JCResv
from botanjs.service.jwork import app as CeleryApp, JWork
from botanjs.config import DEBUG

import os

class WebAPI:

	app = None

	BRoot = None
	BMap = None
	BCache = None

	def __init__( self, jsRoot = "../src", jsCache = "/tmp", brokerURL = None ):

		self.BRoot = os.path.abspath( jsRoot )
		self.BCache = os.path.join( jsCache, "botanjs" )
		self.BMap = os.path.join( self.BCache, "bmap.xml" )

		if brokerURL != None:
			CeleryApp.conf.update( BROKER_URL = brokerURL )

		print( __name__ )
		self.app = Flask( __name__, static_url_path = self.BCache, static_folder = self.BCache )
		self.app.jinja_env.add_extension( "compressinja.html.HtmlCompressor" )

		self.app.add_url_rule( "/" , view_func = self.index )
		self.app.add_url_rule( "/<path:mode>/<path:code>" , view_func = self.api_request )

		self.app.run( host = "0.0.0.0", debug = DEBUG )

	def index( self ):
		return "Hello, this is the BotanJS Service API.", 200

	def api_request( self, mode, code ):
		try:
			t = mode[1:]
			if t == "js":
				t = "application/javascript"
			elif t == "css":
				t = "text/css"

			srvHandler = JCResv( JWork, self.BRoot, self.BMap, self.BCache )
			return Response( srvHandler.getAPI( code, mode = mode ), mimetype = t )
		except Exception as e:
			return str(e), 404


		return "Invalid request", 404

if __name__ == "__main__":
	WebAPI()
