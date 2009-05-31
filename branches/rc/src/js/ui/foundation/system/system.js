/**
  * Riassence Core -- http://rsence.org/
  *
  * Copyright (C) 2008 Juha-Jarmo Heinonen <jjh@riassence.com>
  * Copyright (C) 2006 Helmi Technologies Inc.
  *
  * This file is part of Riassence Core.
  *
  * Riassence Core is free software: you can redistribute it and/or modify
  * it under the terms of the GNU General Public License as published by
  * the Free Software Foundation, either version 3 of the License, or
  * (at your option) any later version.
  *
  * Riassence Core is distributed in the hope that it will be useful,
  * but WITHOUT ANY WARRANTY; without even the implied warranty of
  * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  * GNU General Public License for more details.
  *
  * You should have received a copy of the GNU General Public License
  * along with this program.  If not, see <http://www.gnu.org/licenses/>.
  *
  **/

/** class: HSystem
  *
  * *Simple application householding system.*
  * 
  * Designed as single instance.
  *
  * HSystem is used to keep <HApplication> instances in order.
  * HApplication itself calls HSystem, so there is no real need to access
  * HSystem itself besides its <HSystem.stopApp>, <HSystem.startApp>, 
  * <HSystem.reniceApp> and <HSystem.killApp> methods.
  *
  * HSystem works as the root of the component hierachy and currently offers
  * only <HApplication> management. Useful for implementing taskbars/docks etc.
  *
  * var: HDefaultApplicationInterval
  *  - Defines the default ms interval of polling.
  *  - Defaults to 100 (ms)
  *  - Change it before <Element Manager.onloader> is started.
  *  - Has no effect after the system is initialized.
  *
  * vars: Instance variables
  *  type - '[HSystem]'
  *  apps - A list of Applications running. 
  *  defaultInterval - The default application priority.
  *
  * See Also:
  *  <HApplication>
  *
  * Usage example:
  *  > var MyApp = new HApplication();
  *  > myAppId = MyApp.appId;
  *  > HSystem.reniceApp(myAppId, 10);
  *  > HSystem.killApp(myAppId);
  **/


HDefaultApplicationInterval=20;
HSystemTickerInterval=10;


/** global: HWindowFocusBehaviour
  *
  * When the focus behaviour is 1, clicking on any subview brings
  * the window to front, if attached to a HWindow instance.
  * If the behaviour is 0, only direct clicks on the HWindow controls
  * brings the window to front.
  *
  **/
HWindowFocusBehaviour = 1;


