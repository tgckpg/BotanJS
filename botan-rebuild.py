#!/usr/bin/env python3
import os, sys
sys.path.append( os.path.abspath( "." ) )

from botanjs.service.jwork import app, JWork
from botanjs.config import Config as config

bmap = os.path.join( config["Paths"]["Cache"], "botanjs", "bmap.xml" )

app.conf.update( BROKER_URL = config["BotanJS"]["CeleryBroker"] )

JWork.buildClassMap.delay( config["BotanJS"]["SrcDir"], bmap )
