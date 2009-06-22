/***  HIMLE RIA SYSTEM
  ** 
  **  Copyright (C) 2008 HIMLE GROUP http://himle.sorsacode.com/
  **  Copyright (C) 2006-2007 Helmi Technologies Inc.
  ** 
  **  This program is free software; you can redistribute it and/or modify it under the terms
  **  of the GNU General Public License as published by the Free Software Foundation;
  **  either version 2 of the License, or (at your option) any later version. 
  **  This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
  **  without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
  **  See the GNU General Public License for more details. 
  **  You should have received a copy of the GNU General Public License along with this program;
  **  if not, write to the Free Software Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA
  ***/

/** class: HLeechView
  *
  * Extension class of HView, it takes an element (id, elemid or domelement) instead of the
  * HRect argument, doesn't make a new <div /> element and uses the given domelement instead
  * as the frame to be used as an parent element for components.
  *
  * Depends on <HApplication>, <HMarkupView> and <HView>
  *
  * HView instances are the simplest component type. HViews don't respond to 
  * events, they don't have a visible visual representation (just an invisible
  * '<div>' element), but offers the common visual methods of most components.
  *
  * Feel free to extend HLeechView to suit your needs.
  *
  * See Also:
  *  <HView> <HSystem> <HApplication> <HControl>
  *
  * Usage example:
  *  > var myApp = new HApplication(100);
  *  > var myView = new HLeechView( document.getElementById('component_area'), myApp );
  *  > var myComponent = new HButton( new HRect(50,50,100,100), myView, {label: 'SQUARE 50x50'} );
  **/
HLeechView = HView.extend({

/** constructor: constructor
  *
  * Just like HView, but does not create a element and does not need a HRect.
  * Instead, feed it with an element.
  *
  * Parameters:
  *  _elem - An instance of <HRect>, defines the position and size of views.
  *  _parentClass - Another <HView> -compatible instance, like <HApplication>, <HControl> and derived component classes.
  *
  * See also:
  *  <HView> <HApplication.addView> <draw> <drawRect> <refresh> <setRect> <drawMarkup> <HControl.draw>
  **/
  constructor: function( _elem, _parentClass ){
    
    // Support for the element manager's id's (serial number elemId's)
    if ( typeof _elem == 'number' ){
      this.elemId = _elem;
      _elem = elem_get(this.elemId);
    }
    // Support for strings (gets dom element by the id attribute)
    else if ( typeof _elem == 'string' ){
      this.elemId = elem_bind( _elem );
      _elem = elem_get(this.elemId);
    }
    
    // Support for elemens as is
    else if ( typeof _elem == 'object' ) {
      this.elemId = elem_add( _elem );
    }
    
    var _pxleft   = ( _elem.clientLeft || _elem.offsetLeft );
    var _pxtop    = ( _elem.clientTop  || _elem.offsetTop  );
    var _pxright  = _pxleft + ( _elem.clientWidth  || _elem.offsetWidth );
    var _pxbottom = _pxtop  + ( _elem.clientHeight || _elem.offsetHeight );
    
    var _rect = new HRect( _pxleft, _pxtop, _pxright, _pxbottom );
    
    this.base( _rect, _parentClass );
    
    this.type = '[HLeechView]';
    
  }
});

HLeechComponentExtension = {
/** constructor: constructor
  *
  * Extend any component with this to make a leech component.
  *
  * Parameters:
  *  _elem - An instance of <HRect>, defines the position and size of views.
  *  _parentClass - Another <HView> -compatible instance, like <HApplication>, <HControl> and derived component classes.
  *  _options - Component settings
  *
  * See also:
  *  <HView> <HApplication.addView> <draw> <drawRect> <refresh> <setRect> <drawMarkup> <HControl.draw>
  **/
  constructor: function( _elem, _parentClass, _options ){
    
    // Support for the element manager's id's (serial number elemId's)
    if ( typeof _elem == 'number' ){
      this.elemId = _elem;
      _elem = elem_get(this.elemId);
    }
    // Support for strings (gets dom element by the id attribute)
    else if ( typeof _elem == 'string' ){
      this.elemId = elem_bind( _elem );
      _elem = elem_get(this.elemId);
    }
    
    // Support for elemens as is
    else if ( typeof _elem == 'object' ) {
      this.elemId = elem_add( _elem );
    }
    
    var _pxleft   = ( _elem.clientLeft || _elem.offsetLeft );
    var _pxtop    = ( _elem.clientTop  || _elem.offsetTop  );
    var _pxright  = _pxleft + ( _elem.clientWidth  || _elem.offsetWidth );
    var _pxbottom = _pxtop  + ( _elem.clientHeight || _elem.offsetHeight );
    
    var _rect = new HRect( _pxleft, _pxtop, _pxright, _pxbottom );
    
    this.base( _rect, _parentClass, _options );
    
    this.type = this.type.replace('[H','[HLeech');
    
  }
}

HLeechControl = HControl.extend( HLeechComponentExtension );