HSystem = HClass.extend({
  
  // Single instance; has no constructor
  constructor: null,
  
  type: '[HSystem]',
    
  // An array of HApplication instances, index is the appId
  apps: [],
  
  // An array (in the same order as apps): holds priority values
  appPriorities: [],
  
  // An array (in the same order as apps): holds busy statuses
  busyApps: [],
  
  // An array (in the same order as apps): holds Timeout values
  appTimers: [],
  
  // This array holds free app id:s
  freeAppIds: [],
  
  defaultInterval: HDefaultApplicationInterval,
  
  // The Z-order of applications. All the array handling is done by
  // HApplication and HView instances.
  viewsZOrder: [],
  
  // This is the internal "clock" counter. Gets updated on every process tick.
  ticks: 0,
  //fix_ie: false,
  
  // Time in milliseconds how long to wait for an application to finish before
  // terminating it when the application is killed.
  maxAppRunTime: 5000,
  
/*** method: scheduler
  **
  ** Calls applications, uses the divmod as a prioritizer.
  **
  ***/
  scheduler: function(){
    //if ((this.ticks % 10) == 0 && this.fix_ie) {
      //_traverseTree();
    //}
    
    // Loop through all applications:
    for( var _appId=0; _appId<this.apps.length; _appId++ ){
      // Check, if the application exists:
      if( this.apps[ _appId ] ){
        // Check, if the application is busy:
        if( !this.busyApps[ _appId ] ){
          // Check, if the tick count matches the priority of the app:
          if( (this.ticks % this.appPriorities[ _appId ]) == 0 ){
            // Set the app busy, the app itself should "unbusy" itself, when the idle call is done.
            // That happens in <HApplication._startIdle>
            
            // If the app is not busy, then make a idle call:
            this.appTimers[ _appId ] = setTimeout('if (HSystem.apps[' + _appId +
             ']) {HSystem.apps['+_appId+']._startIdle();}',10);
          }
        }
      }
    }
    
    if(this._updateZIndexOfChildrenBuffer.length!=0){
      this._flushUpdateZIndexOfChilden();
    }
    
  },
  
  
/*** method: ticker
  **
  ** Calls the scheduler and then calls itself.
  **
  ***/
  ticker: function(){
    // Increment the tick counter:
    this.ticks++;
    this.scheduler();
    this._tickTimeout = setTimeout('HSystem.ticker();',HSystemTickerInterval);
  },
  
  
/*** method: addApp
  **
  ** Called from inside the <HApplication> constructor.
  ** Binds an app and gives it a unique id.
  **
  ** Parameters:
  **  _app - Usually *this* inside the HApplication constructor, is the app namespace.
  **  _priority - The priority as the index interval of the ticker to poll the app and its components.
  **
  ** Returns:
  **  The application unique id.
  **
  ** See also:
  **  <HApplication>
  ***/
  addApp: function(_app, _priority){
    
    if(this.freeAppIds.length !== 0){
      var _appId = this.freeAppIds.unshift();
      this.apps[_appId] = _app;
    } else {
      this.apps.push(_app);
      var _appId = this.apps.length-1;
    }
    
    // sets self as parent
    _app.parent  = this;
    _app.parents = [this];
    
    _app.appId = _appId;
    
    this.startApp(_appId, _priority);
    
    return _appId;
  },
  
/*** method: startApp
  **
  ** Starts polling an app instance (and its components).
  **
  ** Parameters:
  **  _appId - The unique id of the app.
  **  _priority - The priority as the index interval of the ticker to poll the app and its components.
  **
  ** See also:
  **  <HApplication.start> <HSystem.stopApp> <HSystem.reniceApp>
  ***/
  startApp: function(_appId,_priority){
    if(_priority===undefined){
      _priority = this.defaultInterval;
    }
    this.appPriorities[ _appId ] = _priority;
    this.busyApps[_appId] = false;
  },
  
/*** method: stopApp
  **
  ** Stops polling an app instance (and its components).
  **
  ** Parameters:
  **  _appId - The unique id of the app.
  **
  ** See also:
  **  <HApplication.stop> <HSystem.startApp> <HSystem.reniceApp>
  ***/
  stopApp: function(_appId){
    this.busyApps[_appId] = true;
  },
  
/*** method: reniceApp
  **
  ** Changes the priority of the app. Calls <stopApp> and <startApp>.
  **
  ** Parameters:
  **  _appId - The unique id of the app.
  **  _priority - The priority as the index interval of the ticker to poll the app and its components.
  **
  ** See also:
  **  <HSystem.stopApp> <HSystem.startApp>
  ***/
  reniceApp: function(_appId,_priority){
    this.appPriorities[ _appId ] = _priority;
  },
  
/*** method: killApp
  **
  ** Stops polling and deletes an app instance (and its components).
  **
  ** Parameters:
  **  _appId - The unique id of the app.
  **
  ** See also:
  **  <HApplication.die> <HSystem.stopApp>
  ***/
  killApp: function(_appId, _forced){
    if( !_forced ){
      var _startedWaiting = new Date().getTime();
      while( this.busyApps[ _appId ] == true ) {
        /* Waiting for the app to finish its idle loop... */
        if (new Date().getTime() > _startedWaiting + this.maxAppRunTime) {
          break;
        }
      }
    }
    this.busyApps[_appId] = true;
    
    this.apps[ _appId ].destroyAllViews();
    this.apps[ _appId ] = null;
    delete this.apps[ _appId ];
    
    this.freeAppIds.push( _appId );
  },
  
  views: [],
  _freeViewIds: [],
  addView: function(_view){
    var _newId;
    if(this._freeViewIds.length==0){
      _newId = this.views.length;
      this.views.push(_view);
    }
    else {
      _newId = this._freeViewIds.pop();
      this.views[_newId] = _view;
    }
    return _newId;
  },
  delView: function(_viewId){
    this.views[_viewId] = null;
    this._freeViewIds.push(_viewId);
  },
  
  activeWindowId: 0,
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
  
  // optimization of zindex buffer, see HView
  _updateZIndexOfChildrenBuffer: [],
  updateZIndexOfChildren: function(_viewId) {
    if(this._updateZIndexOfChildrenBuffer.indexOf(_viewId)==-1){
      this._updateZIndexOfChildrenBuffer.push(_viewId);
    }
  },
  
  _flushUpdateZIndexOfChilden: function() {
    
    var j=0, // buffer index
        
        // reference to the HSystem namespace
        _this = HSystem,
        
        // reference to the buffer
        _buffer = this._updateZIndexOfChildrenBuffer,
        
        // the length of the buffer
        _bufLen = _buffer.length;
        
    // loop buffer length times to get the items
    for ( ; j < _bufLen; j++ ) {
      
      
      // get and remove view the view id from the z-index flush status buffer:
      var _viewId = _buffer.shift(),
          
          // reference to the view's z-index array or the system root-level views if _viewId is 0
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

  
});

// Starts the ticking:
LOAD('HSystem.ticker();');
