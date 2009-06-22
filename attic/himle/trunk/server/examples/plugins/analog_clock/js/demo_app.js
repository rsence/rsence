/**
  * Himle Server -- http://himle.org/
  *
  * Copyright (C) 2008 Juha-Jarmo Heinonen
  *
  * This file is part of Himle Server.
  *
  * Himle Server is free software: you can redistribute it and/or modify
  * it under the terms of the GNU General Public License as published by
  * the Free Software Foundation, either version 3 of the License, or
  * (at your option) any later version.
  *
  * Himle server is distributed in the hope that it will be useful,
  * but WITHOUT ANY WARRANTY; without even the implied warranty of
  * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  * GNU General Public License for more details.
  *
  * You should have received a copy of the GNU General Public License
  * along with this program.  If not, see <http://www.gnu.org/licenses/>.
  *
  **/

/***
 ** ClockApp is a very simple application that
 ** initializes a few components.
 ** 
 ** An HApplication is the root of view structures,
 ** it's parent is 'document.body'.
 ##
 ** It also receives onIdle -events from HSystem,
 ** which is useful for low-priority background
 ** tasks, the event propagates down to all
 ** child-views and controls.
 **/
ClockApp = HApplication.extend({
  
  // Called, when new instances are created:
  constructor: function(width,   // clock width
                        height,  // clock height
                        clockBgImgUrl, // clock background image url
                        clockFgUrlId   // clock foreground image id
    ){
    
    // Calls the constructor of the superclass:
    this.base();
    
    // Coordinates of the view position
    var x = 100, y = 100;
    
    // HRect is the rectangle geometry definition and
    // helper class present in every view and control.
    //
    // _clockRect is used as the utility class copied
    // to other HRect:s, here we define it starting at
    // coordinate 0,0 and ending at coordinate
    // width,height. 
    var _clockRect = new HRect(0,0,width,height);
    
    // Here we make a copy of the _clockRect
    // for clockView.
    var _clockViewRect = new HRect(_clockRect);
    // We then move it (change its offset) to x,y:
    _clockViewRect.offsetTo(x,y);
    
    // Next, we specify the main view, we could
    // construct just as well any other HControl
    // just by changing the name of the class.
    //
    // HDynControl is a transparent rectangle that
    // is dynamically movable and resizable by
    // dragging and dropping.
    //
    // In this case, however we only want movability,
    // we disable resizability.
    //
    this.view = new HDynControl(
      
      // Rectangle geometry object instance.
      // Can be accessed as instance.rect
      _clockViewRect,
      
      // Structural parent instance (ClockApp):
      this,
      
      // The options block (everything else).
      // Specifying a blank block or omitting it
      // uses default options of the component.
      {
        // The label is a descriptive param
        // of all components except HView.
        // Its purpose is the visual label
        // of an component, but in this case
        // we'll specify a blank label.
        //
        // It can be changed later by
        // calling the setLabel -method.
        label: '',
        
        // Disabling resizability:
        noResize: true
        
      }
    );
    
    // HImageView is a component that
    // displays images specified as its
    // value. It's constructed just as
    // any other component, in this
    // case as the child view of the
    // HDynControl instance 'this.view'
    // initialized above.
    //
    // This HImageView displays the clock
    // background.
    this.clockBg = new HImageView(
      new HRect(_clockRect),
      this.view, {
        // Disabling components allow
        // their user-generated events
        // to be passed up to the parent
        // component.
        enabled: false,
        
        // The value of HImageViews is
        // the url of the image.
        //
        // It can be changed later by
        // calling the setValue -method.
        value:   clockBgImgUrl,
        
        // the label is empty, because we don't
        // want an 'Untitled' alt attribute
        label:   ''
        
      }
    );
    
    // Another HImageView for displaying
    // the clock arms.
    //
    // Here we aren't specifying an initial
    // value, because it's going to use a
    // server-syncronized HValue insance.
    this.clockFg = new HImageView(
      new HRect(_clockRect),
      this.view, {
        enabled: false,
        label:   ''
      }
    );
    
    // HVM is a shortcut for HValueManager.
    //
    // It stores HValue instances and syncronizes
    // them to the server if they are changed.
    //
    // They can be bound to objects both on server
    // and client. Bound objects receive a change
    // event whenever the value is changed.
    //
    // Server-side receipents act as validators
    // by default.
    //
    var clockFgImgVal = HVM.values[clockFgUrlId];
    
    // This is how you bind a value and
    // component together. You can call
    // unbind on the value, likewise to
    // reverse the effect.
    // Instances bound to HValue instances
    // automatically receive
    clockFgImgVal.bind( this.clockFg );
    
    // Lastly, we define a HView to block
    // the mouse from reaching the image, because
    // most browsers have an annoying tendency
    // to move the image when you actually want
    // to drag the underlying element.
    //
    // HView is the simplest component, it does
    // not receive events, it does not contain
    // values or labels. It's essentially a
    // transparent box suitable for
    // containing other views and components.
    this.topmostView = new HView(
      new HRect(_clockRect),
      this.view
    );
    
    // Specify the cursor of the view to hint
    // about draggability.
    this.topmostView.setStyle('cursor','move');
    
  }
});


