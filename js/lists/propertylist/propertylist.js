/*   RSence
 *   Copyright 2010 Riassence Inc.
 *   http://riassence.com/
 *
 *   You should have received a copy of the GNU General Public License along
 *   with this software package. If not, contact licensing@riassence.com
 */

/*** = Description
  ** HPropertyList uses any JSON-compliant structure as its value and displays
  ** its content hierarchically in three columns:
  ** - Key
  ** - Type
  ** - Value
  **
  ***/
var//RSence.Lists
HPropertyList = HControl.extend({
  keyColumnWidth: 100,
  rowHeight: 15,
  keyIndent: 8,
  drawSubviews: function(){
    this.propertyItems = [];
    this.keyRowStyle += 'height:'+this.rowHeight+'px;';
    this.typeRowStyle += 'height:'+this.rowHeight+'px;';
    this.valueRowStyle += 'height:'+this.rowHeight+'px;';
    this.rowSeparatorStyle += 'height:'+this.rowHeight+'px;';
    this.setStyle('font-size','11px');
    this.setStyle('overflow-y','auto');
    this.keyColumn = HView.nu(
      [ 0, 0, this.keyColumnWidth, 24 ],
      this, {
        style: [ [ 'border-right', '1px solid #999' ] ]
      }
    );
    this.typeColumn = HView.nu(
      [ this.keyColumnWidth, 0, 80, 24 ],
      this, {
        style: [ [ 'border-right', '1px solid #999' ] ]
      }
    );
    this.valueColumn = HView.nu(
      [ this.keyColumnWidth + 80, 0, 0, 24, 0, null ],
      this
    );
    this.header = HView.extend({
      drawSubviews: function(){
        var
        keyColumnWidth = this.parent.keyColumnWidth;
        this.keyLabel = HStringView.nu(
          [ 0, 0, keyColumnWidth, 24 ],
          this, {
            value: '<b>Key</b>',
            style: [
              [ 'text-align', 'middle' ],
              [ 'text-indent', '16px' ],
              [ 'line-height', '24px' ]
            ]
          }
        );
        this.typeLabel = HStringView.nu(
          [ keyColumnWidth, 0, 80, 24 ],
          this, {
            value: '<b>Type</b>',
            style: [
              [ 'text-align', 'middle' ],
              [ 'text-indent', '8px' ],
              [ 'line-height', '24px' ]
            ]
          }
        );
        this.valueLabel = HStringView.nu(
          [ keyColumnWidth + 80, 0, 80, 24, 0, null ],
          this, {
            value: '<b>Value</b>',
            style: [
              [ 'text-align', 'middle' ],
              [ 'text-indent', '8px' ],
              [ 'line-height', '24px' ]
            ]
          }
        );
      }
    }).nu(
      [ 0, 0, null, 24, 0, null ],
      this, {
        style: [ [ 'border-bottom', '1px solid #999' ] ]
      }
    );
    this.resizeColumns = HControl.extend({
      drag: function(x,y){
        var
        parentX = x - this.parent.pageX(),
        keyColumnWidth = parentX-1,
        parentWidth = ELEM.getVisibleSize( this.parent.elemId )[0];
        if(keyColumnWidth < 80){
          keyColumnWidth = 80;
        }
        else if ( keyColumnWidth > parentWidth-160 ){
          keyColumnWidth = parentWidth - 160;
        }
        selfX = keyColumnWidth - 2;
        this.rect.offsetTo( selfX, 0 ); this.drawRect();
        this.parent.keyColumn.rect.setRight( keyColumnWidth ); this.parent.keyColumn.drawRect();
        this.parent.header.keyLabel.rect.setWidth( keyColumnWidth ); this.parent.header.keyLabel.drawRect();
        this.parent.typeColumn.rect.offsetTo( keyColumnWidth, 0 ); this.parent.typeColumn.drawRect();
        this.parent.header.typeLabel.rect.offsetTo( keyColumnWidth, 0 ); this.parent.header.typeLabel.drawRect();
        this.parent.valueColumn.rect.setLeft( keyColumnWidth+80 ); this.parent.valueColumn.drawRect();
        this.parent.header.valueLabel.rect.setLeft( keyColumnWidth+80 ); this.parent.header.valueLabel.drawRect();
        this.parent.keyColumnWidth = keyColumnWidth;
      }
    }).nu(
      [ this.keyColumnWidth - 2, 0, 5, 25 ],
      this, {
        events: { draggable: true },
        style: [
          [ 'cursor', 'ew-resize' ]
        ]
      }
    );
  },
  arrayTokens: function( arr, name ){
    this.addToken( 'a', name, '('+arr.length+' items)' );
    this.nodeProperties.left += this.keyIndent;
    var i = 0, val, type;
    for( ; i < arr.length; i++ ){
      val = arr[i];
      type = this.itemType( val );
      if( type == 'h' ){
        this.hashTokens( val, i );
      }
      else if ( type == 'a' ){
        this.arrayTokens( val, i );
      }
      else {
        this.addToken( type, i, val );
      }
    }
    this.nodeProperties.left -= this.keyIndent;
  },
  hashLen: function( hash ){
    var count = 0;
    for( var item in hash ){
      count += 1;
    }
    return count;
  },
  hashSortedKeys: function( hash ){
    var
    keys = [],
    key;
    for( key in hash ){
      keys.push( key );
    }
    return keys.sort();
  },
  hashTokens: function( hash, name ){
    this.addToken( 'h', name, '('+this.hashLen( hash )+' items)' );
    this.nodeProperties.left += this.keyIndent;
    var key, val, type, i = 0, keys = this.hashSortedKeys( hash );
    for( ; i < keys.length; i++ ){
      key = keys[i];
      val = hash[key];
      type = this.itemType( val );
      if( type == 'h' ){
        this.hashTokens( val, key );
      }
      else if ( type == 'a' ){
        this.arrayTokens( val, key );
      }
      else {
        this.addToken( type, key, val );
      }
    }
    this.nodeProperties.left -= this.keyIndent;
  },
  addToken: function( type, name, value ){
    this.valueTokens.push( {
      top: this.nodeProperties.top,
      left: this.nodeProperties.left,
      type: type,
      name: name,
      value: value
    } );
    this.nodeProperties.top += this.rowHeight;
  },
  itemType: function( item ){
    return COMM.Values.type( item );
  },
  typeNames: {
    h: 'Hash',
    a: 'Array',
    s: 'String',
    n: 'Number',
    b: 'Boolean'
  },
  keyRowStyle: "position:absolute;z-index:1;right:0px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;",
  addKeyColumnControl: function( token, i ){
    var elemId;
    if( i >= this.propertyItems.length ){
      elemId = ELEM.make( this.keyColumn.elemId );
      this.propertyItems.push( elemId );
      ELEM.setCSS( elemId, 'top:'+token.top+'px;'+this.keyRowStyle );
    }
    else {
      elemId = this.propertyItems[i];
    }
    ELEM.setStyle( elemId, 'left', (token.left+10)+'px' );
    if( token.type === 'h' || token.type === 'a' ){
      ELEM.setStyle( elemId, 'font-weight', 'bold' );
    }
    else {
      ELEM.setStyle( elemId, 'font-weight', 'inherit' );
    }
    ELEM.setHTML( elemId, token.name );
  },
  typeRowStyle: "position:absolute;z-index:1;left:8px;width:72px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;",
  addTypeColumnControl: function( token, i ){
    var elemId;
    if( i >= this.propertyItems.length ){
      elemId = ELEM.make( this.typeColumn.elemId );
      this.propertyItems.push( elemId );
      ELEM.setCSS( elemId, 'top:'+token.top+'px;'+this.typeRowStyle );
    }
    else {
      elemId = this.propertyItems[i];
    }
    ELEM.setHTML( elemId, this.typeNames[token.type] );
  },
  valueRowStyle: "position:absolute;z-index:1;left:8px;right:0px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;",
  addValueColumnControl: function( token, i ){
    var elemId, value;
    if( i >= this.propertyItems.length ){
      elemId = ELEM.make( this.valueColumn.elemId );
      this.propertyItems.push( elemId );
      ELEM.setCSS( elemId, 'top:'+token.top+'px;'+this.valueRowStyle );
    }
    else {
      elemId = this.propertyItems[i];
    }
    if( token.type === 'h' || token.type === 'a' ){
      ELEM.setStyle( elemId, 'font-style', 'italic' );
    }
    else {
      ELEM.setStyle( elemId, 'font-style', 'inherit' );
    }
    value = token.value;
    if(value===true){
      value = 'true';
    }
    else if(value===false){
      value = 'false';
    }
    else if(value===undefined){
      value = 'undefined';
    }
    else if(value===null){
      value = 'null';
    }
    ELEM.setHTML( elemId, value );
  },
  rowSeparatorStyle: "position:absolute;z-index:0;left:0px;right:0px;font-size:0px;height:1px;border-bottom:1px solid #ccc;overflow:hidden;text-overflow:ellipsis;",
  addRowSeparator: function( token, i, even ){
    if( i >= this.propertyItems.length ){
      var elemId = ELEM.make( this.elemId );
      this.propertyItems.push( elemId );
      ELEM.setCSS( elemId, 'top:'+token.top+'px;'+this.rowSeparatorStyle+'background-color:'+(even?'#eee':'#ddd')+';' );
    }
  },
  die: function(){
    var
    i=0,
    propLen = this.propertyItems.length,
    elemId;
    for(;i<propLen;i++){
      elemId = this.propertyItems.pop();
      ELEM.del( elemId );
    }
    this.base();
  },
  refreshValue: function(){
    if(this['propertyItems']===undefined){
      return;
    }
    this.valueTokens = [];
    this.nodeProperties = {
      top: 28,
      left: 8
    };
    var rootType = this.itemType( this.value );
    if( rootType == 'h' ){
      this.hashTokens( this.value, 'Root' );
    }
    else if( rootType == 'a' ){
      this.arrayTokens( this.value, 'Root' );
    }
    else {
      this.addToken( rootType, 'Root', this.value );
    }
    var i, token;
    if(this['propertyItems'] === undefined){
      this.propertyItems = [];
    }
    var colHeight = 0, colId = 0;
    for( i = 0; i < this.valueTokens.length; i ++ ) {
      token = this.valueTokens[i];
      this.addRowSeparator( token, colId, (i%2===0) ); colId++;
      this.addKeyColumnControl( token, colId ); colId++;
      this.addTypeColumnControl( token, colId ); colId++;
      this.addValueColumnControl( token, colId ); colId++;
      colHeight = token.top+this.rowHeight;
    }
    var propItemsLen = this.propertyItems.length, elemId;
    for( i = colId; i < propItemsLen; i++ ){
      elemId = this.propertyItems.pop();
      ELEM.del( elemId );
    }
    this.keyColumn.bringToFront();
    this.typeColumn.bringToFront();
    this.valueColumn.bringToFront();
    this.resizeColumns.bringToFront();
    this.keyColumn.rect.setHeight( colHeight ); this.keyColumn.drawRect();
    this.typeColumn.rect.setHeight( colHeight ); this.typeColumn.drawRect();
    this.valueColumn.rect.setHeight( colHeight ); this.valueColumn.drawRect();
  }
});
