
HTabBar=HView.extend({packageName:"tab",componentName:"tabbar",constructor:function(_2,_6){if(this.isinherited){this.base(_2,_6);}
else{this.isinherited=true;this.base(_2,_6);this.isinherited=false;}
this.type='[HTabBar]';this.preserveTheme=true;if(!this.isinherited){this.draw();}},draw:function(){if(!this.drawn){this.drawRect();this.drawMarkup();this.drawn=true;}
this.drawRect();}});HTabLabel=HButton.extend({packageName:"tab",componentName:"tablabel",constructor:function(_I,_r,_6,_3){if(!_3){var _3={};}
if(!_3.label){throw("HTabLabelConstructionError: No label specified!");}
if(null===_3.tabId||undefined===_3.tabId){throw("HTabLabelConstructionError: No id specified!");}
if(!_3.tabControl){throw("HTabLabelConstructionError: No control specified!");}
if(!_3.highlight){_3.highlight=false;}
if(!_3.events){_3.events={mouseDown:true};}
var _2=new HRect(_I,0,_I+5,_r);if(this.isinherited){this.base(_2,_6,_3);}
else{this.isinherited=true;this.base(_2,_6,_3);this.isinherited=false;}
this.type='[HTabLabel]';this._6R="tabhighlight";this.tabControl=_3.tabControl;this.tabId=_3.tabId;this.setHighlight(_3.highlight);if(!this.isinherited){this.draw();}},setHighlight:function(_7){this.highlight=_7;if(_7){this.tabControl.selectTab(this.tabId);}
this.refresh();},mouseDown:function(_5,_a,_7b){if(this.tabControl&&!this.highlight){this.setHighlight(true);}},setValue:function(_4){this.base(_4);if(this.value&&this.tabControl){this.tabControl.selectTab(this.tabId);}},refresh:function(){if(this.drawn){if(this.markupElemIds['label']){var _34=this.stringWidth(this.label,null,this.markupElemIds['label']);this.rect.setWidth(_34+16);}
this.base();if(!this._1F){this._1F=this.bindDomElement(this._6R+this.elemId);}
if(this._1F){var _4p=(prop_get(this._1F,'visibility')=='hidden');if(_4p&&this.highlight){prop_set(this._1F,'visibility','',true);}
else if(!_4p&&!this.highlight){prop_set(this._1F,'visibility','hidden',true);}}}}});HTabView=HView.extend({packageName:"tab",componentName:"tabview",constructor:function(_2,_6,_3){if(!_3){_3={};}
if(this.isinherited){this.base(_2,_6,_3);}
else{this.isinherited=true;this.base(_2,_6,_3);this.isinherited=false;}
this.type='[HTabView]';this.preserveTheme=true;if(!this.isinherited){this.draw();}},draw:function(){if(!this.drawn){this.drawMarkup();var _14=this.bindDomElement(HTabView._1U+this.elemId);if(!_14){throw("HTabView: The HTML template must have an element with "+"the ID '"+HTabView._1U+" + this.elemId'.");}
elem_append(this.parent.elemId,_14);elem_append(0,this.elemId);elem_del(this.elemId);elem_replace(this.elemId,elem_get(_14));}
this.drawRect();}},{_1U:"tabview"});HTabControl=HControl.extend({packageName:"tab",componentName:"tabcontrol",constructor:function(_2,_6,_3){if(this.isinherited){this.base(_2,_6,_3);}
else{this.isinherited=true;this.base(_2,_6,_3);this.isinherited=false;}
this.tabDefaults=new(Base.extend({label:'Untitled',labelHeight:21,labelWidth:192}).extend(_3));this.type='[HTabControl]';this.preserveTheme=true;this.tabs={};this._P=[];this._6i=true;if(!this.isinherited){this.draw();}},draw:function(){if(!this.drawn){var _2=this.rect;var _68=new HRect(0,0,_2.width,this.tabDefaults.labelHeight);this.labelViews=new HTabBar(_68,this);this.labelViews.draw();this._0g=0;var _6Y=0;var _71=this.tabDefaults.labelHeight;var _6Z=_2.width;var _70=(_2.height-this.tabDefaults.labelHeight);var _3A=new HRect(_6Y,_71,_6Z,_70);this.tabDefaults.rect=new HRect(0,0,_3A.width,_3A.height);this.tabViews=new HView(_3A,this);this.tabViews.draw();this.activeTab=-1;this.drawn=true;}
this.drawRect();},addTab:function(_0K,_3q,_w,_34){if(this._6i){this.draw();}
if(!_0K){var _6O=this.tabDefaults.rect;_0K=new HTabView(_6O,this.tabViews);_0K.draw();}
if(!_w){var _w=this.tabDefaults.label;}
_0K.hide();if(this._P.length==0){_3q=true;}
var _13=_0K.viewId;this.tabs[_13]=_0K;this._P.push(_13);var _6N={label:_w,tabId:_13,tabControl:this,highlight:false};var _3u=new HTabLabel(this._0g,this.tabDefaults.labelHeight,this.labelViews,_6N);this._0g+=(_3u.rect.width-1);var _58=_3u.viewId;_3u.draw();if(_58!=_13){throw("HTabControlAddTabError: tabId Mismatch ("+_58+" vs. "+
_13+")");}
if(_3q){this.selectTab(_13);}
this.refresh();return _13;},_6y:function(){if(this._P.length==0){this._0g=0;}
var _1H=0;for(var i=0;i<this._P.length;i++){var _w=this.labelViews.views[this._P[i]];this._0g=_1H+_w.rect.width;var _59=new HRect(_1H,_w.rect.top,this._0g,_w.rect.bottom);this.labelViews.views[this._P[i]].setRect(_59);this._0g--;_1H=this._0g;}},removeTab:function(_08){if(this.tabs[_08]instanceof HTabView){if(this.activeTab==_08){if(!this.selectPreviousTab()){if(!this.selectNextTab()){this.activeTab=-1;}}}
this.tabViews.destroyView(_08);this.labelViews.destroyView(_08);this.tabs[_08]=null;var _12=this._P.indexOf(_08);this._P.splice(_12,1);this._6y();}},removeSelectedTab:function(){this.removeTab(this.activeTab);},selectNextTab:function(){var _12=this._P.indexOf(this.activeTab);if(_12<this._P.length-1){return this.selectTab(this._P[_12+1]);}
return false;},selectPreviousTab:function(){var _12=this._P.indexOf(this.activeTab);if(_12>0){return this.selectTab(this._P[_12-1]);}
return false;},selectTab:function(_08){if(this.activeTab!=_08){var _12=this._P.indexOf(_08);if(_12>-1){if(this.activeTab!=-1){this.tabViews.views[this.activeTab].setStyle('display','none');this.tabViews.views[this.activeTab].hide();this.labelViews.views[this.activeTab].setHighlight(false);}
this.activeTab=_08;this.tabViews.views[this.activeTab].setStyle('display','block');this.tabViews.views[this.activeTab].show();this.labelViews.views[this.activeTab].setHighlight(true);return true;}}
return false;},numberOfTabs:function(){return this._P.length;}});HTab=HTabControl;