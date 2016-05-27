#!env/bin/python

import os, sys
from botanjs.config import Config as config, DEBUG
from subprocess import Popen
from botanjs.service.webapi import WebAPI

SiteRoot = os.path.abspath( "." )

# Setting the SiteRoot for config
config["Paths"]["SiteRoot"] = SiteRoot;

# Create the lock folder for celery
lockDir = os.path.join( SiteRoot, "env", "var", "run" "celery" )

os.makedirs( lockDir, exist_ok=True )

sys.path.append( os.path.abspath( "." ) )

RUNTIME_ENV = os.path.abspath( os.path.join( "env", "bin" ) )
if RUNTIME_ENV not in os.environ[ "PATH" ]:
	os.environ[ "PATH" ] = RUNTIME_ENV + os.pathsep + os.environ[ "PATH" ]

if __name__ == "__main__":

	jwork = "botanjs.service.jwork"
	nodeName = "botanNode1"

	celOut = open( os.path.join( config["Paths"]["Log"], jwork + "-err.log" ), "a+" )
	cel = Popen(
		[
			"celery", "multi", "restart", nodeName
			, "-A", jwork, "worker"
			, "--pidfile=" + lockDir + jwork + ".pid"
			, "--logfile=" + os.path.join( config["Paths"]["Log"], jwork + ".log" )
			, "--workdir=" + config["Paths"]["Runtime"]
			, "beat", "-l", "info"
		]
		, stdout = celOut
		, stderr = celOut
	)

	celOut.close()

	if not DEBUG and os.fork():
		import logging
		logging.basicConfig(
			filename = os.path.join( config["Paths"]["Log"], "access.log" )
			, level = logging.DEBUG
		)
		sys.exit()

	WebAPI(
		jsCache = config["Paths"]["Cache"]
		, jsRoot = config["BotanJS"]["SrcDir"]
		, brokerURL = config["BotanJS"]["CeleryBroker"]
	)
