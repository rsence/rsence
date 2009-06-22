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

var NibblesApp = HApplication.extend({
  
  defaultAppX: 200,
  defaultAppY: 80,
  statusbarHeight: 20,
  
  gridX: 0,
  gridY: 20,
  gridSize: 32,
  dotSize: 16,
  
  started: false,
  
  score: 0,
  
  statusbar: null,
  scoreLabel: null,
  scoreValue: null,
  messageLabel: null,
  container: null,
  appWindow: null,
  
  prize: null,
  prizeView: null,
  
  snake: null,
  
  constructor: function(x, y){
    this.base(5);
    
    if (x === null || x === undefined) {
      this.appX = this.defaultAppX;
    }
    else {
      this.appX = x;
    }
    if (y === null || y === undefined) {
      this.appY = this.defaultAppY;
    }
    else {
      this.appY = y;
    }
    
    var size = this.gridSize * this.dotSize;
    
    var windowW = size + 10;
    var windowH = size + this.statusbarHeight + 30;
    
    this.appWindow  = new InputHandlerWindow(
      new HRect(this.appX, this.appY, this.appX + windowW, this.appY + windowH),
      this, {
        label:   "Nibbles",
        minSize: [windowW, windowH],
        maxSize: [windowW, windowH]
      }
    );
    
    
    this.container = new HView(new HRect(this.gridX, this.gridY, this.gridX + size, this.gridY + size), this.appWindow.windowView);
    this.container.setStyle("background-color", "black");
    
    this.statusbar = new HView(new HRect(0, 0, size, this.statusbarHeight), this.appWindow.windowView);
    this.statusbar.setStyle("background-color", "white");
    
    this.scoreLabel = new HStringView(new HRect(0, 0, 0, 20), this.statusbar, {value:"Score: "});
    this.scoreLabel.refresh();
    
    this.scoreValue = new HStringView(new HRect(this.scoreLabel.rect.right+5, 0, this.scoreLabel.rect.right+5, 20), this.statusbar, {value:"0"});
    this.scoreValue.refresh();
    
    this.messageLabel = new HStringView(new HRect(0, 0, 0, 20), this.statusbar, {value:""});
    this.showMessage("Click on the game area and use the arrow keys to start.");
    
    this.startGame();
    
  },
  
  
  showMessage: function(msg) {
    this.messageLabel.setValue(msg);
    this.messageLabel.refresh();
    this.messageLabel.moveTo( this.statusbar.rect.right - this.messageLabel.rect.width , 0);
  },
  
  
  gameLoop: function() {
    
    this.snake.move(this.container);
    
    if (!this.snake.alive || this.snake.posx < 0 || this.snake.posx >= this.gridSize ||
        this.snake.posy < 0 || this.snake.posy >= this.gridSize) {
        // Hit the borders (or self).
        this.endGame();
    }
    
    
    if (null != this.prize) {
      
      if (this.prize.equals(this.snake.body[0])) {
        // Collected the prize.
        this.snake.growTo += 2;
        this.score++;
        this.scoreValue.setValue(this.score);
        this.prizeView.setRect(new HRect(0, 0, 0, 0));
        this.prize = null;
      }
      
    }
    
    
    for (var i = 0; i < this.snake.body.length; i++) {
      
      var point = this.snake.body[i];
      var x = point.x * this.dotSize;
      var y = point.y * this.dotSize;
      
      this.snake.bodyViews[i].setRect(new HRect(x, y, x + this.dotSize, y + this.dotSize));
    }
    
    
    this.drawPrize();
    
  },
  
  
  drawPrize: function() {
    
    if (this.started) {
    
      if (null == this.prizeView) {
        this.prizeView = new HView(new HRect(0, 0, 0, 0), this.container);
        this.prizeView.setStyle("background-color", "red");
      }
      
      if (null == this.prize) {
        
        var ok, prizePoint;
        
        do {
          
          ok = true;
          var x = Math.floor(this.gridSize * Math.random());
          var y = Math.floor(this.gridSize * Math.random());
          prizePoint = new HPoint(x, y);
          
          for (var i = 0; i < this.snake.body.length; i++) {
            if (prizePoint.equals(this.snake.body[i])) {
              ok = false;
              break;
            }
          }
          
        } while (!ok);
        
        this.prize = prizePoint;
        
        var x = this.prize.x * this.dotSize;
        var y = this.prize.y * this.dotSize;
        this.prizeView.setRect(new HRect(x, y, x + this.dotSize, y + this.dotSize));
        this.prizeView.bringToFront();
        
      }
      
    }
  },
  
  endGame: function() {
    this.started = false;
    this.snake.alive = false;
    
    var left = this.container.rect.width / 2 - 50;
    var top = this.container.rect.height / 2 - 9;
    
    this.showMessage("Game Over");
    
    var button = new HClickTargetButton(new HRect(left, top, left + 100, top + 18),
      this.container, {
      label: "Play again",
      target: this,
      action: this.startGame
    });
    
  },
  
  
  startGame: function(btn) {
    
    // Clear the "screen"
    for (var i = this.container.views.length; i >= 0; i--) {
      if (this.container.views[i]) {
        this.container.views[i].die();
      }
    }
    
    this.score = 0;
    this.scoreValue.setValue("0");
    
    this.prize = null;
    this.prizeView = null;
    
    var initialx = initialy = this.gridSize / 2;
    this.snake = new Snake(initialx, initialy, 4);
    this.gameLoop();
    
    HEventManager.changeActiveControl(this.appWindow);
    
  },
  
  
  pause: function() {
    if (this.started) {
      this.started = false;
      this.showMessage("Paused. Click on the game area to resume.");
    }
  },
  
  
  keyDown: function(c) {
    if (!this.started) {
      this.showMessage("");
    }
    this.started = true;
    
    if (Event.KEY_UP == c && this.snake.direction != 2) {
      this.snake.direction = 0;
    }
    else if (Event.KEY_RIGHT == c && this.snake.direction != 3) {
      this.snake.direction = 1;
    }
    else if (Event.KEY_DOWN == c && this.snake.direction != 0) {
      this.snake.direction = 2;
    }
    else if (Event.KEY_LEFT == c && this.snake.direction != 1) {
      this.snake.direction = 3;
    }
    
  },
  
  onIdle: function() {
    
    if (this.started && this.snake.alive) {
      this.gameLoop();
    }
    
  }

  
});




