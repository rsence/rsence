/***
  ** Himle Client -- http://himle.org/
  **
  ** Copyright (C) 2008 Juha-Jarmo Heinonen
  **
  ** This file is part of Himle Client.
  **
  ** Himle Client is free software: you can redistribute it and/or modify
  ** it under the terms of the GNU General Public License as published by
  ** the Free Software Foundation, either version 3 of the License, or
  ** (at your option) any later version.
  **
  ** Himle Client is distributed in the hope that it will be useful,
  ** but WITHOUT ANY WARRANTY; without even the implied warranty of
  ** MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  ** GNU General Public License for more details.
  **
  ** You should have received a copy of the GNU General Public License
  ** along with this program.  If not, see <http://www.gnu.org/licenses/>.
  **
  ***/

HTabView = HView.extend({
  tabIndex: 0,
  flexRight: true,
  flexRightOffset: 0,
  flexBottom: true,
  flexBottomOffset: 0,
  /*setLabel: function(_label){
    this.parent.setLabel(_label);
    this.base(_label);
  },
  setValue: function(_value){
    this.parent.setValue(_value);
    this.base(_value);
  },*/
  draw: function(){
    var _isDrawn = this.drawn;
    this.base();
    if(!_isDrawn){
      var i=0,_styles = [
        ['overflow','auto']
      ];
      for(i;i<_styles.length;i++){
        this.setStyle(_styles[i][0],_styles[i][1]);
      }
      this.hide();
    }
  }
});

