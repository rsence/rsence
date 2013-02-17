
// Simple view for scrolling purposes.
// Uses two special options for setting scroll bar behavior:
//  - scrollX: true | false | 'auto'
//  - scrollY: true | false | 'auto'
var//RSence.Views
HScrollView = HControl.extend({
  controlDefaults: HControlDefaults.extend({
    scrollX: true,
    scrollY: true
  }),
  scrollToTop: function(){
    ELEM.get(this.elemId).scrollTop = 0;
  },
  scrollToBottom: function(){
    var
    elem = ELEM.get( this.elemId ),
    contentHeight = ELEM.getScrollSize(this.elemId)[1],
    viewHeight = this.rect.height;
    elem.scrollTop = contentHeight-viewHeight;
  },
  drawSubviews: function(){
    if(this.options.scrollX === 'auto' || this.options.scrollY === 'auto'){
      this.setStyle('overflow','auto');
    }
    else if(this.options.scrollX || this.options.scrollY){
      this.setStyle('overflow','scroll');
    }
    if(!this.options.scrollX){
      this.setStyle('overflow-x','hidden');
    }
    else if(this.options.scrollX === 'auto'){
      this.setStyle('overflow-x','auto');
    }
    else {
      this.setStyle('overflow-x','scroll');
    }
    if(!this.options.scrollY){
      this.setStyle('overflow-y','hidden');
    }
    else if(this.options.scrollY === 'auto'){
      this.setStyle('overflow-y','auto');
    }
    else {
      this.setStyle('overflow-y','scroll');
    }
  }
});

