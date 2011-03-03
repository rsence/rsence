/*   RSence
 *   Copyright 2006 Riassence Inc.
 *   http://riassence.com/
 *
 *   You should have received a copy of the GNU General Public License along
 *   with this software package. If not, contact licensing@riassence.com
 */


/*** = Description
  ** Main container of global operations on +HView+ and
  ** +HApplication+ -derived classes.
  **
  ** HSystem is used to keep +HApplication+ and +HView+ instances
  ** globally managed. The managed classes themself calls +HSystem+ methods,
  ** so there is no real need to access +HSystem+ directly from user-level code.
  **
***/
var//RSence.Foundation
HSystem = {
  
/** When the focus behaviour is 1, clicking on any subview brings
  * the window to front, if attached to a HWindow instance.
  * If the behaviour is 0, only direct clicks on the HWindow controls
  * brings the window to front.
  *
  **/
  windowFocusMode: 1,
  
/** Singleton class; has no constructor **/
  // constructor: null,
  
/** An array of HApplication instances, index is the appId **/
  apps: [],
  
/** An array (in the same order as apps): holds priority values **/
  appPriorities: [],
  
/** An array (in the same order as apps): holds busy status **/
  busyApps: [],
  
/** This array holds free app id:s **/
  freeAppIds: [],
  
/** The default HSystem ticker interval. Unit is milliseconds. **/
  defaultInterval: 10,
  
/** The default HApplication priority. Unit is "On the n:th tick: poll". **/
  defaultPriority: 20,
  
/** The z-index of root-level +HView+ instances. All the array operations 
  * are done by the inner logic of +HApplication+ and +HView+ instances.
  **/
  viewsZOrder: [],
  
/** This is the internal "clock" counter. Gets updated on every tick. **/
  ticks: 0,
  
/** Time in milliseconds for the timeout of a poll to finish before
  * being classified as stuck and thus forcibly terminated.
  **/
  maxAppRunTime: 5000,
  
/** Calls applications, uses the prority as a prioritizer.
  **/
  scheduler: function(){
    
    // Loop through all applications:
    for( var _appId=0; _appId<this.apps.length; _appId++ ){
      // Check, if the application exists:
      if( this.apps[ _appId ] ){
        // Check, if the application is busy:
        if( !this.busyApps[ _appId ] ){
          // Check, if the tick count matches the priority of the app:
          if( (this.ticks % this.appPriorities[ _appId ]) === 0 ){
            // Set the app busy, the app itself should "unbusy" itself, when the idle call is done.
            // That happens in <HApplication._startIdle>
            
            // If the app is not busy, then make a idle call:
            if(HSystem.apps[_appId]){
              HSystem.apps[_appId]._startIdle();
            }
          }
        }
      }
    }
    
    if(this._updateZIndexOfChildrenBuffer.length!==0){
      this._flushUpdateZIndexOfChilden();
    }
    
  },
  
  _updateFlexibleRects: function(){
    var
    _view,
    i = 0;
    for( ; i < this.views.length; i++ ){
      _view = this.views[i];
      if(_view && (_view.flexRight || _view.flexBottom)){
        _view.rect._updateFlexibleDimensions();
      }
    }
  },
  
/** Calls the scheduler and then calls itself after a timeout to keep
  * the loop going on.
  **/
  ticker: function(){
    // Increment the tick counter:
    this.ticks++;
    this.scheduler();
    this._tickTimeout = setTimeout( function(){HSystem.ticker();},this.defaultInterval);
  },
  
  
/** = Description
  * Adds the structures needed for a new +HApplication+ instance.
  * 
  * Called from inside the +HApplication+ constructor.
  * Binds an app and gives it a unique id.
  *
  * = Parameters
  * +_app+::       The reference to the +HApplication+ instance object.
  * +_priority+::  The app priority.
  *
  * = Returns
  * The app id.
  *
  **/
  addApp: function(_app, _priority){
    var _appId;
    if(this.freeAppIds.length !== 0){
      _appId = this.freeAppIds.shift();
      this.apps[_appId] = _app;
    }
    else {
      this.apps.push(_app);
      _appId = this.apps.length-1;
    }
    
    // sets self as parent
    _app.parent  = this;
    _app.parents = [this];
    
    _app.appId = _appId;
    
    this.startApp(_appId, _priority);
    
    return _appId;
  },
  
/** = Description
  * Starts polling an app instance (and its components).
  *
  * = Parameters
  * +_appId+::      The unique id of the app.
  * +_priority+::   The app priority.
  *
  **/
  startApp: function(_appId,_priority){
    if(_priority===undefined){
      _priority = this.defaultInterval;
    }
    this.appPriorities[ _appId ] = _priority;
    this.busyApps[_appId] = false;
  },
  
/** = Description
  * Stops polling an app instance (and its components).
  *
  * = Parameters
  * +_appId+::   The id of the app.
  *
  **/
  stopApp: function(_appId){
    this.busyApps[_appId] = true;
  },
  
/** = Description
  * Changes the priority of the app. Calls +stopApp+ and +startApp+.
  *
  * = Parameters
  * +_appId+::     The id of the app.
  * +_priority+::  The app priority.
  *
  **/
  reniceApp: function(_appId,_priority){
    this.appPriorities[ _appId ] = _priority;
  },
  
/** = Description
  * Stops polling and deletes an app instance (and its components).
  *
  * = Parameters
  * +_appId+::    The unique id of the app.
  * +_forced+::   (Optional) The doesn't wait for the last poll to finish.
  *
  **/
  killApp: function(_appId, _forced){
    if( !_forced ){
      var _startedWaiting = new Date().getTime();
      while( this.busyApps[ _appId ] === true ) {
        /* Waiting for the app to finish its idle loop... */
        if (new Date().getTime() > _startedWaiting + this.maxAppRunTime) {
          break;
        }
      }
    }
    this.busyApps[_appId] = true;
    
    this.apps[ _appId ].destroyAllViews();
    this.apps[ _appId ] = null;
    
    this.freeAppIds.push( _appId );
  },
  
/** All +HView+ instances that are defined **/
  views: [],
  
/** List of free +viwes+ indexes **/
  _freeViewIds: [],
  
/** = Description
  * Adds a view and assigns it an id.
  *
  * = Parameters
  * +_view+::   The +HView+ instance.
  *
  * = Returns
  * The new view id.
  *
  **/
  addView: function(_view){
    var _newId;
    if(this._freeViewIds.length===0){
      _newId = this.views.length;
      this.views.push(_view);
    }
    else {
      _newId = this._freeViewIds.pop();
      this.views[_newId] = _view;
    }
    return _newId;
  },
  
/** = Description
  * Removes a view and recycles its id.
  *
  * = Parameters
  * +_viewId+::  The view id to delete.
  *
  **/
  delView: function(_viewId){
    this.views[_viewId] = null;
    this._freeViewIds.push(_viewId);
  },
  
/** The view id of the active window. 0 means none. **/
  activeWindowId: 0,
  
/** = Description
  * Focuses the window given and blurs the previous one.
  *
  * = Parameters
  * +_view+::   The +HView+ instance, this is almost always a
  *             +HWindow+ instance.
  *
  **/
  windowFocus: function(_view){
    if(!_view){
      this.activeWindowId=0;
      return;
    }
    var _activeWindowId = this.activeWindowId,
        _views = this.views,
        _viewId = _view.viewId;
    if(_views[_activeWindowId]){
      if (_views[_activeWindowId]["windowBlur"]) {
        _views[_activeWindowId].windowBlur();        
      }
    }
    this.activeWindowId=_viewId;
    _view.bringToFront();
    _view.windowFocus();
  },
  
/** optimization of zindex buffer, see +HView+ **/
  _updateZIndexOfChildrenBuffer: [],
  
/** Updates the z-indexes of the children of the given +_viewId+. **/
  updateZIndexOfChildren: function(_viewId) {
    if(this._updateZIndexOfChildrenBuffer.indexOf(_viewId)===-1){
      this._updateZIndexOfChildrenBuffer.push(_viewId);
    }
    if((_viewId !== undefined && _viewId !== null) && (this.views[_viewId].app === this.views[_viewId].parent)){
      (this._updateZIndexOfChildrenBuffer.indexOf(null)===-1) && this._updateZIndexOfChildrenBuffer.push(null);
    }
  },
  
/** Flushes the z-indexes. This is a fairly expensive operation,
  * thas's why the info is buffered.
  **/
  _flushUpdateZIndexOfChilden: function() {
    
    var
    
    j = 0, // buffer index
    
    // reference to the HSystem namespace
    _this = HSystem,
    
    // reference to the buffer
    _buffer = _this._updateZIndexOfChildrenBuffer,
    
    // the length of the buffer
    _bufLen = _buffer.length;
    
    // loop buffer length times to get the items
    for ( ; j < _bufLen; j++ ) {
      
      
      // get and remove view the view id from the z-index flush status buffer:
      var
      _viewId = _buffer.shift(),
      
      // reference to the view's z-index array or the system root-level views if _viewId is null
      _views = ((_viewId === null)?(_this.viewsZOrder):(_this.views[ _viewId ].viewsZOrder)),
      
      // the length of the view's z-index array
      _viewLen = _views.length,
      
      // reference to the setStyle method of the element manager
      _setStyl = ELEM.setStyle,
      
      // reference to HSystem.views (collection of all views, by index)
      _sysViews = _this.views,
      
      // assign variables for use inside the inner loop:
          
      // the viewId of the view to be updated
      _subViewId,
      
      // the view itself with the viewId above
      _view,
      
      // the elemId property, used as a [] -lookup in the loop
      _elemIdStr = 'elemId',
      
      // the css property name
      _zIdxStr = 'z-index',
      
      // the loop index
      i=0,
      
      // the element id of the view
      _elemId;
      
      // end of var declarations
      
      // loop through all subviews and update the indexes:
      for ( ; i < _viewLen; i++ ) {
        
        // get the viewId to be updated based on the z-index array
        _subViewId = _views[ i ];
        
        // reference to the view itself
        _view = _sysViews[ _subViewId ];
        
        // the element id of the view
        _elemId = _view[ _elemIdStr ];
        
        // do the element manager call itself to update the dom property
        _setStyl( _elemId, _zIdxStr, i );
      }
    }
  }
};
  
// });

// Starts the ticking, when the document is loaded:
LOAD(
  function(){
    HSystem.ticker();
  }
);