HTab = HControl.extend({
  componentName: "tab",
  refreshOnValueChange: false,
  refreshOnLabelChange: false,
  constructor: function(_rect,_parent,_options){
    this.componentBehaviour.push('tab');
    this.tabInit();
    if(this.isinherited) {
      this.base(_rect, _parent, _options);
    }
    else {
      this.isinherited = true;
      this.base(_rect, _parent, _options);
      this.isinherited = false;
    }
    this.type = '[HTab]';
    this.setMouseDown(true);
    if(!this.isinherited) {
      this.draw();
    }
  },
  setValue: function(_value){
    this.base(_value);
    if(typeof _value == 'number'){
      var _index = parseInt(_value,10);
      if(_index<this.tabs.length){
        if(_index!=this.selectIdx){
          this.selectTab(_index);
        }
      }
    }
  },
  stringWidth: function(_string,_elemId){
    var _html = '<span style="'+this.fontStyle+'">'+_string+'</span>',
        _width = this.base( _html, null, _elemId );
    return _width;
  }, 
  tabInit: function(){
    this.tabs = [];
    this.tabLabels = [];
    this.tabLabelBounds = [];
    this.tabLabelStrings = [];
    this.rightmostPx = 0;
    this.selectIdx = -1;
    this.tabLabelHeight    = 20; // overridden in the template
    this.tabLabelLeftEdge  = 4;  // overridden in the template
    this.tabLabelRightEdge = 4;  // overridden in the template
    this.fontStyle = 'font-family:Trebuchet MS,Arial,sans-serif;font-size:13px;'; // overridden in the template
    this.tabLabelHTMLPrefix1 = '<div class="edge-left"></div><div class="tablabel" style="width:';
    this.tabLabelHTMLPrefix2 = 'px">';
    this.tabLabelHTMLSuffix = '</div><div class="edge-right"></div>';
    this.tabLabelParentElem = 'label';
    this.tabLabelElementTagName = 'div';
    this.tabLabelAlign = 'left';
    this.tabTriggerLink = false;
    this.tabLabelNoHTMLPrefix = false;
  },
  setLabel: function(_label){
    this.label = _label;
  },
  selectTab: function(_tabIdx){
    if(_tabIdx instanceof HTabView){
      _tabIdx = _tabIdx.tabIndex;
    }
    if(this.selectIdx!=-1){
      var _tabSelectElemId = this.tabLabels[this.selectIdx],
          _tabSelectViewId = this.tabs[this.selectIdx];
      ELEM.removeClassName(_tabSelectElemId,'item-fg');
      ELEM.addClassName(_tabSelectElemId,'item-bg');
      HSystem.views[_tabSelectViewId].hide();
    }
    if(_tabIdx!=-1){
      var _tabLabelElemId = this.tabLabels[_tabIdx],
          _tabViewId = this.tabs[_tabIdx];
      ELEM.removeClassName(_tabLabelElemId,'item-bg');
      ELEM.addClassName(_tabLabelElemId,'item-fg');
      HSystem.views[_tabViewId].show();
    }
    this.selectIdx = _tabIdx;
    this.setValue(_tabIdx);
  },
  addTab: function(_tabLabel,_doSelect){
    var _tabIdx=this.tabs.length,_tabLabelHTML='',
        _labelTextWidth=this.stringWidth(_tabLabel,0),
        _labelWidth=_labelTextWidth+this.tabLabelLeftEdge+this.tabLabelRightEdge,
        _tab = new HTabView(new HRect(0,this.tabLabelHeight,this.rect.width,this.rect.height),this),
        _tabIdx = this.tabs.length,
        _tabLabelElemId = ELEM.make(this.markupElemIds[this.tabLabelParentElem],this.tabLabelElementTagName);
    if(this.tabLabelNoHTMLPrefix){
      _tabLabelHTML = _tabLabel;
    }
    else {
      _tabLabelHTML = this.tabLabelHTMLPrefix1+_labelTextWidth+this.tabLabelHTMLPrefix2+_tabLabel+this.tabLabelHTMLSuffix;
    }
    _tab.hide();
    ELEM.addClassName(_tabLabelElemId,'item-bg');
    ELEM.setStyle(_tabLabelElemId,'width',_labelWidth+'px');
    ELEM.setStyle(_tabLabelElemId,this.tabLabelAlign,this.rightmostPx+'px');
    ELEM.setHTML(_tabLabelElemId,_tabLabelHTML);
    this.tabLabelStrings.push(_tabLabel);
    if(this.tabTriggerLink&&this.tabLabelElementTagName=='a'){
      ELEM.setAttr(_tabLabelElemId,'href','javascript:HSystem.views['+this.viewId+'].selectTab('+_tabIdx+');');
    }
    else if (this.tabTriggerLink){
      ELEM.setAttr(_tabLabelElemId,'mouseup','HSystem.views['+this.viewId+'].selectTab('+_tabIdx+');');
    }
    else {
      this.tabLabelBounds.push([this.rightmostPx,this.rightmostPx+_labelWidth]);
    }
    this.rightmostPx+=_labelWidth;
    if(this.tabLabelAlign == 'right'){
      ELEM.setStyle(this.markupElemIds[this.tabLabelParentElem],'width',this.rightmostPx+'px');
    }
    this.tabs.push(_tab.viewId);
    this.tabLabels.push(_tabLabelElemId);
    _tab.tabIndex = _tabIdx;
    if(_doSelect){
      this.selectTab(_tabIdx);
    }
    return _tab;
  },
  mouseDown: function(_x,_y){
    if(this.tabTriggerLink){
      this.setMouseDown(false);
      return;
    }
    _x -= this.pageX();
    _y -= this.pageY();
    if(_x<=this.rightmostPx){
      if(_y<=this.tabLabelHeight){
        var i=0,_labelBounds;
        for(i;i<this.tabLabelBounds.length;i++){
          _labelBounds = this.tabLabelBounds[i];
          if(_x<_labelBounds[1] && _x>=_labelBounds[0]){
            this.selectTab(i);
            return;
          }
        }
      }
    }
  },
  removeTab: function(_tabIdx){
    var _selIdx = this.selectIdx,
        _tabViewId = this.tabs[_tabIdx],
        _tabLabelElemId = this.tabViews[_tabIdx];
    this.tabs.splice(_tabIdx,1);
    this.tabLabels.splice(_tabIdx,1);
    this.tabLabelBounds.splice(_tabIdx,1);
    this.tabLabelStrings.splice(_tabIdx,1);
    if(_tabIdx==_selIdx){
      this.selectIdx=-1;
      if(_tabIdx==0&&this.tabs.length==0){
        this.selectTab(-1);
      }
      else if(_tabIdx==(this.tabs.length-1)){
        this.selectTab(_tabIdx-1);
      }
      else{
        this.selectTab(_tabIdx);
      }
    }
    else if(_tabIdx<_selIdx){
      this.selectIdx--;
    }
    ELEM.del(_tabLabelElemId);
    HSystem.views[_tabViewId].die();
  },
  draw: function(){
    var _isDrawn = this.drawn;
    this.base();
    if(!_isDrawn){
      this.drawMarkup();
    }
    this.refresh();
  }
});




