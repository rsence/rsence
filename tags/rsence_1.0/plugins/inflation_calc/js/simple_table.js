SimpleTable = HControl.extend({
  flexBottom: true, flexBottomOffset: 8,
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
  leftColStyle: 'position:absolute;display:block;left:0px;width:30px;padding-right:8px;height:20px;',
  rightColStyle: 'position:absolute;overflow:hidden;text-overflow:ellipsis;display:block;border-left:1px solid #ccc;left:38px;padding-right:6px;width:90px;height:20px;',
  refreshTableElems: function(){
    if(this['tableElems']===undefined){
      this.tableElems = [];
    }
    var tableElemsLen = this.tableElems.length,
        valueLen = this.value.length,
        maxLen = Math.max(tableElemsLen,valueLen),
        elemId_col1, elemId_col2, row, i=0;
    for(;i<maxLen;i++){
      if(i >= tableElemsLen){
        elemId_col1 = ELEM.make(this.elemId);
        ELEM.setCSS(elemId_col1,this.leftColStyle);
        elemId_col2 = ELEM.make(this.elemId);
        ELEM.setCSS(elemId_col2,this.rightColStyle);
        row = [elemId_col1,elemId_col2];
        this.tableElems[i] = row;
      }
      else if(i>=valueLen){
        var row = this.tableElems.pop();
        ELEM.del(row[0]);
        ELEM.del(row[1]);
      }
    }
  },
  refreshValue: function(){
    this.refreshTableElems();
    var row, i=0, colors=['#eee','#ddd'];
    for(;i<this.value.length;i++){
      row = this.tableElems[i];
      ELEM.setStyle(row[0],'top',(i*20)+'px');
      ELEM.setStyle(row[1],'top',(i*20)+'px');
      ELEM.setStyle(row[0],'background-color',colors[i%2]);
      ELEM.setStyle(row[1],'background-color',colors[i%2]);
      ELEM.setHTML(row[0],i+1);
      ELEM.setHTML(row[1],this.value[i]);
    }
  }
});