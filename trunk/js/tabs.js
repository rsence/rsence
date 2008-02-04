
HTabBar=HView.extend({packageName:"tab",componentName:"tabbar",constructor:function(_1,_6){if(this.isinherited){this.base(_1,_6);}
else{this.isinherited=true;this.base(_1,_6);this.isinherited=false;}
this.type='[HTabBar]';this.preserveTheme=true;if(!this.isinherited){this.draw();}},draw:function(){if(!this.drawn){this.drawRect();this.drawMarkup();this.drawn=true;}
this.drawRect();}});HTabLabel=HButton.extend({packageName:"tab",componentName:"tablabel",constructor:function(_H,_q,_6,_2){if(!_2){var _2={};}
if(!_2.label){throw("HTabLabelConstructionError: No label specified!");}
if(null===_2.tabId||undefined===_2.tabId){throw("HTabLabelConstructionError: No id specified!");}
if(!_2.tabControl){throw("HTabLabelConstructionError: No control specified!");}
if(!_2.highlight){_2.highlight=false;}
if(!_2.events){_2.events={mouseDown:true};}
var _1=new HRect(_H,0,_H+5,_q);if(this.isinherited){this.base(_1,_6,_2);}
else{this.isinherited=true;this.base(_1,_6,_2);this.isinherited=false;}
this.type='[HTabLabel]';this._6X="tabhighlight";this.tabControl=_2.tabControl;this.tabId=_2.tabId;this.setHighlight(_2.highlight);if(!this.isinherited){this.draw();}},setHighlight:function(_7){this.highlight=_7;if(_7){this.tabControl.selectTab(this.tabId);}
this.refresh();},mouseDown:function(_5,_a,_7f){if(this.tabControl&&!this.highlight){this.setHighlight(true);}},setValue:function(_4){this.base(_4);if(this.value&&this.tabControl){this.tabControl.selectTab(this.tabId);}},refresh:function(){if(this.drawn){if(this.markupElemIds['label']){var _38=this.stringWidth(this.label,null,this.markupElemIds['label']);this.rect.setWidth(_38+16);}
this.base();if(!this._1F){this._1F=this.bindDomElement(this._6X+this.elemId);}
if(this._1F){var _4t=(prop_get(this._1F,'visibility')=='hidden');if(_4t&&this.highlight){prop_set(this._1F,'visibility','',true);}
else if(!_4t&&!this.highlight){prop_set(this._1F,'visibility','hidden',true);}}}}});HTabView=HView.extend({packageName:"tab",componentName:"tabview",constructor:function(_1,_6,_2){if(!_2){_2={};}
if(this.isinherited){this.base(_1,_6,_2);}
else{this.isinherited=true;this.base(_1,_6,_2);this.isinherited=false;}
this.type='[HTabView]';this.preserveTheme=true;if(!this.isinherited){this.draw();}},draw:function(){if(!this.drawn){this.drawMarkup();var _11=this.bindDomElement(HTabView._1U+this.elemId);if(!_11){throw("HTabView: The HTML template must have an element with "+"the ID '"+HTabView._1U+" + this.elemId'.");}
elem_append(this.parent.elemId,_11);elem_append(0,this.elemId);elem_del(this.elemId);elem_replace(this.elemId,elem_get(_11));}
this.drawRect();}},{_1U:"tabview"});HTabControl=HControl.extend({packageName:"tab",componentName:"tabcontrol",constructor:function(_1,_6,_2){if(this.isinherited){this.base(_1,_6,_2);}
else{this.isinherited=true;this.base(_1,_6,_2);this.isinherited=false;}
this.tabDefaults=new(Base.extend({label:'Untitled',labelHeight:21,labelWidth:192}).extend(_2));this.type='[HTabControl]';this.preserveTheme=true;this.tabs={};this._R=[];this._6i=true;if(!this.isinherited){this.draw();}},draw:function(){if(!this.drawn){var _1=this.rect;var _68=new HRect(0,0,_1.width,this.tabDefaults.labelHeight);this.labelViews=new HTabBar(_68,this);this.labelViews.draw();this._0i=0;var _75=0;var _78=this.tabDefaults.labelHeight;var _76=_1.width;var _77=(_1.height-this.tabDefaults.labelHeight);var _3I=new HRect(_75,_78,_76,_77);this.tabDefaults.rect=new HRect(0,0,_3I.width,_3I.height);this.tabViews=new HView(_3I,this);this.tabViews.draw();this.activeTab=-1;this.drawn=true;}
this.drawRect();},addTab:function(_0H,_3v,_w,_38){if(this._6i){this.draw();}
if(!_0H){var _6U=this.tabDefaults.rect;_0H=new HTabView(_6U,this.tabViews);_0H.draw();}
if(!_w){var _w=this.tabDefaults.label;}
_0H.hide();if(this._R.length==0){_3v=true;}
var _10=_0H.viewId;this.tabs[_10]=_0H;this._R.push(_10);var _6T={label:_w,tabId:_10,tabControl:this,highlight:false};var _3C=new HTabLabel(this._0i,this.tabDefaults.labelHeight,this.labelViews,_6T);this._0i+=(_3C.rect.width-1);var _58=_3C.viewId;_3C.draw();if(_58!=_10){throw("HTabControlAddTabError: tabId Mismatch ("+_58+" vs. "+
_10+")");}
if(_3v){this.selectTab(_10);}
this.refresh();return _10;},_6E:function(){if(this._R.length==0){this._0i=0;}
var _1H=0;for(var i=0;i<this._R.length;i++){var _w=this.labelViews.views[this._R[i]];this._0i=_1H+_w.rect.width;var _59=new HRect(_1H,_w.rect.top,this._0i,_w.rect.bottom);this.labelViews.views[this._R[i]].setRect(_59);this._0i--;_1H=this._0i;}},removeTab:function(_09){if(this.tabs[_09]instanceof HTabView){if(this.activeTab==_09){if(!this.selectPreviousTab()){if(!this.selectNextTab()){this.activeTab=-1;}}}
this.tabViews.destroyView(_09);this.labelViews.destroyView(_09);this.tabs[_09]=null;var _0Z=this._R.indexOf(_09);this._R.splice(_0Z,1);this._6E();}},removeSelectedTab:function(){this.removeTab(this.activeTab);},selectNextTab:function(){var _0Z=this._R.indexOf(this.activeTab);if(_0Z<this._R.length-1){return this.selectTab(this._R[_0Z+1]);}
return false;},selectPreviousTab:function(){var _0Z=this._R.indexOf(this.activeTab);if(_0Z>0){return this.selectTab(this._R[_0Z-1]);}
return false;},selectTab:function(_09){if(this.activeTab!=_09){var _0Z=this._R.indexOf(_09);if(_0Z>-1){if(this.activeTab!=-1){this.tabViews.views[this.activeTab].setStyle('display','none');this.tabViews.views[this.activeTab].hide();this.labelViews.views[this.activeTab].setHighlight(false);}
this.activeTab=_09;this.tabViews.views[this.activeTab].setStyle('display','block');this.tabViews.views[this.activeTab].show();this.labelViews.views[this.activeTab].setHighlight(true);return true;}}
return false;},numberOfTabs:function(){return this._R.length;}});HTab=HTabControl;