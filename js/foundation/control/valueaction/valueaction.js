
var
HValueAction = HClass.extend({
  constructor: function( _rect, _parent, _options ){
    if( _rect && _rect.hasAncestor && _rect.hasAncestor( HClass ) ){
      _options = _parent;
      _parent = _rect;
    }
    else {
      console.warn && console.warn( "Warning: the rect constructor argument of HValueAction is deprecated:",_rect );
    }
    this.parent = _parent;
    this.options = _options;
    if( _options.value ){
      this.value = _options.value;
    }
    if( _options.bind ){
      var _valueObj = _options.bind;
      if( typeof _valueObj == 'string' ){
        _valueObj = HVM.values[ _valueObj ];
      }
      _valueObj.bind( this );
    }
    else if( _options.valueObj ){
      _options.valueObj.bind( this );
    }
    if( this.parent.addView instanceof Function ){
      this.viewId = this.parent.addView( this );
    }
    this.refresh();
  },
  remove: function(){
    if( this.parent ) {
      var _viewZIdx = this.parent.viewsZOrder.indexOf(this.viewId),
          _viewPIdx = this.parent.views.indexOf(this.viewId);
      this.parent.views.splice(_viewPIdx,1);
      HSystem.delView(this.viewId);
      this.parent.viewsZOrder.splice( _viewZIdx, 1 );
      var _sysUpdateZIndexOfChildrenBufferIndex = HSystem._updateZIndexOfChildrenBuffer.indexOf( this.viewId );
      if(~_sysUpdateZIndexOfChildrenBufferIndex){
        HSystem._updateZIndexOfChildrenBuffer.splice( _sysUpdateZIndexOfChildrenBufferIndex, 1 );
      }
      this.parent  = null;
      this.parents = [];
    }
    return this;
  },
  die: function(){
    this.parent.removeView( this.viewId );
    if( this.valueObj ){
      this.valueObj.release( this );
    }
    this.value = null;
    this.viewId = null;
  },
  refresh: function(){
    if( this.options.refreshAction || this.options.action ){
      var
      _refreshAction = this.options.refreshAction ? this.options.refreshAction : this.options.action;
      if( this.parent ){
        if( this.parent[_refreshAction] ){
          if( (this.parent[_refreshAction] instanceof Function) ){
            this.parent[_refreshAction]( this.value );
          }
          else {
            this.parent[_refreshAction] = this.value;
          }
        }
      }
    }
  },
  onIdle: function(){
    
  }
});

HValueAction.implement( HValueResponder );
