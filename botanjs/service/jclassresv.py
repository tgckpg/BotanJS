import os, re, base64, zlib, hashlib, binascii
import xml.etree.ElementTree as ET

PY_SEP = os.path.sep

def wrapScope( src ):
	return "(function(){" + src + "})();"

class Resolver:
	resolved = None

	bMap = None
	parentMap = None

	EX_PROP = "prop"
	EX_FUNC = "method"
	EX_CLASS = "class"

	def __init__( self, classMap ):
		self.classMap = classMap
		self._reload()

	def _reload( self ):
		self.bMap = ET.parse( self.classMap )
		# ElementTree does not support Element.find( ".." )
		# Make a parent map to work around
		self.parentMap = { c:p for p in self.bMap.iter() for c in p }

		self.resolved = []

	def resource( self, elem ):
		if "src" in elem.attrib:
			return elem.attrib[ "src" ]

		parent = self.parentMap[ elem ]

		if parent != None:
			return self.resource( parent )

	def resolve( self, c, classList ):
		self.resolved = []
		self.__resolve( c, classList )

	def __resolve( self, c, classList ):

		lista = list( "[@name=\"" + x + "\"]" for x in c.split(".") )

		fx = "/".join( self.EX_CLASS + x for x in lista[:-1] )

		# resolve wildcard A.B.*
		if  c[-2:] == ".*":
			elem = self.bMap.findall( ".//" + fx + self.EX_CLASS )

			if elem == None:
				raise LookupError( "Namespace does not exists or contains no classes: " + c )

			c = c[0:-1]
			for cl in elem:
				cl = c + cl.attrib[ "name" ]

				if cl not in self.resolved:
					self.__resolve( cl, classList )

			return

		it = lista[-1]
		# Test if class
		elem = self.bMap.find( ".//" + fx + self.EX_CLASS + it )

		if elem == None:
			if fx != '': fx += "/"

			# Test if prop
			elem = self.bMap.find( ".//" + fx + self.EX_PROP + it )

			# test if func
			if elem == None:
				elem = self.bMap.find( ".//" + fx + self.EX_FUNC + it )

			if elem == None:
				raise LookupError( "No such class: " + c )

			imports = self.parentMap[ elem ].findall( "import" )

		else:
			imports = elem.findall( "import" )

		self.resolved.append( c )

		for imp in imports:
			if imp.text not in self.resolved:
				self.__resolve( imp.text, classList )

		classList.append([ c, elem ])

