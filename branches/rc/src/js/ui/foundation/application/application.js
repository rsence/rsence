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


/** class: HApplication
  *
  * *Simple application template.*
  *
  * Depends on <HSystem>
  *
  * HApplication instances are good namespaces to bind your client-side logic to.
  * Feel free to extend HApplication to suit your needs. The primary default
  * purpose is root-level component (<HView>) management and being the
  * root controller for <onIdle> events.
  *
  * vars: Instance variables
  *  type - '[HApplication]'
  *  views - A list of child components bound to it through <HView>
  *  parent - Usually <HSystem>
  *  parents - An array containing parents, usually just <HSystem>
  *  appId - The unique id of the app
  *  isBusy - A flag that is true when the app is doing <onIdle> events or stopped.
  *
  * See Also:
  *  <HSystem> <HView>
  *
  * Usage example:
  *  > var myApp = new HApplication(10);
  *  > var mySlider = new HSlider(new HRect(100,100,300,118),myApp,1.0,0.0,200.0);
  *  > mySlider.draw();
  *  > myApp.die();
  **/
HApplication = HClass.extend({
  componentBehaviour: ['app'],
/** constructor: constructor
  *
  * Parameter (optional):
  *  _priority - An integer value (in ms) used for <onIdle> polling events.
  **/
  constructor: function(_priority,_label){
    
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
  
/** method: buildParents
  *
  * Used by addView to build a parents array of parent classes.
  *
  **/
  buildParents: function(_viewId){
    var _view = HSystem.views[_viewId];
    _view.parent = this;
    _view.parents = [];
    for(var _parentNum = 0; _parentNum < this.parents.length; _parentNum++) {
      _view.parents.push(this.parents[_parentNum]);
    }
    _view.parents.push(this);
  },
  
/** method: addView
  *
  * Adds a view to the app, <HView> defines an indentical structure for subviews.
  *
  * Called from inside the HView constructor and should be automatic for all 
  * components that accept the 'parent' parameter, usually the second argument,
  * after the <HRect>.
  *
  * Parameter:
  *  _view - Usually *this* inside <HView>-derivate components.
  *
  * Returns:
  *  The parent view specific view id.
  *
  * See also:
  *  <HView.addView> <removeView> <destroyView> <die>
  **/
  addView: function(_view) {

    var _viewId = HSystem.addView(_view);
    this.views.push(_viewId);
    
    this.buildParents(_viewId);
    this.viewsZOrder.push(_viewId);
    
    return _viewId;
  },
  
/** method: removeView
  *
  * Call this if you need to remove a child view from its parent without
  * destroying its element, making it in effect a view without parent.
  * Useful, for example, for moving a view from one parent component to another.
  *
  * Parameters:
  *  _viewId - The parent-specific view id. Actually an array index.
  *
  * See also:
  *  <addView> <HView.addView> <destroyView> <die>
  **/
  removeView: function(_viewId){
    HSystem.views[_viewId].remove();
  },

/** method: destroyView
  *
  * Call this if you need to remove a child view from its parent, destroying its
  * child elements recursively and removing all DOM elements too.
  *
  * Parameters:
  *  _viewId - The parent-specific view id. Actually an array index.
  *
  * See also:
  *  <addView> <HView.addView> <removeView> <die>
  **/
  destroyView: function(_viewId){
    HSystem.views[_viewId].die();
  },
  
/** method: die
  *
  * Stops this application and destroys all the views currently in this
  * application.
  *
  * See also:
  *  <HSystem.killApp> <destroyView>
  **/
  die: function(){
    HSystem.killApp(this.appId, false);
  },
  
  
/** method: destroyAllViews
  *
  * Deletes all the views added to this application but doesn't stop the
  * application itself.
  *
  * See also:
  *  <addView> <HView.addView> <removeView> <destroyView> <die>
  **/
  destroyAllViews: function(){
    var i, _viewId;
    for (i = 0; i < this.views.length; i++) {
      _viewId = this.views[i];
      HSystem.views[_viewId].die();
    }
  },
  
  
  // calls the idle method of each view
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
  
/** method: startIdle
  *
  * Gets called by HSystem, is a separate method to make onIdle() extensions more failure resistant.
  * Do not override or change!
  *
  **/
  _startIdle: function(){
    HSystem.busyApps[ this.appId ] = true;
    this.onIdle();
    this._pollViews();
    HSystem.busyApps[ this.appId ] = false;
  },
  
/** event: onIdle
  *
  * Extend this method, if you are going to perform regular actions in a app.
  * Polled with the 'priority' interval timer given to <start>.
  *
  * *Very useful for 'slow, infinite loops' that don't take all the client browser machine CPU cycles.*
  *
  * See also:
  *  <start> <renice> <HSystem.reniceApp>
  **/
  onIdle: function(){
    /* Your code here */
  }
});

