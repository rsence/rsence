
HTabBar=HView.extend({packageName:"tab",componentName:"tabbar",constructor:function(_1,_7){if(this.isinherited){this.base(_1,_7);}
else{this.isinherited=true;this.base(_1,_7);this.isinherited=false;}
this.type='[HTabBar]';this.preserveTheme=true;if(!this.isinherited){this.draw();}},draw:function(){if(!this.drawn){this.drawRect();this.drawMarkup();this.drawn=true;}
this.drawRect();}});HTabLabel=HButton.extend({packageName:"tab",componentName:"tablabel",constructor:function(_F,_p,_7,_2){if(!_2){var _2={};}
if(!_2.label){throw("HTabLabelConstructionError: No label specified!");}
if(null===_2.tabId||undefined===_2.tabId){throw("HTabLabelConstructionError: No id specified!");}
if(!_2.tabControl){throw("HTabLabelConstructionError: No control specified!");}
if(!_2.highlight){_2.highlight=false;}
if(!_2.events){_2.events={mouseDown:true};}
var _1=new HRect(_F,0,_F+5,_p);if(this.isinherited){this.base(_1,_7,_2);}
else{this.isinherited=true;this.base(_1,_7,_2);this.isinherited=false;}
this.type='[HTabLabel]';this._5U="tabhighlight";this.tabControl=_2.tabControl;this.tabId=_2.tabId;this.setHighlight(_2.highlight);if(!this.isinherited){this.draw();}},setHighlight:function(_5){this.highlight=_5;if(_5){this.tabControl.selectTab(this.tabId);}
this.refresh();},mouseDown:function(_8,_a,_6a){if(this.tabControl&&!this.highlight){this.setHighlight(true);}},setValue:function(_4){this.base(_4);if(this.value&&this.tabControl){this.tabControl.selectTab(this.tabId);}},refresh:function(){if(this.drawn){if(this.markupElemIds['label']){var _2B=this.stringWidth(this.label,null,this.markupElemIds['label']);this.rect.setWidth(_2B+16);}
this.base();if(!this._1n){this._1n=this.bindDomElement(this._5U+this.elemId);}
if(this._1n){var _3M=(prop_get(this._1n,'visibility')=='hidden');if(_3M&&this.highlight){prop_set(this._1n,'visibility','',true);}
else if(!_3M&&!this.highlight){prop_set(this._1n,'visibility','hidden',true);}}}}});HTabView=HView.extend({packageName:"tab",componentName:"tabview",constructor:function(_1,_7,_2){if(!_2){_2={};}
if(this.isinherited){this.base(_1,_7,_2);}
else{this.isinherited=true;this.base(_1,_7,_2);this.isinherited=false;}
this.type='[HTabView]';this.preserveTheme=true;if(!this.isinherited){this.draw();}},draw:function(){if(!this.drawn){this.drawMarkup();var _0R=this.bindDomElement(HTabView._1B+this.elemId);if(!_0R){throw("HTabView: The HTML template must have an element with "+"the ID '"+HTabView._1B+" + this.elemId'.");}
elem_append(this.parent.elemId,_0R);elem_append(0,this.elemId);elem_del(this.elemId);elem_replace(this.elemId,elem_get(_0R));}
this.drawRect();}},{_1B:"tabview"});HTabControl=HControl.extend({packageName:"tab",componentName:"tabcontrol",constructor:function(_1,_7,_2){if(this.isinherited){this.base(_1,_7,_2);}
else{this.isinherited=true;this.base(_1,_7,_2);this.isinherited=false;}
this.tabDefaults=new(Base.extend({label:'Untitled',labelHeight:21,labelWidth:192}).extend(_2));this.type='[HTabControl]';this.preserveTheme=true;this.tabs={};this._M=[];this._5o=true;if(!this.isinherited){this.draw();}},draw:function(){if(!this.drawn){var _1=this.rect;var _5f=new HRect(0,0,_1.width,this.tabDefaults.labelHeight);this.labelViews=new HTabBar(_5f,this);this.labelViews.draw();this._0c=0;var _5Z=0;var _62=this.tabDefaults.labelHeight;var _60=_1.width;var _61=(_1.height-this.tabDefaults.labelHeight);var _36=new HRect(_5Z,_62,_60,_61);this.tabDefaults.rect=new HRect(0,0,_36.width,_36.height);this.tabViews=new HView(_36,this);this.tabViews.draw();this.activeTab=-1;this.drawn=true;}
this.drawRect();},addTab:function(_0y,_2U,_u,_2B){if(this._5o){this.draw();}
if(!_0y){var _5R=this.tabDefaults.rect;_0y=new HTabView(_5R,this.tabViews);_0y.draw();}
if(!_u){var _u=this.tabDefaults.label;}
_0y.hide();if(this._M.length==0){_2U=true;}
var _0Q=_0y.viewId;this.tabs[_0Q]=_0y;this._M.push(_0Q);var _5Q={label:_u,tabId:_0Q,tabControl:this,highlight:false};var _30=new HTabLabel(this._0c,this.tabDefaults.labelHeight,this.labelViews,_5Q);this._0c+=(_30.rect.width-1);var _4q=_30.viewId;_30.draw();if(_4q!=_0Q){throw("HTabControlAddTabError: tabId Mismatch ("+_4q+" vs. "+
_0Q+")");}
if(_2U){this.selectTab(_0Q);}
this.refresh();return _0Q;},_5D:function(){if(this._M.length==0){this._0c=0;}
var _1p=0;for(var i=0;i<this._M.length;i++){var _u=this.labelViews.views[this._M[i]];this._0c=_1p+_u.rect.width;var _4r=new HRect(_1p,_u.rect.top,this._0c,_u.rect.bottom);this.labelViews.views[this._M[i]].setRect(_4r);this._0c--;_1p=this._0c;}},removeTab:function(_03){if(this.tabs[_03]instanceof HTabView){if(this.activeTab==_03){if(!this.selectPreviousTab()){if(!this.selectNextTab()){this.activeTab=-1;}}}
this.tabViews.destroyView(_03);this.labelViews.destroyView(_03);this.tabs[_03]=null;var _0P=this._M.indexOf(_03);this._M.splice(_0P,1);this._5D();}},removeSelectedTab:function(){this.removeTab(this.activeTab);},selectNextTab:function(){var _0P=this._M.indexOf(this.activeTab);if(_0P<this._M.length-1){return this.selectTab(this._M[_0P+1]);}
return false;},selectPreviousTab:function(){var _0P=this._M.indexOf(this.activeTab);if(_0P>0){return this.selectTab(this._M[_0P-1]);}
return false;},selectTab:function(_03){if(this.activeTab!=_03){var _0P=this._M.indexOf(_03);if(_0P>-1){if(this.activeTab!=-1){this.tabViews.views[this.activeTab].setStyle('display','none');this.tabViews.views[this.activeTab].hide();this.labelViews.views[this.activeTab].setHighlight(false);}
this.activeTab=_03;this.tabViews.views[this.activeTab].setStyle('display','block');this.tabViews.views[this.activeTab].show();this.labelViews.views[this.activeTab].setHighlight(true);return true;}}
return false;},numberOfTabs:function(){return this._M.length;}});HTab=HTabControl;