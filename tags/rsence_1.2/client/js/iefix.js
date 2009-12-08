
ie_htc_path=null;function ie_early_fixes(){try{document.execCommand("BackgroundImageCache",false,true);}
catch(e){}
var _J1=document.scripts[document.scripts.length-1],_Ia=_J1.src;ie_htc_path=_Ia.substring(0,_Ia.lastIndexOf("/")+1);console={log:function(){}};}
ie_early_fixes();iefix={setWinSize:function(){window.innerWidth=document.documentElement.clientWidth;window.innerHeight=document.documentElement.clientHeight;},_fb:function(_d){return _d.currentStyle.hasLayout;},layoutWidth:function(_d){var _0=iefix,_h,i=0,_d2=_d.offsetParent;while(_d2&&!_0._fb(_d2)){_d2=_d2.offsetParent;}
if(!_d2._Z5){_d2._Z5=[];}
if(!_d._9b){_d2._Z5.push(_d);_h=_d2;while(_h.offsetParent){_h=_h.offsetParent;if(_h._Z5){_h._Z5.push(_d);}
if(_h.style.position==="absolute"||_h.style.position==="fixed"){break;}}
_d._9b=true;}
if(!_d2._6b){_d2.attachEvent("onpropertychange",function(){if(window.event.propertyName==="style.width"){for(;i<_d2._Z5.length;i++){_0.resizeRight(_d2._Z5[i]);}}});_d2._6b=true;}
return(_d2||document.documentElement).clientWidth;},getBorderWidth:function(_d){return _d.offsetWidth-_d.clientWidth;},getPixelValue:function(_d,_1){var _0=iefix,_n0,_Pa;if(_0._kb.test(_1)){return parseInt(_1,10);}
_n0=_d.style.left;_Pa=_d.runtimeStyle.left;_d.runtimeStyle.left=_d.currentStyle.left;_0.resizing=true;_d.style.left=_1||0;_1=_d.style.pixelLeft;_d.style.left=_n0;_0.resizing=false;_d.runtimeStyle.left=_Pa;return _1;},getPixelWidth:function(_d,_1){var _0=iefix;if(_0._Va.test(_1)){return parseInt(parseFloat(_1)/100*_0.layoutWidth(_d),10);}
return _0.getPixelValue(_d,_1);},getPaddingWidth:function(_d){var _0=iefix;return _0.getPixelWidth(_d,_d.currentStyle.paddingLeft)+_0.getPixelWidth(_d,_d.currentStyle.paddingRight);},resizeRight:function(_d){var _0=iefix,_b0,_w;if(_d.currentStyle===null){return;}
_b0=parseInt(_d.currentStyle.left,10);_w=_0.layoutWidth(_d)-parseInt(_d.currentStyle.right,10)-_b0;if(parseInt(_d.runtimeStyle.width,10)===_w){return;}
_d.runtimeStyle.width="";if(_d.offsetWidth<_w){_w-=_0.getBorderWidth(_d)+_0.getPaddingWidth(_d);if(_w<0){_w=0;}
_d.runtimeStyle.width=_w;}},fixOpacity:function(_d){var _00=(parseFloat(_d.currentStyle.opacity)*100)||1,_K1=_d.filters["DXImageTransform.Microsoft.Alpha"];if(_K1){_K1.Opacity=_00;_K1.Enabled=true;}
else{_d.runtimeStyle.filter+="progid:DXImageTransform.Microsoft.Alpha(opacity="+_00+")";}},fixBackgroundImage:function(_d){var _0=iefix,_y,_K1;_y=_d.currentStyle.backgroundImage.match(/url\(\s*['"]?([^'")]+)['"]?\s*\)/);if(!_y){return;}
else{_y=_y[1];}
_K1=_d.filters["DXImageTransform.Microsoft.AlphaImageLoader"];if(_0.pngCheck.test(_y)){if(_K1){_K1.sizingMethod="crop";_K1.src=_y;_K1.Enabled=true;}
else{_d.runtimeStyle.filter+="progid:DXImageTransform.Microsoft.AlphaImageLoader(src='"+_y+"',sizingMethod='crop')";}
_d.runtimeStyle.zoom="0";_d.runtimeStyle.backgroundImage="none";}
else if(_K1){_K1.Enabled=false;}},addFilter:function(_d,_q4){var _0=iefix,_K1,_tb;_K1=_d.filters["DXImageTransform.Microsoft.AlphaImageLoader"];if(_K1){_K1.src=_d.src;_K1.Enabled=true;}
else{_d.runtimeStyle.filter+="progid:DXImageTransform.Microsoft.AlphaImageLoader(src='"+_d.src+"',sizingMethod='scale')";}
_jb=_d.src;_d.src=_0.blankGifPath;_q4.src=_jb;},fixImg:function(_d){var _0=iefix,_q4;if(_0.pngCheck.test(_d.src)){_q4=new Image(_d.width,_d.height);_q4.onload=function(){_d.width=_q4.width;_d.height=_q4.height;_q4=null;};_0.addFilter(_d,_q4);}},_nb:['PARAM'],inlineStyleChanged:function(_d){var _0=iefix,_E3;_E3=_d.currentStyle;if(_0._nb.indexOf(_d.tagName)!==-1){return;}
try{if((_E3.position==="absolute"||_E3.position==="fixed")&&_E3.left!=="auto"&&_E3.right!=="auto"&&_E3.width==="auto"){_0.resizeRight(_d);}
if((_E3.position==="absolute"||_E3.position==="fixed")&&_E3.top!=="auto"&&_E3.bottom!=="auto"&&_E3.height==="auto"){_0.resizeBottom(_d);}
if(_d.currentStyle.opacity){_0.fixOpacity(_d);}}catch(e){alert("iefix error! element:"+_d.tagName+" e:"+e.description);}
if(_d.style.backgroundColor==='transparent'&&(_d.style.backgroundImage==='none'||!_d.style.backgroundImage)){_d.style.backgroundImage="url("+ie_htc_path+"128.gif)";}},_La:0,_F3:function(_d){var _0=iefix;_0._La++;_d=_d||document.documentElement;while(_d){if(_d.nodeType===1){_0.inlineStyleChanged(_d);}
var _i8=_d.firstChild;if(!_i8){_i8=_d.nextSibling;}
while(!_i8&&_d.parentNode){_d=_d.parentNode;_i8=_d.nextSibling;}
_d=_i8;}},stylesheet_refresh:function(_T9){_T9.cssText+="";},init:function(){var _0=iefix;_0._yb=/^(auto|0cm)$/;_0._kb=/^\d+(px)?$/i;_0._Va=/^\d+%$/;_0.pngCheck=new RegExp(".png$","i");_0.blankGifPath=ie_htc_path+"0.gif";eval("_0.getMarginWidth="+String(_0.getPaddingWidth).replace(/padding/g,"margin"));eval("_0.getPaddingHeight="+String(_0.getPaddingWidth).replace(/Width/g,"Height").replace(/Left/g,"Top").replace(/Right/g,"Bottom"));eval("_0.getMarginHeight="+String(_0.getPaddingHeight).replace(/padding/g,"margin"));eval("_0.getBorderHeight="+String(_0.getBorderWidth).replace(/Width/g,"Height"));eval("_0.layoutHeight="+String(_0.layoutWidth).replace(/Width/g,"Height").replace(/width/g,"height").replace(/Right/g,"Bottom"));eval("_0.getPixelHeight="+String(_0.getPixelWidth).replace(/Width/g,"Height"));eval("_0.resizeBottom="+String(_0.resizeRight).replace(/Width/g,"Height").replace(/width/g,"height").replace(/left/g,"top").replace(/right/g,"bottom"));_0.resizing=false;},htcStyleEntry:function(){if(document.readyState==="complete"&&window.event.srcElement.readyState==="complete"){iefix._F3();}},_Y5:['width','height','left','top','right','bottom','display','position'],htcElementEntry:function(){var _d=window.event.srcElement,_u8=window.event.propertyName;if(_u8==="style.opacity"){iefix.fixOpacity(_d);}
else if((_u8==="src"&&_d.tagName==="IMG")||(_d.tagName==="INPUT"&&_d.type==="image")){window.status='htcElementEntry: '+iefix._X5+' img';iefix.fixImg(_d);}
else if(_u8.substring(0,6)==='style.'){if(iefix._Y5.indexOf(_u8.split('style.')[1])!==-1){iefix._F3();}}}};iefix.init();ie_complete=document.readyState==="complete";ie_initialized=false;ie_documentLoaded=function(){if(document.readyState==="complete"){iefix._F3();}};ie_fixes=function(){if(!ie_initialized){if(ie_complete){ie_documentLoaded();}
else{document.onreadystatechange=ie_documentLoaded;}
ie_initialized=true;}};ie_fixes();window.onresize=function(){iefix.setWinSize();iefix._F3();};