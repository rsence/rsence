/*   RSence
 *   Copyright 2010 Riassence Inc.
 *   http://riassence.com/
 *
 *   You should have received a copy of the GNU General Public License along
 *   with this software package. If not, contact licensing@riassence.com
 */

/*** = Description
  ** HPropertyListEditor is a subcomponent of HPropertyList that handles
  ** editing of the selected row.
  **
  ***/
var//RSence.Lists
HPropertyListEditor = HControl.extend({
  
  defaultEvents: {
    keyDown: 'repeat'
  },
  
  keyDown: function(chr){
    if(chr===38){
      this.parent.parent.editPrevItem();
      return true;
    }
    else if(chr===40){
      this.parent.parent.editNextItem();
      return true;
    }
    return false;
  },
  
  refreshValue: function(){
    
    this.base();
    
    this.nameEditor.setValue(this.value.name);
    
    this.typeEditor && this.typeEditor.setValue( this.value.type );
    
    if(this.value.type === 's'){
      this.stringEditor.show();
      this.stringEditor.setValue(this.value.value);
    }
    else{
      this.stringEditor.hide();
    }
    
    if(this.value.type === 'n'){
      this.numberEditor.show();
      this.numberEditor.setValue(this.value.value);
    }
    else{
      this.numberEditor.hide();
    }
    
    this.resizeKeyColumn();
  },
  
  lostActiveStatus: function(newActive){
    this.base();
    if( newActive &&
      ( (newActive === this) || (newActive.parents.indexOf(this) !== -1) )
    ){
      return;
    }
    this.hide();
  },
  
  resizeKeyColumn: function(){
    
    var
    parent = this.parent.parent,
    nameEditor = this.nameEditor;
    
    nameEditor.rect.setLeft( this.value.left+6 );
    nameEditor.rect.setRight( parent.keyColumnRight()-3 );
    nameEditor.refresh();
    
    var
    stringEditor = this.stringEditor;
    numberEditor = this.numberEditor;
    
    stringEditor.rect.setLeft( parent.valueColumnLeft()+5 );
    numberEditor.rect.setLeft( parent.valueColumnLeft()+4 );
    
    if(this['typeEditor']){
      var
      typeEditor = this.typeEditor;
      
      typeEditor.rect.setLeft( parent.typeColumnLeft()+2 );
      typeEditor.rect.setRight( parent.typeColumnRight()-1 );
      typeEditor.drawRect();
    }
    
    stringEditor.drawRect();
    numberEditor.drawRect();
  },
  nameEditor: null,
  typeEditor: null,
  valueEditor: null,
  drawSubviews: function(){
    
    this.setStyle('border-top','1px solid #999');
    this.setStyle('border-bottom','1px solid #999');
    
    var
    _stateElemId = ELEM.make( this.elemId );
    this.markupElemIds = { state: _stateElemId };
    ELEM.setCSS( _stateElemId, 'position:absolute;left:0;top:0;right:0;bottom:0;background-color:#fff;' );
    ELEM.setStyle( _stateElemId, 'opacity', 0.8 );
    
    var
    parent = this.parent.parent,
    opts = parent.options;
    this.nameEditor = HTextControl.extend({
      boldTypes: ['a','h'],
      lostActiveStatus: function(newActive){
        this.base();
        this.parent.lostActiveStatus(newActive);
      },
      refreshValue: function(){
        if(this.drawn){
          if(this.boldTypes.indexOf(this.parent.value.type)!==-1){
            this.setStyle('font-weight','bold',true);
          }
          else{
            this.setStyle('font-weight','normal',true);
          }
        }
        this.base();
      }
    }).nu(
      [0,-1,1,opts.rowHeight+4],
      this, {
        style: [
          [ 'font-size', '11px' ],
          [ 'text-indent', '1px' ]
        ]
      }
    );
    
    var
    height = this.nameEditor.rect.height;
    if(!opts.hideTypeColumn){
      this.typeEditor = HMiniMenu.extend({
        lostActiveStatus: function(newActive){
          this.parent.lostActiveStatus(newActive);
          this.base();
        }
      }).nu(
        [0,1,1,height],
        this, {
          value: 'a',
          menuItemGeom: {
            width: 75,
            left: -15
          }
        }
      );
      
      var _arrTypes = [];
      
      for( var i in parent.typeNames ){
        _arrTypes.push( [i, parent.typeNames[i]] );
      }
      
      this.typeEditor.setListItems( _arrTypes );
      
    }
    
    this.stringEditor = HTextArea.extend({
      lostActiveStatus: function(newActive){
        this.parent.lostActiveStatus(newActive);
        this.base();
      }
    }).nu(
      [0,-1,null,height,4,null],
      this, {
        style: [
          [ 'font-size', '11px' ],
          [ 'text-indent', '1px' ],
          [ 'padding-top', '3px' ]
        ]
      }
    );
    
    this.numberEditor = HNumericTextControl.extend({
      lostActiveStatus: function(newActive){
        this.parent.lostActiveStatus(newActive);
        this.base();
      }
    }).nu(
      [0,-1,null,height,4,null],
      this, {
        style: [
          [ 'font-size', '11px' ],
          [ 'text-indent', '1px' ]
        ]
      }
    );
    
    this.resizeKeyColumn();
    
  }
});