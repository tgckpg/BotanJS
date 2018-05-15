(function(){
	// Usage reference refers to Astroblog.AstroEdit.SiteLibrary::buildImageCanvas
	var ns = __namespace( "Components.Mouse" );

	/** @type {System.utils} */
	var utils                            = __import( "System.utils" );
	/** @type {System.utils.IKey} */
	var IKey                             = __import( "System.utils.IKey" );
	/** @type {System.utils.DataKey} */
	var DataKey                          = __import( "System.utils.DataKey" );
	/** @type {System.utils.EventKey} */
	var EventKey                         = __import( "System.utils.EventKey" );
	/** @type {System.Cycle} */
	var Cycle                            = __import( "System.Cycle" );
	/** @type {Dandelion} */
	var Dand                             = __import( "Dandelion" );
	/** @type {Dandelion.IDOMElement} */
	var IDOMElement                      = __import( "Dandelion.IDOMElement" );
	/** @type {Components.Mouse.Clipboard} */
	var Clipboard 						 = __import( "Components.Mouse.Clipboard" );

	var ContextMenu = function ( target, items, whichButton, menuInsideTarget, overrides )
	{
		if ( !target.id )
			throw new Error( "[ContextMenu] target's id is missing" );

		if( !( items instanceof Array ) )
			throw new Error( "[ContextMenu] items is not an array" );

		var stage = null
		, mouseOnTarget = false
		, mouseOnContext = false
		, menuGroup = Dand.id("contextMenus") || (
			document.body.appendChild( Dand.wrap( null, "contextMenus", "compx" ) )
		)
		, targetParent
		, temp, i, j
		, _items = []

		, getFuncOverride = function(prop) { return utils.objGetProp( overrides, prop, "Function" ); }
		, getStrOverride = function(prop) { return utils.objGetProp( overrides, prop, "String" ); }

		, matchActions = function (element)
		{
			element = Dand.bubbleUp( element, isMenuItem );

			for (i in _items)
			{
				// match attributes
				if(element == _items[i].stage)
				{
					// perform action
					return _items[i].key.handler(element);
				}
			}
			return false;
		}

		, isMenuItem = function(e)
		{
			if( e === document ) return false;
			return IDOMElement(e).getDAttribute("menuItem");
		}

		, addMenuIdentifier = function(dataKey)
		{
			var d = new DataKey("menuItem", 1);
			return dataKey ? [dataKey, d] : d;
		}

		, contextMouseDown = function(event)
		{
			// IE is evil and doesn"t pass the event object
			if (event == null)
					event = window.event;

			// we assume we have a standards compliant browser, but check if we have IE
			var target = event.target != null ? event.target : event.srcElement;

			// only show the context menu if the right mouse button is pressed
			// and a hyperlink has been clicked (the code can be made more selective)

			if (event.button == 0)
				matchActions(target) || hideMenu();
			else hideMenu();
		}

		, _chainHide = getFuncOverride("chainHide")
		, _chainShow = getFuncOverride("chainShow")
		, _hideMenu = getFuncOverride("hideMenu")
		, hideMenu

		, _showMenu = getFuncOverride("showMenu")
		, showMenu = function (event)
		{
			if (event == null) event = window.event;
			// hide the menu first to avoid an "up-then-over" visual effect
			if(_showMenu)
			{
				_showMenu(stage, event);
			}
			else
			{
				stage.style.display = "none";
				stage.style.left = event.clientX + "px";
				stage.style.top = event.clientY + "px";
				stage.style.display = "block";
			}

			if( hasCopyItem )
			{
				Clipboard.capture(copyTrigger, hideMenu);
			}
		}

		, contextShow = function (event)
		{
			if(!mouseOnTarget) return false;

			showMenu(event);
			return true;
		}

		,contextDelete = function ()
		{
			targetParent.removeChild(stage);
		}


		, menuItems = []

			, applyHover = function( elem )
			{
				if( targetParent == elem ) return false;

				if( elem.nodeName == "LI" )
				{
					elem.setAttribute( "hover", 1 );
				}
				return true;
			}

			, removeHover = function( elem )
			{
				if( targetParent == elem ) return false;

				if( elem.nodeName == "LI" )
				{
					elem.removeAttribute( "hover" );
				}
				return true;
			}

			, itemHover = function ()
			{
				Dand.chainUpApply( this, applyHover );
			}
			, itemOut = function ()
			{
				Dand.chainUpApply( this, removeHover );
			}
			, copyTrigger = function () { return mouseOverSwitch; }

		, mouseOverSwitch = false
		, hasCopyItem = false

		, tryBindClipboard = function (target, evtKey)
		{
			// Event handler must return the string to copy

			if( evtKey.keyName.toUpperCase().indexOf("COPY") != -1 )
			{
				Clipboard.init();
				// Handle clipboard events
				hasCopyItem = true;
				IDOMElement(target).addEventListeners(
					[
						new EventKey("MouseOver", function ()
							{
								mouseOverSwitch = true;
								Clipboard.setTextToCopy( this.strcpy() );
								Clipboard.onMouseOver = itemHover.bind( this.stage );
								Clipboard.onMouseOut = itemOut.bind( this.stage );
							}.bind({ strcpy: evtKey.handler, stage: target })
						)

						, new EventKey("MouseDown", function ()
							{
								Clipboard.setTextToCopy( this.strcpy() );
							}.bind({ strcpy: evtKey.handler })
						)

						, new EventKey("MouseOut", function ()
							{
								mouseOverSwitch = false;
								itemOut.bind(this)();
							}.bind( target )
						)
					]
				);
				return true;
			}
			return false
		}

		, stepSubListeners = function (target)
		{
			var lockedOn = null, j, overedOn
				, nodes = target.childNodes
			;

			// Collapse menu chain, each chain is a route
			// Like dominoes
			target.chainRoute = target.chainRoute || [];

			for(var i in nodes)
			{
				j = nodes[i];
				if(!(j && j.nodeType == 1)) continue;

				// If this item has a submenu item
				if(j.lastChild.nodeType == 1)
				{
					target.chainRoute[target.chainRoute.length] = {menu: j.lastChild, next: stepSubListeners(j.lastChild)};
				}

				IDOMElement(j).addEventListener(
					new EventKey("MouseOver", function ()
					{
						// record "this (overed)" item
						overedOn = this;

						var subItem = this.lastChild;

						Cycle.delay(function ()
						{
							// Hide last displayed submenu if submenu is available
							if(lockedOn && lockedOn != subItem)
							{
								_chainHide ? _chainHide(lockedOn) : (lockedOn.style.display = "none");
								// bind the chains into chain reactor
								chainReactor.bind(lockedOn)();
							}

							// if mouse is still on "this (overed)" item
							if(overedOn == this)
							{

								// and if this item has sub item
								if(subItem.nodeType == 1)
								{
									lockedOn = this.lastChild;
									_chainShow ? _chainShow(subItem) : (subItem.style.display = "");
								}
							}
						}.bind(this), 300);
					}.bind(j))
				);
			}

			return target.chainRoute.length ? chainReactor.bind(target) : null;
		}

			, chainReactor = function ()
			{
				if(this && this.chainRoute)
				for(var i in this.chainRoute)
				{
					_chainHide ? _chainHide(this.chainRoute[i].menu) : (this.chainRoute[i].menu.style.display = "none");
					if(this.chainRoute[i].next) this.chainRoute[i].next();
				}
			}

		, createSubMenu = function (obj)
		{
			if(!(obj.name || obj.items)) return Dand.wrapna("ul", addMenuIdentifier());

			// Begin create submenu
			var itemroot = Dand.wrapna("ul", addMenuIdentifier())
				, j = obj.items;

			for (var i in j)
			{

				if(!(j[i] instanceof IKey))
				{
					// step inside level
					itemroot.appendChild(createSubMenu(j[i]));
					continue;
				}

				// Switch inside if this key has an id-ed event
				var eKey = (j[i].keyValue instanceof EventKey) ? j[i].keyValue : j[i];

				itemroot.appendChild( temp = Dand.wrap( "li", null, null, j[i].keyName, addMenuIdentifier(new DataKey("id", eKey.keyName))) );

				// store EventKey & reference
				_items[_items.length] = {key: eKey, stage: temp};

				tryBindClipboard(temp, eKey);
			}


			// Datakey is set for matching action
			var stage = Dand.wrap("li", null, "expandable", [ Dand.textNode(obj.name), itemroot ], addMenuIdentifier(new DataKey("id", obj.name)));

			// Set handler if available
			if(obj.handler)
			{
				_items[_items.length] = {key: new EventKey(obj.name, obj.handler), stage: stage};
			}
			else
			{
				// Prevent menu disappear when clicked
				_items[_items.length] = {key: new EventKey(obj.name, function() { return true; }), stage: stage};
			}


			_hideMenu ? _hideMenu(itemroot) : (itemroot.style.display = "none");

			return stage;
		};

		for ( i in items )
		{
			if ( ( j = items[i] ) )
			{
				if(!(j instanceof IKey))
				{
					menuItems[menuItems.length] = createSubMenu(j);
					continue;
				}

				// Switch inside if this key has an id-ed event
				var eKey = (j.keyValue instanceof EventKey) ? j.keyValue : j;
				temp = menuItems[menuItems.length] = Dand.wrapne("li", j.keyName, addMenuIdentifier(new DataKey("id", eKey.keyName)));

				// store EventKey & reference
				_items[_items.length] = {key: eKey, stage: temp};

				tryBindClipboard(temp, j);
			}
		}

		stage = Dand.wrap(
			"div", null
			, getStrOverride("class") || "contextMenu"
			, temp = Dand.wrapne( "ul", menuItems, addMenuIdentifier() )
		);

		var chain = stepSubListeners(temp);
		var hideMenu = function ()
		{
			_hideMenu ? _hideMenu( stage ) : ( stage.style.display = "none" );

			// Root collapse chain
			if( chain ) chain();
		};

		if( menuInsideTarget && menuInsideTarget.nodeType == 1 )
		{
			( targetParent = menuInsideTarget ).appendChild(stage);
		}
		else
		{
			( targetParent = menuGroup ).appendChild(stage);
		}

		stage.zindex = 99;

		// Handle which button
		i = temp = false;
		if(whichButton == "both") i = temp = true;
		else if (whichButton == "LMB") i = true;
		else if (whichButton == "RMB") temp = true;

		if (i)
		{
			// Handle LMB
			target.onclick = function (event)
			{
				if ( Dand.id( target.id ) )
				{
					showMenu(event);
					document.body.onmousedown = contextMouseDown;
				}
				cleanUpActionList();
			}
		}

		// Register with RMB switch
		registerBodyClickAction(contextMouseDown, contextShow, contextDelete, target.id, temp);

		temp = IDOMElement(target);
		temp.addEventListener("MouseOver", function() { mouseOnTarget = true; });
		temp.addEventListener("MouseOut", function() { mouseOnTarget = false; });

		temp = IDOMElement(stage);
		temp.addEventListener("MouseOver", function() { mouseOnContext = true; });
		temp.addEventListener("MouseOut", function() { mouseOnContext = false; });

		IDOMElement(document.body).addEventListener("ContextMenu", bodyOnContext);

		this.getItemByKey = function (key)
		{
			for (i in _items)
			{
				// match attributes
				if(IDOMElement(_items[i].stage).getDAttribute("id") == key)
				{
					return _items[i];
				}
			}
			return false;
		}
	};

	var bodyClickPairs = [];

	var bodyOnContext = function (event)
	{
		var i, j;
		for (i in bodyClickPairs)
		{
			if ( Dand.id( ( j = bodyClickPairs[i] )._id ) )
			{
				if(j._rmb && j._context(event))
				{
					document.body.onmousedown = j._down;

					if( event && event.preventDefault ) event.preventDefault();
					return false;
				}
			}
			else
			{
				// target lost
				j._lost();
				delete bodyClickPairs[i];
			}
		}
		return true;
	};

	var cleanUpActionList = function ()
	{
		var i, j;
		for ( i in bodyClickPairs )
		{
			if ( !Dand.id( ( j = bodyClickPairs[i] )._id ) )
			{
				// target lost
				j._lost();
				delete bodyClickPairs[i];
			}
		}
	};

	var registerBodyClickAction = function ( _mousedown, _oncontext, _targetlost, id, _useRMB )
	{
		var i = tryGetAction(id);
		if(i)
		{
			// Remove previous menu
			i._lost();
			// Perform update
			i._down = _mousedown;
			i._context = _oncontext;
			i._lost = _targetlost;
			i._rmb = _useRMB;
		}
		else
		{
			bodyClickPairs[bodyClickPairs.length] = {
				_down: _mousedown, _context: _oncontext, _lost: _targetlost, _id: id, _rmb: _useRMB
			};
		}
	};

	var tryGetAction = function (id)
	{
		for (i in bodyClickPairs)
		{
			if (bodyClickPairs[i]._id == id)
			{
				return bodyClickPairs[i];
			}
		}
		return false;
	};

	ns[ NS_EXPORT ]( EX_CLASS, "ContextMenu", ContextMenu );
})();