class BotanClassResolver:
	R = ""
	CR = None

	classMap = ""
	flagCompress = True
	oModeIfSizelt = 50 * 1024
	returnHash = False
	returnDynamic = False
	resv = None

	def __init__( self, jwork, BotanRoot, classMap, cacheRoot ):

		self.JWork = jwork;
		self.R = os.path.abspath( BotanRoot )
		self.CR = os.path.abspath( cacheRoot )

		os.makedirs( self.CR, 0o755, exist_ok = True )

		if not os.path.exists( classMap ):
			self.JWork.buildClassMap( self.R, classMap )

		self.resv = Resolver( classMap )

	def BotanFile( self, t ):
		content = ""
		with open( os.path.join( self.R, t ), "r" ) as f:
			content = f.read()

		return content

	def BotanCache( self, srcFile, fileHash, hashContentDynamic ):

		for _ in [0]:
			if hashContentDynamic and os.path.getsize( srcFile ) < self.oModeIfSizelt:
				break

			if self.returnHash:
				return fileHash

		with open( srcFile, "r" ) as f:
			return f.read()

	def cleanList( self, lista ):
		olist = []
		for i in lista:
			if i not in olist:
				olist.append( i )
		return olist

	def jsLookup( self, classList, classFiles ):
		for c in classList:
			src = self.resv.resource( c[1] )

			if src == None:
				raise LookupError( "Cannot find src file for: "  + c[0] )

			if src not in classFiles:
				classFiles.append( src )

	def cssLookup( self, jsList, cssList ):

		for f in jsList:
			possibleList = []

			cssFile = os.path.splitext( f )[0] + ".css"

			if cssFile not in possibleList:
				possibleList.append( cssFile )

			f = f.split( PY_SEP )
			l = len( f )

			for i in range( 1, l ):
				cssFile = PY_SEP.join( x for x in f[:-i] ) + PY_SEP + "@_this.css"
				if cssFile not in possibleList:
					possibleList.append( cssFile )

			possibleList.sort()

			for f in possibleList:
				f = f.replace( "@_this.css", "_this.css" )
				if os.path.exists( os.path.join( self.R, f ) ):
					cssList.append( f )


	def getCache( self, fileList, cName, mode ):
		if self.CR == None:
			return None

		md5 = hashlib.md5( bytearray( "".join( fileList ), "utf-8" ) ).hexdigest()

		cName[0] = oFHash = md5 + "." + mode
		cFHash = md5 + ".c." + mode

		# Raw file
		oFile = os.path.join( self.CR, oFHash )
		# Compressed file
		cFile = os.path.join( self.CR, cFHash )

		dates = list(
			os.path.getmtime( os.path.join( self.R, x ) )
			if os.path.exists( os.path.join( self.R, x ) ) else -1
			for x in fileList
		)

		# Root file date
		dates.append( os.path.getmtime( os.path.join( self.R, "_this.js" ) ) );

		if self.flagCompress and self.useCache( cFile, dates ):
			return self.BotanCache( cFile, cFHash, self.returnDynamic )

		elif self.useCache( oFile, dates ):
			self.JWork.saveCache(
				oFile
				# Content is None to initiate a compression
				, None
				, mode
				, os.path.join( self.R, "externs" )
			)

			return self.BotanCache( oFile, oFHash, False )

	def useCache( self, f, dList ):
		if not os.path.exists( f ):
			return False

		t = os.path.getmtime( f )

		for i in dList:
			if t < i:
				return False

		return True

	def compileJs( self, cList, xList ):
		md5 = [ None ]

		for x in xList:
			cList.remove( x ) if x in cList else None

		cacheFile = self.getCache( cList, md5, "js" )

		if cacheFile != None:
			return cacheFile;

		# The root file
		outputJs = self.BotanFile( "_this.js" )


		for f in cList:
			path = (
				os.path.splitext( f )[0]
					.replace( PY_SEP, "." )
					.replace( "._this", "" )
			)
			struct = ";BotanJS.define( \"" + path + "\" );"

			outputJs += struct + self.BotanFile( f )

		outputJs = wrapScope( outputJs )

		self.JWork.saveCache(
			os.path.join( self.CR, md5[0] )
			, outputJs
			, "js"
			, os.path.join( self.R, "externs" )
		)

		if self.returnHash:
			return md5[0]

		return outputJs

	def compileCss( self, cList, xList ):
		cssIList = []
		cssXList = []
		self.cssLookup( cList, cssIList )
		self.cssLookup( xList, cssXList )

		cList = []
		xList = cssXList

		for x in cssIList:
			cList.append( x ) if x not in xList else None

		md5 = [ None ]
		cacheFile = self.getCache( cList, md5, "css" )

		if cacheFile != None:
			return cacheFile;

		outputCss = ""

		for f in self.cleanList( cList ):
			outputCss += self.BotanFile( f )

		self.JWork.saveCache( os.path.join( self.CR, md5[0] ), outputCss, "css" )

		if self.returnHash:
			return md5[0]

		return outputCss

	def getAPI( self, code, mode ):
		self.flagCompress = True
		# Should reload on debug mode only
		self.resv._reload()
		flag = mode[0]
		requestAPIs = code

		# Return compressed contents if possible
		# otherwise return raw contents
		if flag == "o":
			mode = mode[1:]

		# Return raw contents only
		elif flag == "r":
			mode = mode[1:]
			self.flagCompress = False

		# Return hashed filenames only
		elif flag == "h":
			mode = mode[1:]
			self.returnHash = True

		# Return hashed filenames if content is larger than self.oModeIfSizelt bytes
		# otherwise act as "o" mode
		else:
			self.returnHash = True
			self.returnDynamic = True

		try:
			requestAPIs = (
				# decode -> decompress -> split
				zlib.decompress( base64.b64decode( code, None, True ) )
					.decode( "utf-8" )
			)
			sp = ","
		except binascii.Error:
			sp = "/"

		# strip malicious
		requestAPIs = (
				requestAPIs
					.replace( "[^A-Za-z\.\*" + re.escape( sp ) + " ]", "" )
					.split( sp )
			)

		imports = []
		excludes = []

		for apis in requestAPIs:

			if not apis:
				continue

			classList = []
			lookupList = imports

			if apis[0] == "-":
				apis = apis[1:]
				lookupList = excludes

			self.resv.resolve( apis, classList )
			self.jsLookup( classList, lookupList )

		if mode == "js":
			return self.compileJs( imports, excludes )
		elif mode == "css":
			return self.compileCss( imports, excludes )

		raise TypeError( "Invalid mode: " + js )
