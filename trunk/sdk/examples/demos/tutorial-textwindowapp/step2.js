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

/** Basic Extension of the HApplication class
  *
  * It's a good place to bind your application objects to. You are free 
  * to name your objects as long as there is no namespace clashes. See
  * The API reference for HApplication to find out what's reserved.
  *
  * It will be extended further in the next steps.
  **/
HelloWorldApplication = HApplication.extend({
  
  // The constructor is called when the class is constructed
  constructor: function(_applicationWindowTitle){
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
      this,             // The second construction parameter of HComponents is always the parent class instance. In this case, our application.
      {label:_applicationWindowTitle} // The third construction parameter of HComponents is always an options object that holds all the other parameters.
                                      // The window title (label) is the only one used here. In this case, it's the first parameter of our application.
    );
    
    // Let's draw the window, so it will show up on the screen:
    this.mainWindow.draw();
    
    // Let's bind a shortcut for our single window's default view:
    this.windowView = this.mainWindow.windowView;
    
    
    // Make a helper HRect to be used to calculate the button positions
    // Very useful, if the the content view changes or is unknown.
    var _contentRect = new HRect(this.windowView.rect);
    _contentRect.offsetTo(0,0);
    
    // A rectangle for the button, that will be 96px wide, 18px high and 
    // positioned 8px from the right and bottom sides of the window content view rectangle:
    this.closeButtonRect = new HRect(
      _contentRect.rightBottom.subtract(104, 24),
      _contentRect.rightBottom.subtract(  8,  8)
    ),
    
    this.closeButton = new HButton(
      this.closeButtonRect,
      this.windowView,      // The parent class; in this case we want the button to display in the window
      {label:"Close"}       // The label of the button
    );
    this.closeButton.draw();
  }
});


// A Launcher function to bring the app up
function launchHelloWorld() {
  
  // The theme path should always be the one with the css, html and gfx directories.
  HThemeManager.setThemePath("../../release/latest/themes");
  HThemeManager.setTheme("helmiTheme");
  
  // Construct an application instance
  var myApplicationInstance = new HelloWorldApplication("Hello, World!");
}

// Call the launcher when the web page is really-really loaded.
onloader("launchHelloWorld()");
