
/*** = Description
 ** Serves as a mixin class for classes that need to draw markup but don't
 ** inherit from the HView.
 **
 ** = Instance variables
 ** +markup+:: The markup from the component's HTML template.
***/
var//RSence.Foundation
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
  // bindMarkupVariables: function() {
  //   var
  //   _this   = this,
  //   _ID     = _this.elemId.toString(),
  //   _rect   = _this.rect,
  //   _WIDTH  = _rect.width,
  //   _HEIGHT = _rect.height,
  //   _markup = _this.markup,
  //   _fns    = _this.markupFns,
  //   _callValue = function(_id,_isAssign){
  //     console.log('callValue',_id);
  //     var _preId = _id;
  //     _id = parseInt(_id,36)-10;
  //     console.log('id:',_id,'->',_preId);
  //     try{
  //       var
  //       _out = _fns[_id].call(_this);
  //       if(_isAssign){
  //         return '';
  //       }
  //       else {
  //         return _out;
  //       }
  //     }
  //     catch(e){
  //       console.log('Markup Error: ',e);
  //       return '';
  //     }
  //   };
    
  //   while ( HMarkupView._assignment_match.test(_markup) ) {
  //     _markup = _markup.replace( HMarkupView._assignment_match, _callValue(RegExp.$1, false) );
  //   }
  //   while ( HMarkupView._variable_match.test(_markup) ) {
  //     _markup = _markup.replace( HMarkupView._variable_match, _callValue(RegExp.$1) );
  //   }
    
  //   this.markup = _markup;
    
  //   return this;
  // },
  
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
        ELEM.delClassName(_elementId, _cssClass);
      }
    }
    return this;
  }
  
// },{
//   _variable_match: new RegExp(/#\{([^\}]*)\}/),
//   _assignment_match: new RegExp(/\$\{([^\}]*)\}/)
});

