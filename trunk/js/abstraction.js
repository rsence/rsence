
frameskips=1;var H0s=document;var H12=0;var quot='"';var apos="'";is_ie=(H0s.all&&navigator.userAgent.indexOf("Opera")==-1);is_ie6=(is_ie&&navigator.userAgent.indexOf("MSIE 6")!=-1);is_ie7=(is_ie&&navigator.userAgent.indexOf("MSIE 7")!=-1);is_safari=(navigator.userAgent.indexOf("KHTML")!=-1);var H3H=[];var H4Z=false;onloader=function(H3G){if(H4Z){eval(H3G);}else{H3H.push(H3G);}}
var H6w=null;var H50=function(H27){if(H27){H4Z=true;while(H3H.length!=0){var H6x=H3H.shift();eval(H6x);}}else{H6w=setTimeout('H51()',5);}}
var H51=function(){var H27=false;if(is_ie){var H52="javascript:void(0)";if(location.protocol=="https:"){H52="src=//0";}
H0s.write("<scr"+"ipt id=__ie_onload defer src="+H52+"><\/scr"+"ipt>");var H6y=H0s.getElementById("__ie_onload");H6y.onreadystatechange=function(){if(this.readyState=="complete"){H50(true);}}
return;}
else if((/KHTML|WebKit/i.test(navigator.userAgent))&&(/loaded|complete/.test(H0s.readyState))){H27=true;}
else if(document.body){H27=true;}
H50(H27);}
H51();var H2G;var HO=[];var H1q=[];var H1H=[];var H2H=[];var H3I={};var H3J=false;var H1I=[];var prop_do_csstext=false;elem_bind=function(H53){var Hc=H0s.getElementById(H53);if(!Hc){return false;}
var H6=H3K(Hc);H1H[H6]=[];H1q[H6]=[];return H6;}
elem_add=function(Hc){var H6=H3K(Hc);H1H[H6]=[];H1q[H6]=[];return H6;}
elem_get=function(H6){return HO[H6];}
elem_set=function(H6,H13){HO[H6].innerHTML=H13;}
elem_del=function(H6){var H3L=HO[H6];if(H3L){var H02=H3L.parentNode;if(H02){H02.removeChild(H3L);}}
HO[H6]=null;H1H[H6]=[];H1q[H6]=[];H1I.push(H6);}
elem_replace=function(H6,Hc){var H5c=H1I.indexOf(H6);if(H5c>-1){H1I.splice(H5c,1);}
HO[H6]=Hc;}
elem_append=function(H28,H6){HO[H28].appendChild(HO[H6]);}
elem_mk=function(H28,H0U){if(H0U===undefined){H0U='div';}
var Hc=H0s.createElement(H0U);HO[H28].appendChild(Hc);var H6=H3K(Hc);H1H[H6]=[];H1q[H6]=[];return H6;}
elem_count=function(){var H5b=0;for(var i=0;i<HO.length;i++){if(HO[i]){H5b++;}}
return H5b;}
H3K=function(Hc){var H6;if(H1I.length>0){var H54=H1I[0];H1I.splice(0,1);HO[H54]=Hc;H6=H54;}
else{HO.push(Hc);H6=HO.length-1;}
return H6;}
styl_get=function(H6,Hd){return prop_get(H6,Hd);}
var H29="prop_get = function(H6,Hd,H2I){var HP = H1q[H6];if((HP[Hd]===undefined)||(H2I!==undefined)){";H29+="if((Hd == 'opacity') && (H2I != -1)) {var H2J = prop_get_opacity(H6);} else {";if(!is_ie){H29+="var H2J = H0s.defaultView.getComputedStyle(HO[H6],null).getPropertyValue(Hd);";}else{H29+="var H6E = Hd.replace(/((-)([a-z])(\\w))/g,function($0,$1,$2,$3,$4){return $3.toUpperCase()+$4});var H2J = HO[H6].currentStyle[H6E];";}
H29+="}HP[Hd]=H2J;}return HP[Hd];}";onloader(H29);styl_set=function(H6,Hd,H3){try{prop_set(H6,Hd,H3);return true;}
catch(e){return false;}}
prop_set=function(H6,Hd,H3,H2I){var HP=H1q[H6];var H6z=HP[Hd]!=H3;if(H6z){HP[Hd]=H3;if(H2I){if(Hd=='opacity'){prop_set_opacity(H6,H3);}
else{try{is_ie?(HO[H6].style.setAttribute(Hd.replace(/((-)([a-z])(\w))/g,function($0,$1,$2,$3,$4){return $3.toUpperCase()+$4}),HP[Hd])):(HO[H6].style.setProperty(Hd,HP[Hd],''));}
catch(e){HO[H6].cssText+=';'+Hd+': '+HP[Hd]+';';}}}else{var H6A=H2H;var H2K=H1H[H6];H2K.push(Hd);if(!H3I[H6]){H6A.push(H6);H3I[H6]=true;}}}}
var H0N="var H6B=function(H6){var H2K=H1H[H6];var HP=H1q[H6];var Hc=HO[H6];if(!Hc){return}var H3M=Hc.style;var H6C=H2K.length;"
if(prop_do_csstext){H0N+="var H55=[];"}
H0N+="for(var H56=0;H56<H6C;H56++){var Hd=H2K.shift();";if(prop_do_csstext){H0N+="H55.push(Hd+':'+HP[Hd]);}H3M.cssText += ';'+H55.join(';')+';';";}else{H0N+="if(Hd == 'opacity') { H2J = prop_set_opacity(H6, HP[Hd]); } else {";if(is_ie){H0N+="H3M.setAttribute(Hd.replace(/((-)([a-z])(\\w))/g,function($0,$1,$2,$3,$4){return $3.toUpperCase()+$4}),HP[Hd]);}";}
else{H0N+="H3M.setProperty(Hd,HP[Hd],'');}";}
H0N+="}";}
H0N+="}";eval(H0N);var H57='prop_loop_start(H12)';var H58=1;var H3N=1;var prop_loop_start=function(H12){clearTimeout(H2G);if(H3J){H12*=2;H2G=setTimeout(H57,H12);return;}else{H12=parseInt(frameskips*(H3N/H58),10);if(H12<40){H12=40;}
H3J=true;H2G=setTimeout(H57,H12);}
H3N-=now();var H6D=H2H.length;for(var i=0;i<H6D;i++){var H6=H2H.shift();H3I[H6]=false;H6B(H6);}
H58++;H3N+=now();H3J=false;return;}
var prop_loop_stop=function(){clearTimeout(H2G);}
var now=function(){return new Date().getTime();}
var prop_get_opacity=function(H6){var H0n;var H59=prop_get(H6,'opacity',-1);if(H0n=H59||(H59==0)){return parseFloat(H0n);}
if(H0n=(HO[H6].currentStyle['filter']||'').match(/alpha\(opacity=(.*)\)/)){if(H0n[1]){return parseFloat(H0n[1])/100;}}
return 1.0;}
var prop_set_opacity=function(H6,H3){if(H3==1&&is_ie){HO[H6].style.setAttribute('filter',prop_get(H6,'filter',true).replace(/alpha\([^\)]*\)/gi,''));}else{if(H3<0.00001)H3=0;if(is_ie){HO[H6].style.setAttribute('filter',prop_get(H6,'filter',true).replace(/alpha\([^\)]*\)/gi,'')+'alpha(opacity='+H3*100+')');}
else{HO[H6].style.setProperty('opacity',H3,'');}}}
var prop_get_extra_width=function(H6){var Hf=prop_get_int_value(H6,'padding-left')+
prop_get_int_value(H6,'padding-right')+
prop_get_int_value(H6,'border-left-width')+
prop_get_int_value(H6,'border-right-width');return Hf;}
var prop_get_extra_height=function(H6){var HM=prop_get_int_value(H6,'padding-top')+
prop_get_int_value(H6,'padding-bottom')+
prop_get_int_value(H6,'border-top-width')+
prop_get_int_value(H6,'border-bottom-width');return HM;}
var prop_get_int_value=function(H6,H5a){var H3O=parseInt(prop_get(H6,H5a,true),10);if(isNaN(H3O)){H3O=0;}
return H3O;}
onloader('elem_add(document.body);');onloader('prop_loop_start();');