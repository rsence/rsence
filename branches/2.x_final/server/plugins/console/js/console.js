
HTMLViewer = HControl.extend({
  flexRight: true,
  flexBottom: true,
  draw: function(){
    this.base();
    var i=0, _styles = [
      ['font-family','monaco, monospace, courier new'],
      ['font-size','9px'],
      ['color','#333'],
      ['overflow','auto']
    ];
    for(;i<_styles.length;i++){
      this.setStyle(_styles[i][0],_styles[i][1]);
    }
  },
  setValue: function(_value){
    this.base(_value);
    this.setHTML('<pre>'+_value+'</pre>');
  }
});


HConsole = HApplication.extend({
  constructor: function(_values){
    this.values = _values;
    this.base();
    this.view = new HDynControl(
      new HRect(200,20,200+512,100+384),
      this, {
        label: '',
        resizeN: 4, resizeS: 4, resizeE: 4, resizeW: 4,
        resizeNE: [4,4], resizeNW: [4,4], resizeSE: [4,4], resizeSW: [4,4]
      }
    );
    this.view.setStyle('background-color','#ddd');
    this.tabs = new (HTab.extend(
      {flexBottom:true,flexRight:true,flexBottomOffset:4,flexRightOffset:4}
    ))(
      new HRect(4,24,512-4,384-4),
      this.view
    );
    var _sessionTab  = this.tabs.addTab('Sessions',true);
    var _imgServeTab = this.tabs.addTab('ImageServe');
    
    var _htmlViewer  = new HTMLViewer(new HRect(0,0,1,1),_sessionTab);
    HVM.values[this.values.session_to_js].bind(_htmlViewer);
    
    var _reloadButtonRect = new HRect(4,4,100,20);
    var _reloadButton = new HClickButton(_reloadButtonRect,this.view,{label:'Refresh'});
    HVM.values[this.values.reload_button].bind(_reloadButton);
    
    var _clearButtonRect = new HRect(_reloadButtonRect);
    _clearButtonRect.offsetBy(100,0);
    var _clearButton = new HClickButton(_clearButtonRect,this.view,{label:'Clear'})
    HVM.values[this.values.clear_button].bind(_clearButton)
    
    
  }
});




