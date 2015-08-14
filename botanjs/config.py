#!/usr/bin/env python3
import configparser

Config = configparser.ConfigParser( interpolation = configparser.ExtendedInterpolation() )
Config.read( "settings.ini" )
