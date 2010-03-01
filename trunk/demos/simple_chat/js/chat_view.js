// Helper class to display the chat buffer. Adds lines to the
// end, when changes are received from a value update.
// Scrolls to bottom on input and crops the buffer at 1000 lines.
ChatView = HStringView.extend({
  
  // Sets scrollbars and border styling
  drawSubviews: function(){
    ELEM.setStyle(this.elemId,'overflow','auto');
    ELEM.setStyle(this.elemId,'border','1px solid #999');
  },
  
  // A buffer of elemId's. One line per elemId.
  chatBuffer: [ ],
  
  // Scrolls the buffer to end.
  scrollToEnd: function(){
    ELEM.flushLoop(0);
    var scrollHeight = ELEM.getScrollSize(this.elemId)[1];
    ELEM.get(this.elemId).scrollTop = scrollHeight;
  },
  
  // Crops the buffer at 1000 lines.
  adjustBuffer: function(){
    var elemId;
    while(this.chatBuffer.length>1000){
      elemId = this.chatBuffer.shift();
      ELEM.del( elemId );
    }
  },
  
  // Adds a new line to the end of the buffer.
  insertHistoryLine: function( historyLine ){
    var parentElemId = this.markupElemIds.value,
        time = historyLine[0],
        nick = historyLine[1],
        text = historyLine[2],
        elemId = ELEM.make( parentElemId, 'div' );
    this.chatBuffer.push( elemId );
    if(nick === false){
      nick = '::';
      ELEM.setStyle(elemId,'color','#999');
    }
    else {
      nick = '<'+nick+'>';
    }
    ELEM.setHTML( elemId, [
      time,
      '&nbsp;<b>',
      this.app.escapeHTML(nick),
      '</b>&nbsp;',
      this.app.escapeHTML(text)
    ].join(''));
  },
  
  // Takes the array +history+ and performs a line insertion for each item.
  populateHistory: function( history ){
    for( var i = 0; i < history.length; i++){
      this.insertHistoryLine( history[i] );
    }
  },
  
  // Triggers methods listed above, when a value update event is fired.
  refreshValue: function(){
    if(this.value instanceof Array){
      this.populateHistory( this.value );
    }
    this.adjustBuffer();
    this.scrollToEnd();
  }
  
});
