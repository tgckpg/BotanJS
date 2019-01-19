#!env/bin/python

import os
from botanjs.config import Config as config, DEBUG
from subprocess import Popen
from botanjs.service.webapi import WebAPI

SiteRoot = os.path.abspath( "." )

# Setting the SiteRoot for config
config["Paths"]["SiteRoot"] = SiteRoot;

service = WebAPI(
	jsCache = config["Paths"]["Cache"]
	, jsRoot = config["BotanJS"]["SrcDir"]
	, brokerURL = config["BotanJS"]["CeleryBroker"]
)

application = service.app

if __name__ == "__main__":
	service.run( debug = DEBUG )
