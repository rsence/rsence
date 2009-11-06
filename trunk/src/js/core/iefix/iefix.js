/*   Riassence Framework
 *   Copyright 2006 Riassence Inc.
 *   http://riassence.com/
 *
 *   You should have received a copy of the GNU General Public License along
 *   with this software package. If not, contact licensing@riassence.com
 */

// Injects htc stuff into IE
ie_htc_path = null;
function ie_early_fixes() {
  
  document.execCommand("BackgroundImageCache",false,true);
  
  var _script = document.scripts[document.scripts.length - 1],
      _src = _script.src;
  
  ie_htc_path = _src.substring(0, _src.lastIndexOf("/") + 1);
  
  console = {
    log: function(){
      
    }
  };
}
ie_early_fixes();

/***
**** iefix contains a collection of fixes for IE's bad behavior
***/
iefix = {
  
  // call this on resize, loaded events:
  setWinSize: function(){
    window.innerWidth=document.documentElement.clientWidth;
    window.innerHeight=document.documentElement.clientHeight;
  },
  
  // checks if the element has the .hasLayout flag set:
  _hasLayout: function(_element){
    return _element.currentStyle.hasLayout;
  },
  
  // finds the next parent with fixed or absolute positioning:
  // NOTICE: .init() makes ._layoutHeight() from this by replacing width with height
  layoutWidth: function(_element) {
    var _this=iefix,_parent,i=0,
        // gets the parent from which the width is calculated
        _layoutParent=_element.offsetParent;
    while(_layoutParent&&!_this._hasLayout(_layoutParent)){
      _layoutParent=_layoutParent.offsetParent;
    }
    if(!_layoutParent._resizewidthElements){_layoutParent._resizewidthElements=[];}
    if(!_element._addedResizewidthFix){
      _layoutParent._resizewidthElements.push(_element);
      _parent=_layoutParent;
      while(_parent.offsetParent){
        _parent=_parent.offsetParent;
        if(_parent._resizewidthElements){_parent._resizewidthElements.push(_element);}
        if(_parent.style.position==="absolute"||_parent.style.position==="fixed"){break;}
      }
      _element._addedResizewidthFix=true;
    }
    if(!_layoutParent._resizewidth){
      _layoutParent.attachEvent("onpropertychange", function(){
        if(window.event.propertyName==="style.width"){
          for (;i<_layoutParent._resizewidthElements.length;i++){
            _this.resizeRight(_layoutParent._resizewidthElements[i]);
          }
        }
      });
      _layoutParent._resizewidth=true;
    }
    return (_layoutParent||document.documentElement).clientWidth;
  },
  
  // calculates the border width of the _element:
  // NOTICE: .init() makes ._getBorderHeight() from this by replacing Width with Height
  getBorderWidth: function(_element){
    return _element.offsetWidth-_element.clientWidth;
  },
  
  // calculates the actual value in pixels from _value:
  getPixelValue: function(_element,_value) {
    var _this=iefix,_style,_runtimeStyle;
    if(_this._PIXEL.test(_value)){return parseInt(_value,10);}
    // saves style in temp
    _style=_element.style.left;
    _runtimeStyle=_element.runtimeStyle.left;
    _element.runtimeStyle.left=_element.currentStyle.left;
    _this.resizing=true;
    _element.style.left=_value||0;
    // has pixel value
    _value=_element.style.pixelLeft;
    _element.style.left=_style;
    _this.resizing=false;
    _element.runtimeStyle.left=_runtimeStyle;
    return _value;
  },
  
  // calculates pixel value from the value given (even percentages)
  // NOTICE: .init() makes ._getPixelHeght() from this by replacing Width with Height
  getPixelWidth: function(_element,_value){
    var _this=iefix;
    if(_this._PERCENT.test(_value)){return parseInt(parseFloat(_value)/100*_this.layoutWidth(_element),10);}
    return _this.getPixelValue(_element, _value);
  },
  
  // calculates padding width of the _element:
  // NOTICE: .init() makes .getPaddingHeight() from this by replacing Left/Right/Width with Top/Bottom/Height
  // NOTICE: .init() also makes ._getMarginWidth() and ._getMarginHeight from this.
  getPaddingWidth: function(_element) {
    var _this=iefix;
    return _this.getPixelWidth(_element,_element.currentStyle.paddingLeft)+_this.getPixelWidth(_element,_element.currentStyle.paddingRight);
  },
  
  // calculates element's position from the right edge of the parent:
  // NOTICE: .init() makes _resizeBottom() from this by replacing left/width with top/height
  resizeRight: function(_element){
    var _this=iefix,_left,_width;
    //window.status = 'resizeRight';
    if(_element.currentStyle===null){return;}
    _left=parseInt(_element.currentStyle.left,10);
    _width=_this.layoutWidth(_element)-parseInt(_element.currentStyle.right,10)-_left;
    if(parseInt(_element.runtimeStyle.width,10)===_width){return;}
    _element.runtimeStyle.width="";
    if(_element.offsetWidth<_width){
      _width-=_this.getBorderWidth(_element)+_this.getPaddingWidth(_element);
      if(_width<0){_width=0;}
      _element.runtimeStyle.width=_width;
    }
  },
  
  // (css-property) opacity fix:
  fixOpacity: function(_element){
    var _opacity=(parseFloat(_element.currentStyle.opacity)*100)||1,
        _filter=_element.filters["DXImageTransform.Microsoft.Alpha"];
    if(_filter){_filter.Opacity=_opacity;_filter.Enabled=true;}
    else{_element.runtimeStyle.filter+="progid:DXImageTransform.Microsoft.Alpha(opacity="+_opacity+")";}
  },
  
  // png background image fix:
  fixBackgroundImage: function(_element) {
    //window.status='fixBackgroundImage: ';
    var _this=iefix,_url,_filter;
    _url=_element.currentStyle.backgroundImage.match(/url\(\s*['"]?([^'")]+)['"]?\s*\)/);
    //window.status+=' url:'+_url;
    //window.status+=' pngCheck:'+_this.pngCheck.test(_url);
    if(!_url){return;}
    else{_url=_url[1];}
    _filter=_element.filters["DXImageTransform.Microsoft.AlphaImageLoader"];
    if(_this.pngCheck.test(_url)){ // needs more work
      // access before filter is set makes error
      if(_filter){
        _filter.sizingMethod="crop";
        _filter.src=_url;
        _filter.Enabled=true;
      }
      else{
        _element.runtimeStyle.filter+="progid:DXImageTransform.Microsoft.AlphaImageLoader(src='"+_url+"',sizingMethod='crop')";
      }
      _element.runtimeStyle.zoom="0";
      _element.runtimeStyle.backgroundImage="none";
    }
    else if(_filter){
      _filter.Enabled=false;
    }
  },
  
  // png img opacity fix:
  addFilter: function(_element,_image){
    var _this=iefix,_filter,_tempUrl;
    _filter=_element.filters["DXImageTransform.Microsoft.AlphaImageLoader"];
    if(_filter){_filter.src=_element.src;_filter.Enabled=true;}
    else{_element.runtimeStyle.filter+="progid:DXImageTransform.Microsoft.AlphaImageLoader(src='"+_element.src+"',sizingMethod='scale')";}
    _tempURL=_element.src;
    _element.src=_this.blankGifPath;
    _image.src=_tempURL;
  },
  
  // checks if image is png
  fixImg: function(_element){
    var _this=iefix,_image;
    if(_this.pngCheck.test(_element.src)){ // needs more work
      _image=new Image(_element.width,_element.height);
      _image.onload=function(){_element.width=_image.width;_element.height=_image.height;_image=null;};
      _this.addFilter(_element,_image);
    }
  },
  
  _noStyleTagNames: ['PARAM'],
  // applies fixes to the _element
  inlineStyleChanged: function(_element){
    var _this=iefix,_currentStyle;
    _currentStyle=_element.currentStyle;
    if(_this._noStyleTagNames.indexOf(_element.tagName)!==-1){ return; }
    // check if element needs to be positioned from the right
    try{
      if((_currentStyle.position==="absolute"||_currentStyle.position==="fixed")&&_currentStyle.left!=="auto"&&_currentStyle.right!=="auto"&&_currentStyle.width==="auto"){
        _this.resizeRight(_element);
      }
    
    // check if element needs to be positioned from the bottom
      if((_currentStyle.position==="absolute"||_currentStyle.position==="fixed")&&_currentStyle.top!=="auto"&&_currentStyle.bottom!=="auto"&&_currentStyle.height==="auto"){
        _this.resizeBottom(_element);
        // TODO: needs line height calculation here too for elements smaller than the line height or font size
      }
    
    // check if opacity needs to be fixed:
      if(_element.currentStyle.opacity){_this.fixOpacity(_element);}
      
    } catch(e) {
      alert("iefix error! element:"+_element.tagName+" e:"+e.description);
    }
    
    // check if background image needs to be fixed:
    //if(_element.currentStyle.backgroundImage){_this.fixBackgroundImage(_element);}
    
    // check if png needs to be fixed:
    //if(_element.tagName==="IMG"||(_element.tagName==="INPUT"&&_element.type==="image")){_this.fixImg(_element);}
    
    // anti-click-through fix:
    //else 
    if(_element.style.backgroundColor==='transparent'&&(_element.style.backgroundImage==='none'||!_element.style.backgroundImage)){
      _element.style.backgroundImage="url("+ie_htc_path+"128.gif)"; // transparent gif, 128x128
    }
  },
  
  _traverseCount: 0,
  // traverses from the _element node from the bottom to fix right|bottom positioning
  _traverseTree: function(_element){
    var _this=iefix;
    _this._traverseCount++;
    //window.status = 'traversecount: '+_this._traverseCount;
    _element=_element||document.documentElement;
    while(_element){
      if(_element.nodeType===1){
        _this.inlineStyleChanged(_element);
      }
      var _next=_element.firstChild;
      if(!_next){ _next=_element.nextSibling;}
      while(!_next&&_element.parentNode) {
        _element=_element.parentNode;
        _next=_element.nextSibling;
      }
      _element=_next;
    }
  },
  
  // triggers an htc style event to elements affected by the style.
  stylesheet_refresh: function(_styleSheet){
    _styleSheet.cssText += "";
  },
  
  // initial constructs
  init: function() {
    var _this = iefix;
    _this._AUTO = /^(auto|0cm)$/;
    _this._PIXEL = /^\d+(px)?$/i;
    _this._PERCENT = /^\d+%$/;
    _this.pngCheck = new RegExp(".png$", "i"); // needs more work
    //this.pngCheck = new RegExp("((\.gif)|(\.jpg))$", "i"); // needs more work
    // needed for png hack
    _this.blankGifPath=ie_htc_path+"0.gif";
    eval("_this.getMarginWidth="+String(_this.getPaddingWidth).replace(/padding/g,"margin"));
    eval("_this.getPaddingHeight="+String(_this.getPaddingWidth).replace(/Width/g,"Height").replace(/Left/g,"Top").replace(/Right/g,"Bottom"));
    eval("_this.getMarginHeight="+String(_this.getPaddingHeight).replace(/padding/g,"margin"));
    eval("_this.getBorderHeight="+String(_this.getBorderWidth).replace(/Width/g,"Height"));
    eval("_this.layoutHeight="+String(_this.layoutWidth).replace(/Width/g,"Height").replace(/width/g,"height").replace(/Right/g,"Bottom"));
    eval("_this.getPixelHeight="+String(_this.getPixelWidth).replace(/Width/g,"Height"));
    eval("_this.resizeBottom="+String(_this.resizeRight).replace(/Width/g,"Height").replace(/width/g,"height").replace(/left/g,"top").replace(/right/g,"bottom"));
    _this.resizing = false;
  },
  
  // entry point from ie_css_style.htc
  htcStyleEntry: function(){
    //window.status = 'htcStyleEntry';
    if(document.readyState==="complete"&&window.event.srcElement.readyState==="complete"){
      iefix._traverseTree();
    }
  },
  
  _traverseStyleProperties: ['width','height','left','top','right','bottom','display','position'],
  //_traverseStyleProperties: ['right','bottom','width','height'],
  
  //_elemEntryCount: 0,
  
  // entry point from ie_css_element.htc
  htcElementEntry: function(){
    //iefix._elemEntryCount++;
    //window.status="htcElementEntry: "+iefix._elemEntryCount;
    var _element=window.event.srcElement, _propName=window.event.propertyName;
    if (_propName==="style.opacity"){
      //window.status = 'htcElementEntry: '+iefix._elemEntryCount+' opacity';
      iefix.fixOpacity(_element);
    }
    else if((_propName==="src"&&_element.tagName==="IMG")||(_element.tagName==="INPUT"&&_element.type==="image")){
      window.status = 'htcElementEntry: '+iefix._elemEntryCount+' img';
      iefix.fixImg(_element);
    }
    //else if(_propName==='style.cssText'){
      //window.status = 'htcElementEntry: '+iefix._elemEntryCount+' cssText';
      //iefix._traverseTree();
    //}
    else if(_propName.substring(0,6)==='style.'){
      if(iefix._traverseStyleProperties.indexOf(_propName.split('style.')[1])!==-1){
        //window.status = 'htcElementEntry: '+iefix._elemEntryCount+' style';
        iefix._traverseTree();
      }
      
      /*
      else {
        window.status+=window.event.propertyName+' ';
      }*/
      
    }
    //iefix._traverseTree(); // really should have more checks, this impacts performance heavily!
    
  }
};
iefix.init();

ie_complete=document.readyState==="complete";
ie_initialized=false;

ie_documentLoaded=function(){if(document.readyState==="complete"){iefix._traverseTree();}};
ie_fixes=function(){
  if( !ie_initialized
    ){
    if(ie_complete){
      //var _stylesheet=document.createStyleSheet();
      //_stylesheet.cssText='style,link{behavior:url('+ie_htc_path+'ie_css_style.htc)}\n*{behavior:url('+ie_htc_path+'ie_css_element.htc)}';
      ie_documentLoaded();
    }
    else{
      //document.write('<style type="text/css">style,link{behavior:url('+ie_htc_path+'ie_css_style.htc)}\n*{behavior:url('+ie_htc_path+'ie_css_element.htc)}</style>');
      document.onreadystatechange=ie_documentLoaded;
    }
    ie_initialized=true;
  }
};
ie_fixes();
window.onresize=function(){iefix.setWinSize();iefix._traverseTree();};



