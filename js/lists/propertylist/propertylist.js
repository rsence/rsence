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
  
  defaultEvents: {
    click: true
  },
  
  controlDefaults: (HControlDefaults.extend({
    keyColumnWidth: 100,
    hideTypeColumn: false,
    useEditor: false,
    rowHeight: 15,
    keyIndent: 8
  })),
  
  click: function(x,y){
    if(this.options.useEditor){
      var
      clickY = y-this.contentView.pageY(),
      itemNum = Math.floor(clickY/this.options.rowHeight);
      if((clickY < 0) || (itemNum > this.valueTokens.length-1)){
        this.editor.hide();
        return;
      }
      this.editItem( itemNum );
    }
  },
  
  keyColumnRight: function(){
    return this.options.keyColumnWidth;
  },
  typeColumnLeft: function(){
    return this.keyColumnRight();
  },
  typeColumnRight: function(){
    return this.options.keyColumnWidth + 60;
  },
  
  valueColumnLeft: function(){
    if(this.options.hideTypeColumn){
      return this.keyColumnRight();
    }
    else {
      return this.typeColumnRight();
    }
  },
  
  drawSubviews: function(){
    
    var borderAndBg = ELEM.make(this.elemId);
    ELEM.setCSS(borderAndBg,'position:absolute;left:0;top:0;right:0;bottom:0;background-color:#e6e6e6;border:1px solid #999;');
    
    this.markupElemIds = {
      bg: borderAndBg
    };
    
    this.contentView = HScrollView.extend({
      click: function(x,y){
        this.parent.click(x,y);
        return true;
      }
    }).nu(
      [ 1, 25, null, null, 1, 1 ],
      this, {
        scrollY: 'auto',
        scrollX: false,
        events: {
          click: true
        }
      }
    );
    
    var separatorParentElemId = ELEM.make(this.contentView.elemId);
    ELEM.setCSS( separatorParentElemId, 'position:absolute;left:0;top:0;right:0;' );
    this.separatortParentElemId = separatorParentElemId;

    this.propertyItems = [];
    
    // Editor initialization
    if(this.options.useEditor){
      this.editorValue = HValue.nu( false, [ 'test', 's', 'Test String' ] );
      this.editor = HPropertyListEditor.nu(
        [0,0,null,this.options.rowHeight+2,0,null],
        this.contentView, {
          propertyItems: this.propertyItems,
          visible: false,
          valueObj: this.editorValue
        }
      );
    }
    
    // Set row style heights from options
    var rowHeightStyle = 'height:'+this.options.rowHeight+'px;';
    this.keyRowStyle += rowHeightStyle;
    this.typeRowStyle += rowHeightStyle;
    this.valueRowStyle += rowHeightStyle;
    this.rowSeparatorStyle += rowHeightStyle;
    
    // Style common font style
    this.contentView.setStyle('font-size','11px');
    
    // Create the key column
    this.keyColumn = HView.nu(
      [ 0, 0, this.keyColumnRight(), 24 ],
      this.contentView, {
        style: [ [ 'border-right', '1px solid #999' ] ]
      }
    );
    
    // Create the type column
    if(!this.options.hideTypeColumn){
      this.typeColumn = HView.nu(
        [ this.typeColumnLeft(), 0, 60, 24 ],
        this.contentView, {
          style: [ [ 'border-right', '1px solid #999' ] ]
        }
      );
    }
    
    // Create the value column
    this.valueColumn = HView.nu(
      [ this.valueColumnLeft(), 0, 0, 24, 0, null ],
      this.contentView
    );
    
    // Create the column headers
    this.header = HView.extend({
      drawSubviews: function(){
        var
        keyColumnWidth = this.parent.options.keyColumnWidth;
        this.keyLabel = HView.nu(
          [ 0, 0, this.parent.keyColumnRight(), 24 ],
          this, {
            html: '<b>Key</b>',
            style: [
              [ 'text-align', 'middle' ],
              [ 'text-indent', '16px' ],
              [ 'line-height', '24px' ],
              [ 'font-size', '13px' ],
              [ 'border-right', '3px double #999' ]
            ]
          }
        );
        if(!this.parent.options.hideTypeColumn){
          this.typeLabel = HView.nu(
            [ this.parent.typeColumnLeft(), 0, 60, 24 ],
            this, {
              html: '<b>Type</b>',
              style: [
                [ 'text-align', 'middle' ],
                [ 'text-indent', '8px' ],
                [ 'line-height', '24px' ],
                [ 'font-size', '13px' ],
                [ 'padding-right', '1px' ],
                [ 'border-right', '1px solid #999' ]
              ]
            }
          );
        }
        this.valueLabel = HView.nu(
          [ this.parent.valueColumnLeft(), 0, 80, 24, 0, null ],
          this, {
            html: '<b>Value</b>',
            style: [
              [ 'text-align', 'middle' ],
              [ 'text-indent', '8px' ],
              [ 'line-height', '24px' ],
              [ 'font-size', '13px' ]
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
    
    // Create the resize control (invisible, just above the first column separator)
    this.resizeColumns = HControl.extend({
      drag: function(x,y){
        var
        parent = this.parent,
        options = parent.options,
        keyColumnWidth = x - parent.pageX(),
        parentWidth = parent.rect.width;
        
        if(keyColumnWidth < 80){
          keyColumnWidth = 80;
        }
        else if ( keyColumnWidth > parentWidth-140 ){
          keyColumnWidth = parentWidth - 140;
        }
        
        // Set the dragger itself
        this.rect.offsetTo( keyColumnWidth-1, 0 ); this.drawRect();
        
        // Resize the key column
        options.keyColumnWidth = keyColumnWidth;
        
        var
        keyColumn = parent.keyColumn,
        keyLabel  = parent.header.keyLabel,
        keyRight  = parent.keyColumnRight();
        keyColumn.rect.setRight( keyRight ); 
        keyLabel.rect.setRight(  keyRight ); 
        
        var
        valueColumn = parent.valueColumn,
        valueLabel  = parent.header.valueLabel,
        valueLeft   = parent.valueColumnLeft();
        
        valueColumn.rect.setLeft( valueLeft );
        valueLabel.rect.setLeft( valueLeft );
        
        // Redraw the rects
        keyColumn.drawRect();
        keyLabel.drawRect();
        valueColumn.drawRect();
        valueLabel.drawRect();
        
        // Resize the type column
        if(!options.hideTypeColumn){
          var
          typeColumn = parent.typeColumn,
          typeLabel  = parent.header.typeLabel,
          typeLeft   = parent.typeColumnLeft(),
          typeRight  = parent.typeColumnRight();
          
          typeColumn.rect.setLeft( typeLeft );
          typeColumn.rect.setRight( typeRight );
          
          typeLabel.rect.setLeft( typeLeft, 0 );
          typeLabel.rect.setRight( typeRight, 0 );
          
          typeColumn.drawRect();
          typeLabel.drawRect();
        }
        
        if(options.useEditor){
          parent.editor.resizeKeyColumn();
        }
        
      }
    }).nu(
      [ this.keyColumnRight(), 0, 5, 25 ],
      this, {
        events: { draggable: true },
        style: [
          [ 'cursor', 'ew-resize' ]
        ]
      }
    );
    
  },
  
  // Tokenize arrays
  arrayTokens: function( arr, name ){
    this.addToken( 'a', name, '('+arr.length+' items)' );
    this.nodeProperties.left += this.options.keyIndent;
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
    this.nodeProperties.left -= this.options.keyIndent;
  },
  
  // Get length of hash
  hashLen: function( hash ){
    var count = 0;
    for( var item in hash ){
      count += 1;
    }
    return count;
  },
  
  // Sort hash keys
  hashSortedKeys: function( hash ){
    var
    keys = [],
    key;
    for( key in hash ){
      keys.push( key );
    }
    return keys.sort();
  },
  
  // Tokenize hashes
  hashTokens: function( hash, name ){
    this.addToken( 'h', name, '('+this.hashLen( hash )+' items)' );
    this.nodeProperties.left += this.options.keyIndent;
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
    this.nodeProperties.left -= this.options.keyIndent;
  },
  
  // Adds a taken
  addToken: function( type, name, value ){
    this.valueTokens.push( {
      top: this.nodeProperties.top,
      left: this.nodeProperties.left,
      type: type,
      name: name,
      value: value
    } );
    this.nodeProperties.top += this.options.rowHeight;
  },
  
  // Returns type of item
  itemType: function( item ){
    return COMM.Values.type( item );
  },
  
  // Translation from type code to type name
  typeNames: {
    h: 'Hash',
    a: 'Array',
    s: 'String',
    n: 'Number',
    b: 'Boolean',
    '~': 'Null',
    '-': 'Undefined'
  },
  
  // Style for the key rows
  keyRowStyle: "position:absolute;padding-top:2px;right:0px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;",
  
  // Creates row in key column
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
  
  // Style for the type rows
  typeRowStyle: "position:absolute;padding-top:2px;left:8px;width:72px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;",
  
  // Creates row in the type column
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
  
  // Style for the value rows
  valueRowStyle: "position:absolute;padding-top:2px;left:8px;right:0px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;",
  
  // Creates row in the value column
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
  
  // Row separator style
  rowSeparatorStyle: "position:absolute;left:1px;right:1px;font-size:0px;height:1px;overflow:hidden;border-bottom:1px solid #999;",
  
  // Adds row separator
  addRowSeparator: function( token, i, even ){
    if( i >= this.propertyItems.length ){
      var elemId = ELEM.make( this.separatortParentElemId );
      this.propertyItems.push( elemId );
      ELEM.setCSS( elemId, 'top:'+token.top+'px;'+this.rowSeparatorStyle+'background-color:'+(even?'#f6f6f6':'#e6e6e6')+';' );
    }
  },
  
  // Destructor, deletes extra elements created
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
  
  // Currently selected item
  selectedItem: 0,
  editNextItem: function(){
    this.editItem(this.selectedItem+1);
  },
  editPrevItem: function(){
    this.editItem(this.selectedItem-1);
  },
  editItem: function(itemNum){
    
    if(itemNum>this.valueTokens.length-1){
      itemNum = this.valueTokens.length-1;
    }
    else if(itemNum < 0){
      itemNum = 0;
    }
    
    var
    targetY = (itemNum*this.options.rowHeight)-1,
    elem = ELEM.get( this.contentView.elemId ),
    scrollTop = elem.scrollTop,
    contentHeight = this.contentView.rect.height;
    
    if(targetY > (scrollTop+contentHeight-45)){
      elem.scrollTop = scrollTop+45;
    }
    else if(targetY < scrollTop+45){
      elem.scrollTop = scrollTop-45;
    }
    
    this.selectedItem = itemNum;
    this.editorValue.set(this.valueTokens[itemNum]);
    this.editor.show();
    EVENT.changeActiveControl(this.editor);
    this.editor.offsetTo( 0, targetY );
    this.editor.bringToFront();
  },
  
  // Starts tokenizing, when the value is changed.
  refreshValue: function(){
    if(this['propertyItems']===undefined){
      return;
    }
    this.valueTokens = [];
    this.nodeProperties = {
      top: 0,
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
      if(!this.options.hideTypeColumn){
        this.addTypeColumnControl( token, colId ); colId++;
      }
      this.addValueColumnControl( token, colId ); colId++;
      colHeight = token.top+this.options.rowHeight;
    }
    var propItemsLen = this.propertyItems.length, elemId;
    for( i = colId; i < propItemsLen; i++ ){
      elemId = this.propertyItems.pop();
      ELEM.del( elemId );
    }
    this.keyColumn.bringToFront();
    if(!this.options.hideTypeColumn){
      this.typeColumn.bringToFront();
    }
    this.valueColumn.bringToFront();
    this.resizeColumns.bringToFront();
    this.keyColumn.rect.setHeight( colHeight );
    this.keyColumn.drawRect();
    if(!this.options.hideTypeColumn){
      this.typeColumn.rect.setHeight( colHeight );
      this.typeColumn.drawRect();
    }
    this.valueColumn.rect.setHeight( colHeight );
    this.valueColumn.drawRect();
    ELEM.setStyle(this.separatortParentElemId,'height',(colHeight+25)+'px');
  }
});
