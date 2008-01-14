
HTabLabel=HButton.extend({packageName:"tab",componentName:"tablabel",constructor:function(H0,H4,H1){if(!H1){var H1={};}
if(!H1.label){throw("HTabLabelConstructionError: No label specified!");}
if(null===H1.tabId||undefined===H1.tabId){throw("HTabLabelConstructionError: No id specified!");}
if(!H1.tabControl){throw("HTabLabelConstructionError: No control specified!");}
if(!H1.highlight){H1.highlight=false;}
if(!H1.events){H1.events={mouseDown:true};}
if(this.isinherited){this.base(H0,H4,H1);}
else{this.isinherited=true;this.base(H0,H4,H1);this.isinherited=false;}
this.type='[HTabLabel]';this._tmplHighlightPrefix="tabhighlight";this.tabControl=H1.tabControl;this.tabId=H1.tabId;this.setHighlight(H1.highlight);if(!this.isinherited){this.draw();}},setHighlight:function(Hh){this.highlight=Hh;if(Hh){this.tabControl.selectTab(this.tabId);}
this.refresh();},mouseDown:function(H8,H9,H6L){if(this.tabControl&&!this.highlight){this.setHighlight(true);}},setValue:function(H3){this.base(H3);if(this.value&&this.tabControl){this.tabControl.selectTab(this.tabId);}},refresh:function(){if(this.drawn){this.base();if(!this._highlightElementId){this._highlightElementId=this.bindDomElement(this._tmplHighlightPrefix+this.elemId);}
if(this._highlightElementId){var H4g=(prop_get(this._highlightElementId,'visibility')=='hidden');if(H4g&&this.highlight){prop_set(this._highlightElementId,'visibility','',true);}
else if(!H4g&&!this.highlight){prop_set(this._highlightElementId,'visibility','hidden',true);}}}}});HTabBar=HView.extend({packageName:"tab",componentName:"tabbar",constructor:function(H0,H4){if(this.isinherited){this.base(H0,H4);}
else{this.isinherited=true;this.base(H0,H4);this.isinherited=false;}
this.type='[HTabBar]';this.preserveTheme=true;if(!this.isinherited){this.draw();}},draw:function(){if(!this.drawn){this.drawRect();this.drawMarkup();this.drawn=true;}
this.drawRect();}});HTabView=HView.extend({packageName:"tab",componentName:"tabview",constructor:function(H0,H4,H1){if(!H1){H1={};}
if(this.isinherited){this.base(H0,H4,H1);}
else{this.isinherited=true;this.base(H0,H4,H1);this.isinherited=false;}
this.type='[HTabView]';this.preserveTheme=true;if(!this.isinherited){this.draw();}},draw:function(){if(!this.drawn){this.drawMarkup();var H1h=this.bindDomElement(HTabView.H0F+this.elemId);if(!H1h){throw("HTabView: The HTML template must have an element with "+"the ID '"+HTabView.H0F+" + this.elemId'.");}
elem_append(this.parent.elemId,H1h);elem_append(0,this.elemId);elem_del(this.elemId);elem_replace(this.elemId,elem_get(H1h));}
this.drawRect();}},{H0F:"tabview"});HTabControl=HControl.extend({packageName:"tab",componentName:"tabcontrol",constructor:function(H0,H4,H1){if(this.isinherited){this.base(H0,H4,H1);}
else{this.isinherited=true;this.base(H0,H4,H1);this.isinherited=false;}
this.tabDefaults=new(Base.extend({label:'Untitled',labelHeight:21,labelWidth:192}).extend(H1));this.type='[HTabControl]';this.preserveTheme=true;this.tabs={};this.H04=[];this.H5T=true;if(!this.isinherited){this.draw();}},draw:function(){if(!this.drawn){var H0=this.rect;var H5U=new HRect(0,0,H0.width,this.tabDefaults.labelHeight);this.labelViews=new HTabBar(H5U,this);this.labelViews.draw();this.H0G=0;var H5V=0;var H5W=this.tabDefaults.labelHeight;var H5X=H0.width;var H5Y=(H0.height-this.tabDefaults.labelHeight);var H1A=new HRect(H5V,H5W,H5X,H5Y);this.tabDefaults.rect=new HRect(0,0,H1A.width,H1A.height);this.tabViews=new HView(H1A,this);this.tabViews.draw();this.activeTab=-1;this.drawn=true;}
this.drawRect();},addTab:function(H0Z,H3f,HB,H4h){if(this.H5T){this.draw();}
if(!H0Z){var H5Z=this.tabDefaults.rect;H0Z=new HTabView(H5Z,this.tabViews);H0Z.draw();}
if(!HB){var HB=this.tabDefaults.label;}
H0Z.hide();if(this.H04.length==0){H3f=true;}
var H1g=H0Z.viewId;this.tabs[H1g]=H0Z;this.H04.push(H1g);var H1X=this.H0G;this.H0G+=H4h;var H60=this.H0G;this.H0G--;var H3g=new HRect(H1X,0,H60,this.tabDefaults.labelHeight);var H5S={label:HB,tabId:H1g,tabControl:this,highlight:false};var H4i=new HTabLabel(H3g,this.labelViews,H5S);var H4j=H4i.viewId;H4i.draw();if(H4j!=H1g){throw("HTabControlAddTabError: tabId Mismatch ("+H4j+" vs. "+
H1g+")");}
if(H3f){this.selectTab(H1g);}
this.refresh();return H1g;},H61:function(){if(this.H04.length==0){this.H0G=0;}
var H1X=0;for(var i=0;i<this.H04.length;i++){var HB=this.labelViews.views[this.H04[i]];this.H0G=H1X+HB.rect.width;var H3g=new HRect(H1X,HB.rect.top,this.H0G,HB.rect.bottom);this.labelViews.views[this.H04[i]].setRect(H3g);this.H0G--;H1X=this.H0G;}},removeTab:function(H0l){if(this.tabs[H0l]instanceof HTabView){if(this.activeTab==H0l){if(!this.selectPreviousTab()){if(!this.selectNextTab()){this.activeTab=-1;}}}
this.tabViews.destroyView(H0l);this.labelViews.destroyView(H0l);this.tabs[H0l]=null;var H0H=this.H04.indexOf(H0l);this.H04.splice(H0H,1);this.H61();}},removeSelectedTab:function(){this.removeTab(this.activeTab);},selectNextTab:function(){var H0H=this.H04.indexOf(this.activeTab);if(H0H<this.H04.length-1){return this.selectTab(this.H04[H0H+1]);}
return false;},selectPreviousTab:function(){var H0H=this.H04.indexOf(this.activeTab);if(H0H>0){return this.selectTab(this.H04[H0H-1]);}
return false;},selectTab:function(H0l){if(this.activeTab!=H0l){var H0H=this.H04.indexOf(H0l);if(H0H>-1){if(this.activeTab!=-1){this.tabViews.views[this.activeTab].setStyle('display','none');this.tabViews.views[this.activeTab].hide();this.labelViews.views[this.activeTab].setHighlight(false);}
this.activeTab=H0l;this.tabViews.views[this.activeTab].setStyle('display','block');this.tabViews.views[this.activeTab].show();this.labelViews.views[this.activeTab].setHighlight(true);return true;}}
return false;},numberOfTabs:function(){return this.H04.length;}});HTab=HTabControl;