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

/** Tutorial Application class
  *
  * This Application displays a text message.
  *
  * See the previous steps about how it was done.
  **/
TextWindowApplication = HApplication.extend({
  
  // The constructor is called when the class is constructed
  constructor: function(_windowTitle,_windowContent,_closeButtonTitle){
    
    // Check parameters and change them to some defaults, if needed:
    if(!_windowTitle){
      var _windowTitle='Untitled Window';
    }
    if(!_windowContent){
      var _windowContent='';
    }
    if(!_closeButtonTitle){
      var _closeButtonTitle='Close';
    }
    
    // Our simple application's instances will always be
    // running with a 100ms poll rate. We should call the super-class like this.
    this.base(100);
    
    // We define what size of window we are constructing 
    this.windowRect = new HRect(
      100, // HWindow position (in pixels) from the left side of the browser window
      100, // HWindow position (in pixels) from the top side of the browser window
      420, // The position with width added (the coordinate of the HWindow's right side)
      300  // The position with height added (the coordinate of the HWindow's bottom side)
    );
    
    // Construct the new HWindow instance and bind it to the application namespace
    this.mainWindow = new HWindow(
      this.windowRect,  // The first construction parameter of HComponents is always the geometry rectangle
      this,             // The second construction parameter of HComponents is always the parent 
                        // class instance. In this case, our application.
      
      { label:    _windowTitle,     // The third construction parameter of HComponents is
                                    // always an options object that holds all the other parameters.
        
        // Let's also specify some window size constrains:
        minSize: [320,200],
        maxSize: [640,480] }
    );
    
    // Let's draw the window, so it will show up on the screen:
    this.mainWindow.draw();
    
    // Let's bind a shortcut for our single window's default view:
    this.windowView = this.mainWindow.windowView;
    
    // Calculate item positions and sizes:
    this.calcRects();
    
    this.closeButton = new CloseTheAppButton(
      this.closeButtonRect,
      this.windowView,      // The parent class; in this case we want the button to display in the window
      {label:_closeButtonTitle}     // The label of the button
    );
    this.closeButton.draw();
    
    // A plain HView to contain some text
    this.textView = new HView(
      this.textViewRect,
      this.windowView
    );
    this.textView.draw();
    
    // Set some styles. We are basically using the view as a fancy html element
    this.textView.setStyle('background-color','#eeeeee');
    this.textView.setStyle('font-family','Times New Roman, serif');
    this.textView.setStyle('font-size','11px');
    this.textView.setStyle('overflow-y','auto');
    this.textView.setStyle('color','#000000');
    
    // Use the low-level api to change its content
    elem_set(this.textView.elemId,_windowContent);
    
    // Used in the idle loop to detect windowView resizing.
    this.resizeComparePoint = new HPoint(this.windowView.rect.rightBottom);
  },
  
  // Calculate window child-component positions
  calcRects: function(){
    
    // Make a helper HRect to be used to calculate the button positions
    // Very useful, if the the content view changes or is unknown.
    var _contentRect = new HRect(this.windowView.rect);
    _contentRect.offsetTo(0,0);
    
    // A rectangle for the button, that will be 96px wide, 18px high and 
    // positioned 8px from the right and bottom sides of the window content view rectangle:
    if(!this.closeButtonRect){
      this.closeButtonRect = new HRect();
    }
    this.closeButtonRect.set(
      _contentRect.rightBottom.subtract(104, 24),
      _contentRect.rightBottom.subtract(  8,  8)
    );
    
    // A rectangle for the textfield, that will fill the whole window with
    // some inset, so it doesn't cover the button.
    if(!this.textViewRect){
      this.textViewRect = new HRect();
    }
    this.textViewRect.set(
      _contentRect.leftTop.add(8, 8),
      _contentRect.rightBottom.subtract(  8,  32)
    );
  },
  
  // Some finishing touches;
  // resize/reposition elements in case the window size changes
  onIdle: function(){
    
    // Call the superclass' onIdle method:
    this.base();
    
    // Use HPoint's equals-method to compare to the current window's right bottom corner point:
    if(!this.resizeComparePoint.equals(this.windowView.rect.rightBottom)){
      this.calcRects();
      this.closeButton.drawRect();
      this.textView.drawRect();
      this.resizeComparePoint = new HPoint(this.windowView.rect.rightBottom);
    }
  }
});

/** A Simple HClickButton extension.
  *
  * Causes the HApplication instance of the button to terminate itself.
  *
  **/

// The HClickButton is like the normal HButton, except it has already a click 
// method call implemented. To benefit from this, the click method has to be
// extended like this:
CloseTheAppButton = HClickButton.extend({
  
  // The click method is called with the x/y coordinates of the click location
  // and the information about which button was clicked.
  click: function(x,y,whichButton){
    
    // Just tell the application instance of the button to terminate itself:
    this.app.die();
  }
});


// A Launcher function to bring the app up
function launchHelloWorld() {
  
  // The theme path should always be the one with the css, html and gfx directories.
  HThemeManager.setThemePath("../../release/latest/themes");
  HThemeManager.setTheme("helmiTheme");
  
  // Construct an application instance
  var _winTitle = 'License Agreement';
  var _winMsg = '<b>Helmi RIA Platform</b><br />Copyright (C) 2006 Helmi Technologies Inc.<br /><br />This program is free software; you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation; either version 2 of the License, or (at your option) any later version. <br />This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.<br />See the GNU General Public License for more details. <br />You should have received a copy of the GNU General Public License along with this program; if not, write to the Free Software Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA';
  var _closeTitle = 'I Agree';
  var myApplicationInstance = new TextWindowApplication(_winTitle,_winMsg,_closeTitle);
}

// Call the launcher when the web page is really-really loaded.
onloader("launchHelloWorld()");
