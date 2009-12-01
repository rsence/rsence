
ie_htc_path=null;function ie_early_fixes(){try{document.execCommand("BackgroundImageCache",false,true);}
catch(e){}
var _J1=document.scripts[document.scripts.length-1],_Ia=_J1.src;ie_htc_path=_Ia.substring(0,_Ia.lastIndexOf("/")+1);console={log:function(){}};}
ie_early_fixes();iefix={setWinSize:function(){window.innerWidth=document.documentElement.clientWidth;window.innerHeight=document.documentElement.clientHeight;},_Wa:function(_d){return _d.currentStyle.hasLayout;},layoutWidth:function(_d){var _0=iefix,_h,i=0,_h2=_d.offsetParent;while(_h2&&!_0._Wa(_h2)){_h2=_h2.offsetParent;}
if(!_h2._Y5){_h2._Y5=[];}
if(!_d._pb){_h2._Y5.push(_d);_h=_h2;while(_h.offsetParent){_h=_h.offsetParent;if(_h._Y5){_h._Y5.push(_d);}
if(_h.style.position==="absolute"||_h.style.position==="fixed"){break;}}
_d._pb=true;}
if(!_h2._Ta){_h2.attachEvent("onpropertychange",function(){if(window.event.propertyName==="style.width"){for(;i<_h2._Y5.length;i++){_0.resizeRight(_h2._Y5[i]);}}});_h2._Ta=true;}
return(_h2||document.documentElement).clientWidth;},getBorderWidth:function(_d){return _d.offsetWidth-_d.clientWidth;},getPixelValue:function(_d,_1){var _0=iefix,_n0,_Na;if(_0._ib.test(_1)){return parseInt(_1,10);}
_n0=_d.style.left;_Na=_d.runtimeStyle.left;_d.runtimeStyle.left=_d.currentStyle.left;_0.resizing=true;_d.style.left=_1||0;_1=_d.style.pixelLeft;_d.style.left=_n0;_0.resizing=false;_d.runtimeStyle.left=_Na;return _1;},getPixelWidth:function(_d,_1){var _0=iefix;if(_0._Za.test(_1)){return parseInt(parseFloat(_1)/100*_0.layoutWidth(_d),10);}
return _0.getPixelValue(_d,_1);},getPaddingWidth:function(_d){var _0=iefix;return _0.getPixelWidth(_d,_d.currentStyle.paddingLeft)+_0.getPixelWidth(_d,_d.currentStyle.paddingRight);},resizeRight:function(_d){var _0=iefix,_b0,_w;if(_d.currentStyle===null){return;}
_b0=parseInt(_d.currentStyle.left,10);_w=_0.layoutWidth(_d)-parseInt(_d.currentStyle.right,10)-_b0;if(parseInt(_d.runtimeStyle.width,10)===_w){return;}
_d.runtimeStyle.width="";if(_d.offsetWidth<_w){_w-=_0.getBorderWidth(_d)+_0.getPaddingWidth(_d);if(_w<0){_w=0;}
_d.runtimeStyle.width=_w;}},fixOpacity:function(_d){var _30=(parseFloat(_d.currentStyle.opacity)*100)||1,_L1=_d.filters["DXImageTransform.Microsoft.Alpha"];if(_L1){_L1.Opacity=_30;_L1.Enabled=true;}
else{_d.runtimeStyle.filter+="progid:DXImageTransform.Microsoft.Alpha(opacity="+_30+")";}},fixBackgroundImage:function(_d){var _0=iefix,_y,_L1;_y=_d.currentStyle.backgroundImage.match(/url\(\s*['"]?([^'")]+)['"]?\s*\)/);if(!_y){return;}
else{_y=_y[1];}
_L1=_d.filters["DXImageTransform.Microsoft.AlphaImageLoader"];if(_0.pngCheck.test(_y)){if(_L1){_L1.sizingMethod="crop";_L1.src=_y;_L1.Enabled=true;}
else{_d.runtimeStyle.filter+="progid:DXImageTransform.Microsoft.AlphaImageLoader(src='"+_y+"',sizingMethod='crop')";}
_d.runtimeStyle.zoom="0";_d.runtimeStyle.backgroundImage="none";}
else if(_L1){_L1.Enabled=false;}},addFilter:function(_d,_L4){var _0=iefix,_L1,_zb;_L1=_d.filters["DXImageTransform.Microsoft.AlphaImageLoader"];if(_L1){_L1.src=_d.src;_L1.Enabled=true;}
else{_d.runtimeStyle.filter+="progid:DXImageTransform.Microsoft.AlphaImageLoader(src='"+_d.src+"',sizingMethod='scale')";}
_qb=_d.src;_d.src=_0.blankGifPath;_L4.src=_qb;},fixImg:function(_d){var _0=iefix,_L4;if(_0.pngCheck.test(_d.src)){_L4=new Image(_d.width,_d.height);_L4.onload=function(){_d.width=_L4.width;_d.height=_L4.height;_L4=null;};_0.addFilter(_d,_L4);}},_rb:['PARAM'],inlineStyleChanged:function(_d){var _0=iefix,_P2;_P2=_d.currentStyle;if(_0._rb.indexOf(_d.tagName)!==-1){return;}
try{if((_P2.position==="absolute"||_P2.position==="fixed")&&_P2.left!=="auto"&&_P2.right!=="auto"&&_P2.width==="auto"){_0.resizeRight(_d);}
if((_P2.position==="absolute"||_P2.position==="fixed")&&_P2.top!=="auto"&&_P2.bottom!=="auto"&&_P2.height==="auto"){_0.resizeBottom(_d);}
if(_d.currentStyle.opacity){_0.fixOpacity(_d);}}catch(e){alert("iefix error! element:"+_d.tagName+" e:"+e.description);}
if(_d.style.backgroundColor==='transparent'&&(_d.style.backgroundImage==='none'||!_d.style.backgroundImage)){_d.style.backgroundImage="url("+ie_htc_path+"128.gif)";}},_Ka:0,_F3:function(_d){var _0=iefix;_0._Ka++;_d=_d||document.documentElement;while(_d){if(_d.nodeType===1){_0.inlineStyleChanged(_d);}
var _F8=_d.firstChild;if(!_F8){_F8=_d.nextSibling;}
while(!_F8&&_d.parentNode){_d=_d.parentNode;_F8=_d.nextSibling;}
_d=_F8;}},stylesheet_refresh:function(_C9){_C9.cssText+="";},init:function(){var _0=iefix;_0._tb=/^(auto|0cm)$/;_0._ib=/^\d+(px)?$/i;_0._Za=/^\d+%$/;_0.pngCheck=new RegExp(".png$","i");_0.blankGifPath=ie_htc_path+"0.gif";eval("_0.getMarginWidth="+String(_0.getPaddingWidth).replace(/padding/g,"margin"));eval("_0.getPaddingHeight="+String(_0.getPaddingWidth).replace(/Width/g,"Height").replace(/Left/g,"Top").replace(/Right/g,"Bottom"));eval("_0.getMarginHeight="+String(_0.getPaddingHeight).replace(/padding/g,"margin"));eval("_0.getBorderHeight="+String(_0.getBorderWidth).replace(/Width/g,"Height"));eval("_0.layoutHeight="+String(_0.layoutWidth).replace(/Width/g,"Height").replace(/width/g,"height").replace(/Right/g,"Bottom"));eval("_0.getPixelHeight="+String(_0.getPixelWidth).replace(/Width/g,"Height"));eval("_0.resizeBottom="+String(_0.resizeRight).replace(/Width/g,"Height").replace(/width/g,"height").replace(/left/g,"top").replace(/right/g,"bottom"));_0.resizing=false;},htcStyleEntry:function(){if(document.readyState==="complete"&&window.event.srcElement.readyState==="complete"){iefix._F3();}},_Z5:['width','height','left','top','right','bottom','display','position'],htcElementEntry:function(){var _d=window.event.srcElement,_G8=window.event.propertyName;if(_G8==="style.opacity"){iefix.fixOpacity(_d);}
else if((_G8==="src"&&_d.tagName==="IMG")||(_d.tagName==="INPUT"&&_d.type==="image")){window.status='htcElementEntry: '+iefix._X5+' img';iefix.fixImg(_d);}
else if(_G8.substring(0,6)==='style.'){if(iefix._Z5.indexOf(_G8.split('style.')[1])!==-1){iefix._F3();}}}};iefix.init();ie_complete=document.readyState==="complete";ie_initialized=false;ie_documentLoaded=function(){if(document.readyState==="complete"){iefix._F3();}};ie_fixes=function(){if(!ie_initialized){if(ie_complete){ie_documentLoaded();}
else{document.onreadystatechange=ie_documentLoaded;}
ie_initialized=true;}};ie_fixes();window.onresize=function(){iefix.setWinSize();iefix._F3();};