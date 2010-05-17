/*   RSence
 *   Copyright 2006 Riassence Inc.
 *   http://riassence.com/
 *
 *   You should have received a copy of the GNU General Public License along
 *   with this software package. If not, contact licensing@riassence.com
 */

/*** = Description
 ** Serves as a mixin class for classes that need to draw markup but don't
 ** inherit from the HView.
 **
 ** = Instance variables
 ** +markup+:: The markup from the component's HTML template.
***/
HMarkupView = HClass.extend({

/** = Description
  * Evaluates the pieces of code defined in the markup template marked with
  * syntax #{}.
  * Can't use } characters in the code though. 
  * --
  * This might need another look...
  * ++
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
    
    return this;
  },
/** = Description
  * Evaluates a string and throws an error into console.log 
  * if the string doesn't pass evaluation. 
  * If _isAssignment flag is set to true returns empty string. 
  * if _isAssignment is set to false will return string if it passes 
  * evaluation.
  *
  * = Parameters
  * +_strToEval+::      A String to evaluate.
  * 
  * +_isAssignment+::   Flag to indicate return the String upon passed 
  *                     evaluation(false) or return of an empty String(true).
  *
  * = Returns
  * +String+ 
  * 
  **/
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
      console.log("Warning, the markup string '"+_strToEval+"' failed evaluation. Reason:"+e+' '+e.description);
      return '';
    }
  },
  
/** = Description
  * Sets or unsets the _cssClass into a DOM element that goes by the ID 
  * _elementId.
  * 
  * = Parameters
  * +_elementId+:: ID of the DOM element, or the element itself, to be 
  *                modified.
  * +_cssClass+::  Name of the CSS class to be added or removed.
  * +_setOn+::     Boolean value that tells should the CSS class be added or 
  *                removed.
  *
  * = Returns
  * +self+
  * 
  **/
  toggleCSSClass: function(_elementId, _cssClass, _setOn) {
    if(_elementId) {
      if (_setOn) {
        ELEM.addClassName(_elementId, _cssClass);
      }
      else {
        ELEM.removeClassName(_elementId, _cssClass);
      }
    }
    return this;
  }

},{
  _variable_match: new RegExp(/#\{([^\}]*)\}/),
  _assignment_match: new RegExp(/\$\{([^\}]*)\}/)
});

