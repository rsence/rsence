/***  Riassence Core
  ** 
  **  Copyright (C) 2008 Riassence Inc http://rsence.org/
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

/*** class: HMarkupView
  **
  ** Serves as a mixin class for classes that need to draw markup but don't
  ** inherit from the HView.
  **
  ** vars: Instance variables
  **  markup - The markup from the component's HTML template.
  **
  ** See also:
  **  <HView>
  ***/
HMarkupView = HClass.extend({

/** method: bindMarkupVariables
  * 
  * Evaluates the pieces of code defined in the markup template marked with
  * syntax #{}.
  * Can't use } characters in the code though. This might need another look...
  * 
  * Places the resulting markup in the instance variable.
  * 
  **/
  bindMarkupVariables: function() {
    
    var _markup = this.markup;
    
    while ( HMarkupView._assignment_match.test(_markup) ) {  
      _markup = _markup.replace( HMarkupView._assignment_match, this.evalMarkupVariable(RegExp.$1,true) );
    }
    while ( HMarkupView._variable_match.test(_markup) ) {  
      _markup = _markup.replace( HMarkupView._variable_match, this.evalMarkupVariable(RegExp.$1) );
    }
    
    this.markup = _markup;
  },
  
  evalMarkupVariable: function(_strToEval,_isAssignment){
    try {
      var _ID     = this.elemId.toString(),
          _WIDTH  = this.rect.width,
          _HEIGHT = this.rect.height,
          _result = eval(_strToEval);
      if(_isAssignment){
        return '';
      }
      if(_result===undefined){
        return '';
      }
      else {
        return _result;
      }
    }
    catch(e) {
      return '';
    }
  },
  
/** method: toggleCSSClass
  * 
  * Sets or unsets the _cssClass into a DOM element that goes by the ID
  * _elementId.
  * 
  * Parameters:
  *  _elementId - ID of the DOM element, or the element itself, to be modified.
  *  _cssClass - Name of the CSS class to be added or removed.
  *  _setOn - Boolean value that tells should the CSS class be added or removed.
  * 
  **/
  toggleCSSClass: function(_elementId, _cssClass, _setOn) {
    if(_elementId) {
      
      var _has_class = ELEM.hasClassName(_elementId, _cssClass);
      
      if (_setOn) {
        if (!_has_class) {
          ELEM.addClassName(_elementId, _cssClass);
        }
      }
      else {
        if (_has_class) {
          ELEM.removeClassName(_elementId, _cssClass);
        }
      }

    }

  }

},{
  _variable_match: new RegExp(/#\{([^\}]*)\}/),
  _assignment_match: new RegExp(/\$\{([^\}]*)\}/)
});