var InputHandlerWindow = HWindowControl.extend({
  
  constructor: function(_rect, _parentClass, _options) {
    this.base(_rect, _parentClass, _options);
    
    this.setKeyDown(true);
    this.setKeyUp(true);
    
    this.type = "[InputHandlerWindow]";
    
  },
  
  keyDown: function(c) {
    this.parent.keyDown(c);
  },
  
  lostActiveStatus: function(obj) {
    this.parent.pause();
  }

});


// Click button that supports target
var HClickTargetButton = HClickButton.extend({
  constructor: function(_rect, _parentClass, _options) {
    this.base(_rect, _parentClass, _options);
    this.target = _options.target;
  },
  click: function(x, y, _leftButton) {
    this.action.call(this.target, this);
  }
});


var Snake = Base.extend({
  
  constructor: function(posx, posy, growTo) {
    this.posx = posx;
    this.posy = posy;
    this.growTo = growTo;
    
    this.alive = true;
    
    this.direction = -1;
    
    this.body = []; // points
    this.bodyViews = [];
  },
  
  
  makeView: function(container) {
    var view = new HView(new HRect(0, 0, 0, 0), container);
    view.setStyle("background-color", "lime");
    return view;
  },
  
  
  move: function(container) {
    if (this.alive) {
      if (this.direction == 0) { // up
        this.posy--;
      }
      else if (this.direction == 1) { // right
        this.posx++;
      }
      else if (this.direction == 2) { // down
        this.posy++;
      }
      else if (this.direction == 3) { // left
        this.posx--;
      }
      
      
      // Initial dot.
      if (this.body.length == 0) {
        this.body.push( new HPoint(this.posx, this.posy) );
        this.bodyViews.push( this.makeView(container) );
      }
      
      
      // Grow one dot.
      var grew = 0;
      if (this.growTo > 0) {
        this.body.push( new HPoint(this.body.last()) );
        this.bodyViews.push( this.makeView(container) );
        this.growTo--;
        grew = 1;
      }
      
      
      var head = new HPoint(this.posx, this.posy);
      
      // Move the body.
      for (var i = this.body.length - 1 - grew; i > 0; i--) {
        
        this.body[i] = new HPoint( this.body[i - 1] );
        
        if (head.equals(this.body[i])) {
          // Hit the body.
          this.alive = false;
        }
        
      }
      
      // Move the head.
      this.body[0] = head;
      
    } // alive
    
  }
  
});

