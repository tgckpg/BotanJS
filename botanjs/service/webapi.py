#!/usr/bin/env python3
from flask import Flask
from flask import Response
from flask import render_template
from botanjs.service.jclassresv import BotanClassResolver as JCResv
from botanjs.service.jwork import app as CeleryApp, JWork
import os

class WebAPI:

	app = None

	BRoot = None
	BMap = None
	BCache = None

	def __init__( self, jsRoot = "../src", jsCache = "/tmp", brokerURL = None ):

		self.test_templates = os.path.join(
			os.path.dirname( os.path.realpath( __file__ ) )
			, "templates"
			, "test"
		)

		self.BRoot = os.path.abspath( jsRoot )
		self.BCache = os.path.join( jsCache, "botanjs" )
		self.BMap = os.path.join( self.BCache, "bmap.xml" )

		if brokerURL != None:
			CeleryApp.conf.update( BROKER_URL = brokerURL )

		self.app = Flask( __name__, static_url_path = '', static_folder = self.BCache )
		self.app.jinja_env.add_extension( "compressinja.html.HtmlCompressor" )

		self.app.add_url_rule( "/test" , view_func = self.r_test_list )
		self.app.add_url_rule( "/test/<string:test_file>" , view_func = self.r_test )
		self.app.add_url_rule( "/<path:mode>/<path:code>"          , view_func = self.api_request )

		self.app.run( host="0.0.0.0" )

	def r_test_list( self ):
		for root, dirs, files in os.walk( self.test_templates ):
			break

		files.sort()
		files = ( os.path.splitext( x )[0] for x in files )

		return render_template( "test_list.html", data = files )

	def r_test( self, test_file ):
		return render_template( os.path.join( "test", test_file + ".html" ) )


	def api_request( self, mode, code ):
		try:
			t = mode[1:]
			if t == "js":
				t = "application/javascript"
			elif t == "css":
				t = "text/css"

			srvHandler = JCResv( JWork, self.BRoot, self.BMap, self.BCache )
			return Response( srvHandler.getAPI( code, mode = mode ), mimetype = t )
		except LookupError as e:
			return str(e), 404
		# except Exception as e:
			# return str(e), 404

		return "Invalid request", 404

if __name__ == "__main__":
	WebAPI()
