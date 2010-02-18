/*   Riassence Framework
 *   Copyright 2009 Riassence Inc.
 *   http://riassence.com/
 *
 *   You should have received a copy of the GNU General Public License along
 *   with this software package. If not, contact licensing@riassence.com
 */

/*** = Description
  ** A simple purpose-specific 2-column table component that displays arrays of data.
  ***/
SimpleTable = HControl.extend({
  
  // Anchors the component to the bottom edge of the parent (flexible height)
  flexBottom: true, flexBottomOffset: 8,
  
  // Sets some styling for the element (instead of having a theme with css to do the same)
  drawSubviews: function(){
    this.setStyle('background-color','#eee');
    this.setStyle('overflow','auto');
    this.setStyle('overflow-y','scroll');
    this.setStyle('border','1px solid #999');
    this.setStyle('font-size','11px');
    this.setStyle('font-family','arial,sans-serif');
    this.setStyle('text-align','right');
    this.setStyle('line-height','20px');
    this.setStyle('vertical-align','middle');
  },
  
  // CSS style for the left column
  leftColStyle: 'position:absolute;display:block;left:0px;width:30px;padding-right:8px;height:20px;',
  
  // CSS style for the right column
  rightColStyle: 'position:absolute;overflow:hidden;text-overflow:ellipsis;display:block;border-left:1px solid #ccc;left:38px;padding-right:6px;width:90px;height:20px;',
  
  // Method for populating / depopulating the
  // elements of the table.
  refreshTableElems: function(){
    
    // Initial state (no tableElems yet)
    if(this['tableElems']===undefined){
      this.tableElems = [];
    }
    
    // Assign the variables needed
    var // The amount of rows:
        tableElemsLen = this.tableElems.length,
        
        // The amount of items in the value array:
        valueLen = this.value.length,
        
        // The bigger of the two above
        maxLen = Math.max(tableElemsLen,valueLen),
        
        // other vars:
        elemId_col1, elemId_col2, row, i=0;
    
    // Iterate through the table elements and the value
    for(; i < maxLen; i++ ){
      
      // If the index is bigger than the amount of
      // elements, create new elements:
      if(i >= tableElemsLen){
        elemId_col1 = ELEM.make(this.elemId);
        ELEM.setCSS(elemId_col1,this.leftColStyle);
        elemId_col2 = ELEM.make(this.elemId);
        ELEM.setCSS(elemId_col2,this.rightColStyle);
        row = [elemId_col1,elemId_col2];
        this.tableElems[i] = row;
      }
      
      // If the index is bigger than the amount of
      // elements, delete the extra elements.
      else if(i>=valueLen){
        row = this.tableElems.pop();
        ELEM.del(row[0]);
        ELEM.del(row[1]);
      }
    }
  },
  
  // Uses the value to (re)draw the table rows/columns
  refreshValue: function(){
    
    // Ensure there is the exact same amount of
    // rows as items in the value:
    this.refreshTableElems();
    
    // Variables used in the loop, the colors are for
    // alternating even/odd row backgrounds.
    var row, i=0, colors=['#eee','#ddd'];
    
    for( ; i < this.value.length; i++ ){
      
      // The column elements of the row:
      row = this.tableElems[i];
      
      // Sets the position of the row columns:
      ELEM.setStyle(row[0],'top',(i*20)+'px');
      ELEM.setStyle(row[1],'top',(i*20)+'px');
      
      // Sets alternating even/odd background coloring:
      ELEM.setStyle(row[0],'background-color',colors[i%2]);
      ELEM.setStyle(row[1],'background-color',colors[i%2]);
      
      // Sets the left column data (index)
      ELEM.setHTML(row[0],i+1);
      
      // Sets the right column data (value)
      ELEM.setHTML(row[1],this.value[i]);
      
    }
  }
});

