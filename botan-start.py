#!/usr/bin/env python3

import os, pwd, grp
from botanjs.config import Config as config

def drop_privileges( uid_name='nobody', gid_name='nogroup' ):
	# Get the uid/gid from the name
	running_uid = pwd.getpwnam( uid_name ).pw_uid
	running_gid = grp.getgrnam( gid_name ).gr_gid

	current_uid = os.getuid()

	if current_uid != 0:
		if running_uid == current_uid:
			return True
		print( "Service must be started by root" )
		return False

	# Remove group privileges
	os.setgroups([])

	# Try setting the new uid/gid
	os.setgid( running_gid )
	os.setuid( running_uid )

	# Ensure a very conservative umask
	old_umask = os.umask( 0o022 )

	return True

import shutil

# Create the lock folder for celery
lockDir = "/var/run/celery"
os.makedirs( lockDir, exist_ok=True )
shutil.chown( lockDir, config["Service"]["user"] )

# Imediately drop the root privilege
if drop_privileges( config["Service"]["user"], config["Service"]["group"] ) != True:
	exit()

import sys
from subprocess import Popen

sys.path.append( os.path.abspath( "." ) )

from botanjs.service.webapi import WebAPI

if __name__ == "__main__":

	jwork = "botanjs.service.jwork"
	nodeName = "botanNode1"

	Popen([
		"celery"
		, "multi"
		, "restart"
		, nodeName
		, "-A"
		, jwork
		, "worker"
		, "--pidfile=/var/run/celery/" + jwork + ".pid"
		, "--logfile=" + os.path.join( config["Paths"]["Log"], jwork + ".log" )
		, "--workdir=" + config["Paths"]["Runtime"]
		, "beat"
		, "-l"
		, "info"
	]).communicate()

	WebAPI(
		jsCache = config["Paths"]["Cache"]
		, jsRoot = config["BotanJS"]["SrcDir"]
		, brokerURL = config["BotanJS"]["CeleryBroker"]
	)

