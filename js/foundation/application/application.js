
/*** = Description
  **
  ** Simple application template.
  **
  ** Depends on <HSystem>
  **
  ** HApplication instances are good namespaces to bind your client-side logic to.
  ** Feel free to extend HApplication to suit your needs. The primary default
  ** purpose is root-level component (<HView>) management and being the
  ** root controller for <onIdle> events.
  **
  ** = Instance members
  ** +views+::    A list of child component ids bound to it via +HView+ and +HSystem+
  ** +parent+::   Usually +HSystem+.
  ** +parents+::  An array containing parent instances. In this case, just +HSystem+.
  ** +isBusy+::   A flag that is true when the app is doing onIdle events or stopped.
  **
  ** = Usage
  ** Creates the +HApplication+ instance +myApp+, makes a +HWindow+ instance
  ** as its first view.
  **   var myApp = HApplication.nu(10,'Sample Application');
  **   HWindow.nu( [10,10,320,200], myApp, {label:'myWin'} );
  **
***/
var//RSence.Foundation
HApplication = HClass.extend({
  
  elemId: 0,
  
/** = Description
  *
  * = Parameters
  * All parameters are optional.
  *
  * +_priority+::   The priority, a number between 1 and Infinity. Smaller
  *                 number means higher priority, affects onIdle polling.
  *
  * +_label+::      A label for the application; for process managers.
  *
  **/
  constructor: function(_priority, _label){
    
    // Special null viewId for HApplication instances,
    // they share a system-level root view; the document object
    this.viewId = null;
    
    // storage for views
    this.views = [];
    
    // storage for dom element id's in view, not utilized in HApplication by default
    this.markupElemIds = [];
    
    // Views in Z order. The actual Z data is stored in HSystem, this is just a
    // reference to that array.
    this.viewsZOrder = HSystem.viewsZOrder;
    
    // Finalize initialization via HSystem
    HSystem.addApp(this,_priority);
    
    if(_label){
      this.label = _label;
    }
    else{
      this.label = 'ProcessID='+this.appId;
    }
  },
  
/** = Description
  * Used by addView to build a +self.parents+ array of parent classes.
  *
  * = Parameters
  * +_viewId+::   The target view's ID.
  **/
  buildParents: function(_viewId){
    var _view = HSystem.views[_viewId],
        i = 0;
    _view.parent = this;
    _view.parents = [];
    for(; i < this.parents.length; i++) {
      _view.parents.push(this.parents[i]);
    }
    _view.parents.push(this);
  },
  
/** = Description
  * Adds a view to the app, +HView+ defines an indentical structure for subviews.
  *
  * Called from inside the +HView+ constructor and should be automatic for all
  * components that accept the +_parent+ parameter, usually the second argument,
  * after the +HRect+ instance.
  *
  * = Parameters
  * +_view+::   Usually +this+ inside +HView+ -derived components.
  *
  * = Returns
  * The view ID.
  *
  **/
  addView: function(_view) {

    var _viewId = HSystem.addView(_view);
    this.views.push(_viewId);
    
    this.buildParents(_viewId);
    this.viewsZOrder.push(_viewId);
    
    return _viewId;
  },
  
/** = Description
  * Removes the view of the given +_viewId+.
  *
  * Call this if you need to remove a child view from its parent without
  * destroying its view, making it in effect a view without parent.
  * Useful, for example, for moving a view from one parent component to
  * another when dragging a component to a droppable container.
  *
  * = Parameters
  * +_viewId+::   The view ID.
  *
  **/
  removeView: function(_viewId){
    if( typeof _viewId === 'object' ){
      console.log('warning, viewId not a number:',_viewId,', trying to call its remove method directly..');
      _viewId.remove();
      return this;
    }
    var
    _view = HSystem.views[_viewId];
    if( _view ){
      if( _view['remove'] ){
        HSystem.views[_viewId].remove();
      }
      else {
        console.log('view does not have method "remove":',_view);
      }
    }
    else {
      console.log('tried to remove non-existent viewId:'+_viewId);
    }
  },

/** = Description
  * Removes and destructs the view of the given +_viewId+.
  *
  * Call this if you need to remove a child view from its parent, destroying
  * its child views recursively and removing all of the DOM elements too.
  *
  * = Parameters
  * +_viewId+::   The view ID.
  *
  **/
  destroyView: function(_viewId){
    HSystem.views[_viewId].die();
  },
  
/** = Description
  * The destructor of the +HApplication+ instance.
  *
  * Stops this application and destroys all its views recursively.
  *
  **/
  die: function(){
    HSystem.killApp(this.appId, false);
  },
  
  
/** = Description
  * Destructs all views but doesn't destroy the +HApplication+ instance.
  *
  * Destroys all the views added to this application but doesn't destroy the
  * application itself.
  *
  **/
  destroyAllViews: function(){
    for(var i = 0; i < this.views.length; i++) {
      try{
        HSystem.views[this.views[i]].die();
      }
      catch(e){
        console.log('unable to destroy:',this.views[i]);
      }
    }
  },
  
  renice: function(_priority){
    HSystem.reniceApp(this.appId,_priority);
  },
  
  /* Calls the idle method of each view. Don't extend this method. */
  _pollViews: function(){
    this._pollViewsRecurse( this.views );
  },
  _pollViewsRecurse: function( _views ){
    var i = 0, _viewId, _view, _pollViews = [];
    for( ; i < _views.length;i++){
      _viewId = _views[i];
      _view = HSystem.views[_viewId];
      if( _view !== undefined && _view !== null && typeof _view === 'object' ){
        if( _view['idle'] !== undefined && typeof _view['idle'] === 'function' ){
          _view.idle();
        }
        if( _view['onIdle'] !== undefined && typeof _view['onIdle'] === 'function' ){
          _view.onIdle();
        }
        if( _view['hasAncestor'] !== undefined && typeof _view.hasAncestor === 'function' && _view.hasAncestor( HView ) ) {
          if( _view.views && _view.views instanceof Array ){
            _pollViews.push( _view.views );
          }
        }
      }
    }
    while( _pollViews.length > 0 ){
      this._pollViewsRecurse( _pollViews.shift() );
    }
  },
  
/** Gets called by +HSystem+. It makes +onIdle+ extensions more failure
  * resistant. Do not extend.
  **/
  _startIdle: function(){
    var _this = this;
    HSystem.busyApps[ _this.appId ] = true;
    this._busyTimer = setTimeout(
      function(){
        _this.idle();
        _this.onIdle();
        _this._pollViews();
        HSystem.busyApps[ _this.appId ] = false;
      },
      10
    );
  },
  
/** = Description
  * The receiver of the +onIdle+ "poll event". The app priority defines the interval.
  *
  * Extend this method, if you are going to perform regular actions in a app.
  *
  * Intended for "slow infinite loops".
  *
  **/
  onIdle: function(){
    /* Your code here */
  },
  idle: function(){}
});
HApplication.implement(HValueResponder.nu());
