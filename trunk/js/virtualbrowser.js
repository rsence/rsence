
ie_namespace={};function $(H2){if(typeof H2=='string')H2=document.getElementById(H2);return H2;}
helmi={};Object.extend=function(destination,source){for(property in source){destination[property]=source[property];}
return destination;}
helmi.UserAgent=function(){var b=navigator.appName;var v=navigator.appVersion;var ua=navigator.userAgent.toLowerCase();this.safari=ua.indexOf("safari")>-1;this.opera=ua.indexOf("opera")>-1;this.ns=!this.opera&&!this.safari&&(b=="Netscape");this.ie=!this.opera&&(b=="Microsoft Internet Explorer");this.gecko=!this.safari&&ua.indexOf("gecko")>-1;if(this.ns){this.ns4=(this.v==4);this.v=parseInt(ua.substr(ua.indexOf("netscape")+9,1),10);this.ns6=(this.v==6);this.ns7=(this.v==7);}else if(this.ie){this.ie4=(v.indexOf("MSIE 4")>0);this.ie5=(v.indexOf("MSIE 5")>0);this.ie55=(v.indexOf("MSIE 5.5")>0);this.ie6=(v.indexOf("MSIE 6")>0);this.ie7=(v.indexOf("MSIE 7")>0);}else if(this.opera){this.v=parseInt(ua.substr(ua.indexOf("opera")+6,1),10);this.opera6=(this.v==6);this.opera7=(this.v==7);this.opera8=(this.v==8);this.opera9=(this.v==9);}
this.win=ua.indexOf("win")>-1;this.mac=ua.indexOf("mac")>-1;}
is=new helmi.UserAgent();helmi.Element=Base.extend({constructor:null,getPageLocation:function(H2,H1J){var H08=0,H09=0;var Hm;var H2c=H2;if(is.opera){if(is.opera9){do{Hm=H2.offsetParent;H08+=H2.offsetLeft;H09+=H2.offsetTop;H2=Hm;}while(H2);}else{if(H2.tagName.toLowerCase()=="body"){return[0,0];}
var H0m;do{Hm=H2.offsetParent;if(H2.tagName.toLowerCase()=="body"&&H0m&&(H0m.style.position=="absolute"||H0m.style.position=="relative"||H0m.style.position=="fixed")){}else{H08+=H2.offsetLeft;H09+=H2.offsetTop;}
if(Hm&&Hm.tagName.toLowerCase()=="body"&&(H2.style.position=="absolute"||H2.style.position=="relative"||H2.style.position=="fixed"||H2.tagName.toLowerCase()=="input"||H2.tagName.toLowerCase()=="button"||H2.tagName.toLowerCase()=="select"||H2.tagName.toLowerCase()=="textarea")){}else if(Hm){H08+=Hm.clientLeft;H09+=Hm.clientTop;}
H0m=H2;H2=Hm;}while(H2);}}else if(is.safari){if(H2.tagName.toLowerCase()=="body"){return[0,0];}
var H0m;do{Hm=H2.offsetParent;if(H2.tagName.toLowerCase()=="body"&&H0m&&(H0m.style.position=="absolute"||H0m.style.position=="fixed")){}else{H08+=H2.offsetLeft;H09+=H2.offsetTop;}
H0m=H2;H2=Hm;}while(H2);}else if(is.ns){if(H1J){var H14=[];var x=H2.offsetLeft;var y=H2.offsetTop;var H5n=null;do{Hm=H2.offsetParent;if(H2==H2c&&H2.style.position!="absolute"){if(Hm&&(Hm.style.overflow=="scroll"||Hm.style.overflow=="auto")){H5n=Hm;}}
if(H2.style.overflow=="scroll"||H2.style.overflow=="auto"){H14.push([H2,H2.style.overflow,H2.scrollLeft,H2.scrollTop]);H2.style.overflow="inherit";}
H2=Hm;}while(H2);}
H2=H2c;do{Hm=H2.offsetParent;if(H2.tagName.toLowerCase()=="body"){}else{if(H2==H2c&&H2.style.position!="absolute"){H08+=x;H09+=y;}else{H08+=H2.offsetLeft;H09+=H2.offsetTop;}}
if(Hm&&Hm.tagName.toLowerCase()=="body"&&(H2.style.position=="absolute"||H2.style.position=="fixed")){}else if(Hm){H08+=(Hm.offsetWidth-Hm.clientWidth)/2;H09+=(Hm.offsetHeight-Hm.clientHeight)/2;if(Hm==H5n){H08+=(Hm.offsetWidth-Hm.clientWidth)/2;H09+=(Hm.offsetHeight-Hm.clientHeight)/2;}}
H2=Hm;}while(H2);if(H1J){var l=H14.length;for(var i=0;i<l;i++){H14[i][0].style.overflow=H14[i][1];H14[i][0].scrollLeft=H14[i][2];H14[i][0].scrollTop=H14[i][3];}}}else if(is.ie){if(H2.tagName.toLowerCase()=="body"){return[0,0];}
do{Hm=H2.offsetParent;H08+=H2.offsetLeft;H09+=H2.offsetTop;if(Hm&&Hm.tagName.toLowerCase()=="html"&&H2.style.position=="relative"){H08-=2;H09-=2;}
if(Hm&&Hm.tagName.toLowerCase()=="html"&&H2.style.position=="absolute"){}else if(Hm){H08+=Hm.clientLeft;H09+=Hm.clientTop;}
H2=Hm;}while(H2);}
if(H1J){H2=H2c;do{if(!H2.tagName||H2.tagName.toLowerCase()=="body"){break;}
if(H2.style.position=="fixed"){H08+=window.pageXOffset||document.documentElement.scrollLeft;H09+=window.pageYOffset||document.documentElement.scrollTop;}
Hm=H2.parentNode;if(H2!=H2c){if(is.opera&&H2.tagName.toLowerCase()=="tr"){}else{H08-=H2.scrollLeft;H09-=H2.scrollTop;}}
H2=Hm;}while(H2);}
return[H08,H09];},getSize:function(H2){return[H2.offsetWidth,H2.offsetHeight];},getVisibleSize:function(H2){var w=H2.offsetWidth;var h=H2.offsetHeight;var HD=H2.parentNode;while(HD&&HD.nodeName.toLowerCase()!='body'){var H0h;if(!is.ie){H0h=document.defaultView.getComputedStyle(HD,null).getPropertyValue('overflow');}else{H0h=HD.currentStyle.getAttribute('overflow');}
H0h=H0h!='visible';if(w>HD.clientWidth&&H0h){w=HD.clientWidth-H2.offsetLeft;}
if(h>HD.clientHeight&&H0h){h=HD.clientHeight-H2.offsetTop;}
H2=H2.parentNode;HD=H2.parentNode;}
return[w,h];},getVisiblePageLocation:function(H2,H1J){var H1r=this.getPageLocation(H2,H1J);var x=H1r[0];var y=H1r[1];var HD=H2.parentNode;while(HD&&HD.nodeName.toLowerCase()!='body'){var H0h;if(!is.ie){H0h=document.defaultView.getComputedStyle(HD,null).getPropertyValue('overflow');}else{H0h=HD.currentStyle.getAttribute('overflow');}
H0h=H0h!='visible';H1r=this.getPageLocation(HD,H1J);if(x<H1r[0]&&H0h){x=H1r[0];}
if(y<H1r[1]&&H0h){y=H1r[1];}
H2=H2.parentNode;HD=H2.parentNode;}
return[x,y];},hasClassName:function(H2,_className){H2=$(H2);if(!H2)return;var _hasClass=false;var _classNames=H2.className.split(' ');for(var i=0;i<_classNames.length;i++){if(_classNames[i]==_className){_hasClass=true;}}
return _hasClass;},addClassName:function(H2,_className){H2=$(H2);if(!H2)return;helmi.Element.removeClassName(H2,_className);H2.className+=' '+_className;},removeClassName:function(H2,_className){H2=$(H2);if(!H2)return;var _newClassName='';var _classNames=H2.className.split(' ');for(var i=0;i<_classNames.length;i++){if(_classNames[i]!=_className){if(i>0)_newClassName+=' ';_newClassName+=_classNames[i];}}
H2.className=_newClassName;}});Object.extend(Array.prototype,{indexOfObject:function(H2O){var i=0,l=this.length;for(;i<l;i++){if(this[i]==H2O){return i;}}
return-1;},containsObject:function(H2O){return this.indexOfObject(H2O)!=-1;},removeObject:function(H2O){while((i=this.indexOfObject(object))>=0){this.splice(i,1);}},first:function(){return this[0];},last:function(){return this[this.length-1];}});if(!is.ns7){Object.extend(Array.prototype,{indexOf:Array.prototype.indexOfObject});}
helmi.Window=Base.extend({constructor:null,getInnerWidth:function(){return(window.innerWidth)?window.innerWidth:document.documentElement.clientWidth;},getInnerHeight:function(){return(window.innerHeight)?window.innerHeight:document.documentElement.clientHeight;}});helmi.Event=Base.extend({constructor:null,getPageX:function(e){return e.pageX||e.clientX+document.documentElement.scrollLeft;},getPageY:function(e){return e.pageY||e.clientY+document.documentElement.scrollTop;},getKeyCode:function(e){return e.keyCode;},getCharCode:function(e){if(is.ns){return e.charCode;}else{return e.keyCode;}}});HPath=HClass.extend({constructor:null,getRelativePath:function(_docURL,_includeDocURL){var _docURL=this.getRelativeFilePath(_docURL,_includeDocURL);return _docURL.slice(0,_docURL.lastIndexOf("/")+1);},getRelativeFilePath:function(_docURL,_includeDocURL){_docURL=_docURL||"";if(_includeDocURL.charAt(0)=="/"){return _includeDocURL;}
var _docURL=_docURL.substring(0,_docURL.lastIndexOf("/")+1);var _dotDotSlash=_includeDocURL.indexOf("../");var H19=_docURL.length;var _endIndex;while(_dotDotSlash==0){if((_endIndex=_docURL.lastIndexOf("/",H19))!=-1){H19=_docURL.lastIndexOf("/",_endIndex-1);_docURL=_docURL.substring(0,H19+1);}else{break;}
_includeDocURL=_includeDocURL.substring(3);_dotDotSlash=_includeDocURL.indexOf("../");}
return _docURL+_includeDocURL;}});ie_namespace.iestyleSheetLoaded=function(){if(document.readyState=="complete"&&window.event.srcElement.readyState=="complete"){_traverseTree();}}
stylesheet_refresh=function(H23){H23.cssText+="";}
_traverseTree=function(H2){var H2=H2||document.documentElement;while(H2){if(H2.nodeType==1){HStyle._inlineStyleChanged(H2);}
var _next=H2.firstChild;if(!_next){_next=H2.nextSibling;}
while(!_next&&H2.parentNode){H2=H2.parentNode;_next=H2.nextSibling;}
H2=_next;}}
ie_namespace.ieinlineStyleChanged=function(){var H2=window.event.srcElement;if(window.event.propertyName=="style.opacity"){HOpacityFix._fixOpacity(H2);}
else if(window.event.propertyName=="src"&&H2.tagName=="IMG"||(H2.tagName=="INPUT"&&H2.type=="image")){HOpacityFix._fixImg(H2);}}
HStyle=HClass.extend({constructor:null,init:function(){this._AUTO=/^(auto|0cm)$/;},_inlineStyleChanged:function(H2){var _currentStyle=H2.currentStyle;if((_currentStyle.position=="absolute"||_currentStyle.position=="fixed")&&_currentStyle.left!="auto"&&_currentStyle.right!="auto"&&_currentStyle.width=="auto"){HRighBottoFix._resizeRight(H2);}
if((_currentStyle.position=="absolute"||_currentStyle.position=="fixed")&&_currentStyle.top!="auto"&&_currentStyle.bottom!="auto"&&_currentStyle.height=="auto"){HRighBottoFix._resizeBottom(H2);}
if(H2.currentStyle.opacity){HOpacityFix._fixOpacity(H2);}
if(H2.currentStyle.backgroundImage){HOpacityFix._fixBackgroundImage(H2);}
if(H2.tagName=="IMG"||(H2.tagName=="INPUT"&&H2.type=="image")){HOpacityFix._fixImg(H2);}}});HNumber=HClass.extend({constructor:null,init:function(){this._PIXEL=/^\d+(px)?$/i;this._PERCENT=/^\d+%$/;},getPixelValue:function(H2,H3){if(this._PIXEL.test(H3)){return parseInt(H3);}
var H0C=H2.style.left;var _runtimeStyle=H2.runtimeStyle.left;H2.runtimeStyle.left=H2.currentStyle.left;HRighBottoFix.resizing=true;H2.style.left=H3||0;H3=H2.style.pixelLeft;H2.style.left=H0C;HRighBottoFix.resizing=false;H2.runtimeStyle.left=_runtimeStyle;return H3;}});HOpacityFix=HClass.extend({constructor:null,init:function(){this._pngTest=new RegExp(".png$","i");},_fixOpacity:function(H2){var H0n=(parseFloat(H2.currentStyle.opacity)*100)||1;var _filter=H2.filters["DXImageTransform.Microsoft.Alpha"];if(_filter){_filter.Opacity=H0n;_filter.Enabled=true;}else{H2.runtimeStyle.filter+="progid:DXImageTransform.Microsoft.Alpha(opacity="+H0n+")";}},_fixBackgroundImage:function(H2){var HC=H2.currentStyle.backgroundImage.match(/url\(\s*['"]?([^'")]+)['"]?\s*\)/);if(!HC){return;}else{HC=HC[1];}
var _filter=H2.filters["DXImageTransform.Microsoft.AlphaImageLoader"];if(this._pngTest.test(HC)){if(_filter){_filter.sizingMethod="scale";_filter.src=HC;_filter.Enabled=true;}else{H2.runtimeStyle.filter+="progid:DXImageTransform.Microsoft.AlphaImageLoader(src='"+HC+"',sizingMethod='scale')";}
H2.runtimeStyle.zoom="1";H2.runtimeStyle.backgroundImage="none";}else if(_filter){_filter.Enabled=false;}},_fixImg:function(H2){if(this._pngTest.test(H2.src)){var H0z=new Image(H2.width,H2.height);H0z.onload=function(){H2.width=H0z.width;H2.height=H0z.height;H0z=null;}
this._addFilter(H2,H0z);}},_addFilter:function(H2,H0z){var _filter=H2.filters["DXImageTransform.Microsoft.AlphaImageLoader"];if(_filter){_filter.src=H2.src;_filter.Enabled=true;}else{H2.runtimeStyle.filter+="progid:DXImageTransform.Microsoft.AlphaImageLoader(src='"+H2.src+"',sizingMethod='scale')";}
var _tempURL=H2.src;H2.src=HPath.getRelativeFilePath(_tempURL,"blank.gif");H0z.src=_tempURL;}});HRighBottoFix=HClass.extend({constructor:null,init:function(){eval("this._getMarginWidth="+String(this._getPaddingWidth).replace(/padding/g,"margin"));eval("this._getPaddingHeight="+String(this._getPaddingWidth).replace(/Width/g,"Height").replace(/Left/g,"Top").replace(/Right/g,"Bottom"));eval("this._getMarginHeight="+String(this._getPaddingHeight).replace(/padding/g,"margin"));eval("this._getBorderHeight="+String(this._getBorderWidth).replace(/Width/g,"Height"));eval("this._layoutHeight="+String(this._layoutWidth).replace(/Width/g,"Height").replace(/width/g,"height").replace(/Right/g,"Bottom"));eval("this._getPixelHeight="+String(this._getPixelWidth).replace(/Width/g,"Height"));eval("this._resizeBottom="+String(this._resizeRight).replace(/Width/g,"Height").replace(/width/g,"height").replace(/left/g,"top").replace(/right/g,"bottom"));this.resizing=false;},_hasLayout:function(H2){return H2.currentStyle.hasLayout;},_getPaddingWidth:function(H2){return this._getPixelWidth(H2,H2.currentStyle.paddingLeft)+
this._getPixelWidth(H2,H2.currentStyle.paddingRight);},_getBorderWidth:function(H2){return H2.offsetWidth-H2.clientWidth;},_layoutWidth:function(H2){var _layoutParent=H2.offsetParent;while(_layoutParent&&!this._hasLayout(_layoutParent)){_layoutParent=_layoutParent.offsetParent;}
if(!_layoutParent._resizewidthElements){_layoutParent._resizewidthElements=[];}
if(!H2._addedResizewidthFix){_layoutParent._resizewidthElements.push(H2);var HD=_layoutParent;while(HD.offsetParent){HD=HD.offsetParent;if(HD._resizewidthElements){HD._resizewidthElements.push(H2);}
if(HD.style.position=="absolute"||HD.style.position=="fixed"){break;}}
H2._addedResizewidthFix=true;}
if(!_layoutParent._resizewidth){_layoutParent.attachEvent("onpropertychange",function(){if(window.event.propertyName=="style.width"){for(var i=0;i<_layoutParent._resizewidthElements.length;i++){HRighBottoFix._resizeRight(_layoutParent._resizewidthElements[i]);}}});_layoutParent._resizewidth=true;}
return(_layoutParent||document.documentElement).clientWidth;},_getPixelWidth:function(H2,H3){if(HNumber._PERCENT.test(H3)){return parseInt(parseFloat(H3)/100*this._layoutWidth(H2));}
return HNumber.getPixelValue(H2,H3);},_resizeRight:function(H2){var Hy=parseInt(H2.currentStyle.left);var Hf=this._layoutWidth(H2)-this._getPixelWidth(H2,H2.currentStyle.right)-Hy-this._getMarginWidth(H2);var Hf=this._layoutWidth(H2)-parseInt(H2.currentStyle.right)-Hy;if(parseInt(H2.runtimeStyle.width)==Hf){return;}
H2.runtimeStyle.width="";if(H2.offsetWidth<Hf){if(Hf<0){Hf=0;}
Hf-=this._getBorderWidth(H2)+this._getPaddingWidth(H2);H2.runtimeStyle.width=Hf;}}});ie_complete=document.readyState=="complete";ie_initialized=false;ie_documentLoaded=function(){if(document.readyState=="complete"){_traverseTree();}}
ie_fixes=function(){if(is.ie6&&!ie_initialized){if(ie_complete){var _stylesheet=document.createStyleSheet();_stylesheet.cssText='style,link{behavior:url('+ie_htc_path+'ie_css_style.htc)}\n*{behavior:url('+ie_htc_path+'ie_css_element.htc)}';ie_documentLoaded();}else{document.write('<style type="text/css">style,link{behavior:url('+ie_htc_path+'ie_css_style.htc)}\n*{behavior:url('+ie_htc_path+'ie_css_element.htc)}</style>');document.onreadystatechange=ie_documentLoaded;}
ie_initialized=true;}}
ie_fixes();