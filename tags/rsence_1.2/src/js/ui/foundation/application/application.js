/*   Riassence Framework
 *   Copyright 2006 Riassence Inc.
 *   http://riassence.com/
 *
 *   You should have received a copy of the GNU General Public License along
 *   with this software package. If not, contact licensing@riassence.com
 */


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
HApplication = HClass.extend({
  
  componentBehaviour: ['app'],
  
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
    HSystem.views[_viewId].remove();
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
      HSystem.views[this.views[i]].die();
    }
  },
  
  
  /* Calls the idle method of each view. Don't extend this method. */
  _pollViews: function(){
    var i, _viewId, _view;
    for(i=0;i<this.views.length;i++){
      _viewId = this.views[i];
      _view = HSystem.views[_viewId];
      if((_view!==null)&&(_view['onIdle']!==undefined)){
        _view.onIdle();
      }
    }
  },
  
/** Gets called by +HSystem+. It makes +onIdle+ extensions more failure
  * resistant. Do not extend.
  **/
  _startIdle: function(){
    HSystem.busyApps[ this.appId ] = true;
    this.onIdle();
    this._pollViews();
    HSystem.busyApps[ this.appId ] = false;
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
  }
});

