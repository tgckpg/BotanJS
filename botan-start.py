#!/usr/bin/env python3

import os, pwd, grp
from botanjs.config import Config as config, DEBUG

import shutil

SiteRoot = os.path.abspath( "." )

config["Paths"]["SiteRoot"] = SiteRoot;

# Create the lock folder for celery
lockDir = SiteRoot + "env/var/run/celery"

os.makedirs( lockDir, exist_ok=True )

import sys
from subprocess import Popen

sys.path.append( os.path.abspath( "." ) )

from botanjs.service.webapi import WebAPI

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
