/*   RSence
 *   Copyright 2011 Riassence Inc.
 *   http://riassence.com/
 *
 *   You should have received a copy of the GNU General Public License along
 *   with this software package. If not, contact licensing@riassence.com
 */

var
HValueAction = HClass.extend({
  constructor: function( _rect, _parent, _options ){
    this.parent = _parent;
    this.options = _options;
    if( _options.value ){
      this.value = _options.value;
    }
    if( _options.valueObj ){
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
      if(_sysUpdateZIndexOfChildrenBufferIndex !== -1){
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

