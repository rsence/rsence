
HTabView = HControl.extend({
  tabIndex: 0,
  flexRight: true,
  flexRightOffset: 0,
  flexBottom: true,
  flexBottomOffset: 0,
  setLabel: function(_label){
    this.parent.setLabel(_label);
    this.base(_label);
  },
  setValue: function(_value){
    this.parent.setValue(_value);
    this.base(_value);
  },
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
  constructor: function(_rect,_parent,_options){
    if(this.isinherited) {
      this.base(_rect, _parent, _options);
    }
    else {
      this.isinherited = true;
      this.base(_rect, _parent, _options);
      this.isinherited = false;
    }
    this.type = '[HTab]';
    this.tabInit();
    this.setMouseDown(true);
    if(!this.isinherited) {
      this.draw();
    }
  },
  stringWidth: function(_string,_elemId){
    var _html = '<span style="'+this.fontStyle+'">'+_string+'</span>',
        _width = this.base( _html,null, _elemId );
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
  },
  addTab: function(_tabLabel,_doSelect){
    var _tabIdx=this.tabs.length,
        _labelWidth=this.stringWidth(_tabLabel,0)+this.tabLabelLeftEdge+this.tabLabelRightEdge,
        _tab = new HTabView(new HRect(0,this.tabLabelHeight,this.rect.width,this.rect.height),this),
        _tabIdx = this.tabs.length;
        _tabLabelElemId = ELEM.make(this.markupElemIds.label);
        _tabLabelHTML = '<div class="edge-left"></div><div class="tablabel">'+_tabLabel+'</div><div class="edge-right"></div>';
    ELEM.addClassName(_tabLabelElemId,'item-bg');
    ELEM.setStyle(_tabLabelElemId,'width',_labelWidth+'px');
    ELEM.setStyle(_tabLabelElemId,'left',this.rightmostPx+'px');
    ELEM.setHTML(_tabLabelElemId,_tabLabelHTML);
    this.tabLabelStrings.push(_tabLabel);
    this.tabLabelBounds.push([this.rightmostPx,this.rightmostPx+_labelWidth]);
    this.rightmostPx+=_labelWidth;
    this.tabs.push(_tab.viewId);
    this.tabLabels.push(_tabLabelElemId);
    _tab.tabIndex = _tabIdx;
    if(_doSelect){
      this.selectTab(_tabIdx);
    }
    return _tab;
  },
  mouseDown: function(_x,_y){
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
  }
});









HTabControl = HTab.extend({
  constructor: function(_rect,_parent,_options){
    console.log('Warning: HTabControl is deprecated, please use HTab instead.');
    this.base(_rect,_parent,_options);
  }
});


