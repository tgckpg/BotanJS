#!/usr/bin/env python3

import os;
import re;
import sys;

from xml.dom import minidom
from collections import defaultdict

RegEx_N = re.compile( r"""
		.*
		__namespace
		\s*\(
			\s*(['"])([^\1]+)\1
		\s*\)
		.*
		""", re.X )

RegEx_I = re.compile( r"""
		.*
		__import
		\s*\(
			\s*(['"])([^\1]+)\1
		\s*\)
		.*
		""", re.X )

RegEx_V = re.compile( r"""
		.*
		ns
		\s*\[
		\s*NS_INVOKE
		\s*\]
		\s*\(
			\s*(['"])([^\1]+)\1
		\s*\)
		.*
		""", re.X )

RegEx_E = re.compile( r"""
		.*
		ns
		\s*\[
		\s*NS_EXPORT
		\s*\]
		\s*\(
			\s*EX_([A-Z_]+[A-Z])
			\s*,
			\s*(['"])([^\1]+)\2
			\s*,
			[^\)]+
		\s*\)
		.*
		""", re.X )

def classMeta( cf ):
	ns = ""
	imps = list()
	exps = list()
	for line in open( cf, "r" ):

		m = RegEx_N.match( line )
		if m:
			ns = m.group(2)
			continue

		m = RegEx_I.match( line )
		if m:
			imps.append( m.group(2) )
			continue

		m = RegEx_V.match( line )
		if m:
			imps.append( ns + "." + m.group(2) )
			continue

		m = RegEx_E.match( line )
		if m:
			exps.append( [ m.group(1), m.group(3) ] )
			continue

	return [ ns, imps, exps ]

def className( classFile ):
	return ( os.path
				.splitext( classFile )[0]
				.replace( os.sep, "." )
				.replace( "._this", "" )
				.replace( "..BotanJS.", "" ) )

# __export types definition => nodeName
EX_CLASS = "class"
EX_FUNC = "method"
eDef = defaultdict( lambda: 'prop', { "CLASS": EX_CLASS, "FUNC": EX_FUNC } )

class ClassMap:
	head = None
	DOM = None
	R = None

	def __init__( self, BotanRoot ):
		self.R = BotanRoot
		self.DOM = minidom.parseString( "<BotanJS></BotanJS>" )
		head = os.path.join( self.R, "_this.js" )

	def getNode( self, name, t = EX_CLASS ):
		paths = name.split( "." )

		currentNode = self.DOM.firstChild

		# Step down the path and create the path if necessary
		for path in paths:

			l = currentNode.childNodes
			for i in l:
				if i.getAttribute( "name" ) == path:
					currentNode = i
					break

			if currentNode.getAttribute( "name" ) != path:
				newNode = self.DOM.createElement( t )
				newNode.setAttribute( "name", path )
				currentNode.appendChild( newNode )
				currentNode = newNode

		return currentNode



	def skipFile( self, cf ):

		if os.path.splitext( cf )[1] == ".js":
			if cf == self.head:
				return True
			return False

		return True;

	def drawMap( self, ns, ci, ce, cf ):
		nsNode = self.getNode( ns )

		# Source every:
		# Since namespace may differ from file name
		# ns.__export may export to a different level
		# Source the exported val explicitly means
		# exports only available when source file is imported
		srcEvery = ( ns != className( cf ) )

		cf = cf.replace( self.R, "" )

		if not srcEvery:
			nsNode.setAttribute( "src", cf )

		for ex in ce:
			_t = eDef[ ex[0] ]
			cNode = self.getNode( ns + "." + ex[1], t = _t )

			if srcEvery:
				# The import is for the defined class
				if _t == EX_CLASS:
					for imp in ci:
						impNode = self.DOM.createElement( "import" )
						impNode.appendChild( self.DOM.createTextNode( imp ) )
						cNode.appendChild( impNode )

				cNode.setAttribute( "src", cf )

		# the file dose not export classes
		# Hence it import for itself
		if not srcEvery:
			for imp in ci:
				impNode = self.DOM.createElement( "import" )
				impNode.appendChild( self.DOM.createTextNode( imp ) )
				nsNode.appendChild( impNode )


	def build( self ):
		for root, dirs, files in os.walk( self.R ):

			if root == self.R:
				dirs.remove("externs")

			for name in files:
				classFile = os.path.join( root, name )

				if self.skipFile( classFile ):
					continue

				ns, ci, ce = classMeta( classFile )
				classFile = classFile.replace( self.R + os.path.sep, "" )
				self.drawMap( ns, ci, ce, classFile )
		return self.DOM.toxml()

