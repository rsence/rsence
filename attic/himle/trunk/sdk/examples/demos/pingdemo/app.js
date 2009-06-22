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

PingDemoApp = HApplication.extend({
  
  // User interface objects are stored here.
  UI: {},
  
  // The data objects are stored here.
  data: {},
  
  // A boolean value, is the request loop running.
  running: null,
  
  
  /*
   * Starts the application and builds the user interface.
   */
  constructor: function() {
    this.base(1);
    this.running = new HValue("running", true);
    this.buildUI();
  },
  
  
  /*
   * Builds the user interface of the application and binds values to the
   * controls.
   */
  buildUI: function() {
    
    this.UI.pingWindow = new HWindowControl(
      new HRect(100, 100, 300, 320), this, {
      label: "Ping"
    });

    // Current delay
    this.UI.delayLabel = new HStringView(new HRect(10, 8, 120, 26),
      this.UI.pingWindow.windowView, {
      value: "Current delay:"
    });
    this.UI.delay = new HStringView(new HRect(130, 8, 180, 26),
      this.UI.pingWindow.windowView, {
      value: ""
    });
    this.data.delayData = new HValue("delayData", "");
    this.data.delayData.bind(this.UI.delay);
    
    
    // Minimum delay
    this.UI.minDelayLabel = new HStringView(new HRect(10, 28, 120, 46),
      this.UI.pingWindow.windowView, {
      value: "Minimum so far:"
    });
    this.UI.minDelay = new HStringView(new HRect(130, 28, 180, 46),
      this.UI.pingWindow.windowView, {
      value: ""
    });
    this.data.minDelayData = new HValue("minDelayData", "");
    this.data.minDelayData.bind(this.UI.minDelay);
    
    
    // Maximum delay
    this.UI.maxDelayLabel = new HStringView(new HRect(10, 48, 120, 66),
      this.UI.pingWindow.windowView, {
      value: "Maximum so far:"
    });
    this.UI.maxDelay = new HStringView(new HRect(130, 48, 180, 66),
      this.UI.pingWindow.windowView, {
      value: ""
    });
    this.data.maxDelayData = new HValue("maxDelayData", "");
    this.data.maxDelayData.bind(this.UI.maxDelay);
    
    
    // Average delay
    this.UI.averageDelayLabel = new HStringView(new HRect(10, 68, 120, 86),
      this.UI.pingWindow.windowView, {
      value: "Average:"
    });
    this.UI.averageDelay = new HStringView(new HRect(130, 68, 180, 86),
      this.UI.pingWindow.windowView, {
      value: ""
    });
    this.data.averageDelayData = new HValue("averageDelayData", "");
    this.data.averageDelayData.bind(this.UI.averageDelay);
    
    
    // Number of active users
    this.UI.activeUsersLabel = new HStringView(new HRect(10, 103, 120, 121),
      this.UI.pingWindow.windowView, {
      value: "Active users:"
    });
    this.UI.activeUsers = new HStringView(new HRect(130, 103, 180, 121),
      this.UI.pingWindow.windowView, {
      value: ""
    });
    this.data.activeUsersData = new HValue("activeUsersData", "");
    this.data.activeUsersData.bind(this.UI.activeUsers);
    
    
    // All active users' average delay
    this.UI.activeAverageDelayLabel = new HStringView(new HRect(10, 123, 120, 141),
      this.UI.pingWindow.windowView, {
      value: "Active users' avg:"
    });
    this.UI.activeAverageDelay = new HStringView(new HRect(130, 123, 180, 141),
      this.UI.pingWindow.windowView, {
      value: ""
    });
    this.data.activeAverageDelayData = new HValue("activeAverageDelayData", "");
    this.data.activeAverageDelayData.bind(this.UI.activeAverageDelay);
    
    
    // Action buttons
    var that = this;
    this.UI.startButton = new HClickTargetButton(new HRect(10, 155, 90, 175),
      this.UI.pingWindow.windowView, {
      label: "Start",
      target: that,
      action: that.start
    });
    
    this.UI.stopButton = new HClickTargetButton(new HRect(100, 155, 180, 175),
      this.UI.pingWindow.windowView, {
      label: "Stop",
      target: that,
      action: that.stop
    });

  },
  
  
  /*
   * Start button was clicked, set 'running' to true.
   */
  start: function() {
    HValueManager.set("running", true);
  },
  
  
  /*
   * Stop button was clicked, set 'running' to false.
   */
  stop: function() {
    HValueManager.set("running", false);
  }
  
});


