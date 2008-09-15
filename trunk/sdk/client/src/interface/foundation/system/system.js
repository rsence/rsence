/***  HIMLE RIA SYSTEM
  ** 
  **  Copyright (C) 2008 HIMLE GROUP http://himle.sorsacode.com/
  **  Copyright (C) 2006-2007 Helmi Technologies Inc.
  ** 
  **  This program is free software; you can redistribute it and/or modify it under the terms
  **  of the GNU General Public License as published by the Free Software Foundation;
  **  either version 2 of the License, or (at your option) any later version. 
  **  This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
  **  without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
  **  See the GNU General Public License for more details. 
  **  You should have received a copy of the GNU General Public License along with this program;
  **  if not, write to the Free Software Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA
  ***/


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
    if ((this.ticks % 10) == 0 && this.fix_ie) {
      //_traverseTree();
    }
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
    
    if(this.freeAppIds.length > 1024){
      var _appId = this.freeAppIds.shift();
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
    delete this.apps[ _appId ];
    this.apps[ _appId ] = null;
    
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
    var _activeWindowId = this.activeWindowId,
        _views = this.views,
        _viewId = _view.viewId;
    if(_activeWindowId != 0){
      _views[_activeWindowId].windowBlur();
    }
    this.activeWindowId=_viewId;
    _view.bringToFront();
    _view.windowFocus();
  }
  
});

// Starts the ticking:
LOAD('HSystem.ticker();');
