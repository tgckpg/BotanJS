from flask import Flask
from flask import Response
from flask import render_template
from flask import request
from botanjs.service.jclassresv import BotanClassResolver as JCResv
from botanjs.service.jwork import app as CeleryApp, JWork
from botanjs.config import Config

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

		self.app = Flask( __name__, static_url_path = self.BCache, static_folder = self.BCache )
		self.app.jinja_env.add_extension( "compressinja.html.HtmlCompressor" )

		self.app.add_url_rule( "/" , view_func = self.index )
		self.app.add_url_rule( "/<mode>/" , view_func = lambda mode: self.api_request( mode, "zpayload" ) )
		self.app.add_url_rule( "/<mode>/<path:code>" , view_func = self.api_request )

	def run( self, *args, **kwargs ):
		return self.app.run( *args, **kwargs )

	def index( self ):
		return "Hello, this is the BotanJS Service API.", 200

	def api_request( self, mode, code ):

		if code == "zpayload":
			code = request.args.get( "p" )

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
