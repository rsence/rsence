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

HCarousel = HView.extend({
  
  buttonWidth: 40,    // The width of control buttons.
  imagePadding: 10,   // Space between images.
  currentImage: 0, // Index of the image currently on the left position.
  
  animating: false,
  
  constructor: function(_rect, _parentClass, _options){
    this.base(_rect, _parentClass);
    
    // TODO: add smart defaults
    
    this.images = _options.images;
    this.imageWidth = _options.imageWidth;
    this.imageHeight = _options.imageHeight;
    this.visibleImages = _options.visibleImages;
    this.animate = _options.animate;
    this.slideSpeed = _options.slideSpeed;
    
    
    if (this.images.length < this.visibleImages) {
      this.visibleImages = this.images.length;
    }
    
    
    var wButtons = 2 * this.buttonWidth;
    var wImages = this.visibleImages * this.imageWidth;
    var wSpace = (this.visibleImages + 1) * this.imagePadding;
    this.rect.setWidth(wButtons + wImages + wSpace);
    this.rect.setHeight(2 * this.imagePadding + this.imageHeight);
    
    
    this.draw();
    this.setStyle("background-color", "indigo");
    
    this.addControls();
  },
  
  
  addControls: function() {
    
    var that = this;
    
    // Button for scrolling left.
    var leftButtonRect = new HRect(0, 0, 0, this.rect.height);
    leftButtonRect.setWidth(this.buttonWidth);
    this.leftButton = new HClickTargetButton(leftButtonRect, this, {
      label: "L",
      action: that.goLeft,
      target: that
    });
    
    // Button for scrolling right.
    var rightButtonRect = new HRect(0, 0, 0, this.rect.height);
    rightButtonRect.setWidth(this.buttonWidth);
    rightButtonRect.offsetTo(this.rect.width - this.buttonWidth, 0);
    this.rightButton = new HClickTargetButton(rightButtonRect, this, {
      label: "R",
      action: that.goRight,
      target: that
    });
    
    
    // A view that contains the visible images.
    this.imageContainer = new HView(
      new HRect(leftButtonRect.right, 0, rightButtonRect.left, this.rect.height),
      this
    );
    
    // Image views.
    this.imageViews = [];
    for (var i = 0; i < this.visibleImages; i++) {
      
      var left = i * this.imageWidth + (i+1) * this.imagePadding;
      var top = this.imagePadding;
      
      var newImage = new HImageView(
        new HRect(left, top, left + this.imageWidth, top + this.imageHeight),
        this.imageContainer, {
          value: this.images[i]
        }
      );
      
      newImage.scaleToFit();
      
      this.imageViews.push(newImage);
      
    }
    
    // An extra image for sliding effect.
    var left = this.imageContainer.rect.width;
    var top = this.imagePadding;
    this.tempImageView = new HImageView(
      new HRect(left, top, left + this.imageWidth, top + this.imageHeight),
      this.imageContainer
    );
    this.tempImageView.scaleToFit();

  },
  
  
  goLeft: function() {
    if (this.currentImage < 1 || this.animating) {
      // Already showing the first image.
      return;
    }
    
    this.currentImage--;
    
    if (this.animate) {
      
      this.tempImageView.setValue(this.images[this.currentImage]);
      this.tempImageView.offsetTo(-this.imageWidth, this.imagePadding);
      
      this.animating = true;
      this._animateLeft();
    }
    else {
      this._reposition();
    }
    
  },
  
  
  goRight: function() {
    if (this.currentImage + this.visibleImages >= this.images.length || this.animating) {
      // Already showing the last image.
      return;
    }
    
    this.currentImage++;
    
    if (this.animate) {
      
      var newImageIndex = this.currentImage + this.visibleImages - 1;
      
      this.tempImageView.setValue(this.images[newImageIndex]);
      this.tempImageView.offsetTo(this.imageContainer.rect.width,
        this.imagePadding);
      
      this.animating = true;
      this._animateRight();
      
    }
    else {
      this._reposition();
    }
    
  },
  
  
  _animateRight: function() {
    
    var move = -this.slideSpeed;
    var finished = false;
    
    for (var i = 0; i < this.visibleImages; i++) {
      
      // Check the image container limits.
      if (i == 0) {
        
        if (this.imageViews[0].rect.right + move < 0) {
          move = -this.imageViews[0].rect.right;
          finished = true;
        }
      }
      
      this.imageViews[i].offsetBy(move, 0);
    }
    this.tempImageView.offsetBy(move, 0);
    
    
    if (finished) {
      this.animating = false;
      
      // Update the image view references.
      var tmp = this.imageViews[0];
      for (var i = 1; i < this.visibleImages; i++) {
        this.imageViews[i-1] = this.imageViews[i];
      }
      this.imageViews[this.visibleImages - 1] = this.tempImageView;
      this.tempImageView = tmp;
      
    }
    else {
      var that = this;
      var tt = window.setTimeout(function() { that._animateRight(); }, 10);
    }
    
  },
  
  
  _animateLeft: function() {
    
    var move = this.slideSpeed;
    var finished = false;
    
    for (var i = 0; i < this.visibleImages; i++) {
      
      // Check the image container limits.
      if (i == 0) {
        if (this.imageViews[this.visibleImages - 1].rect.left + move > this.imageContainer.rect.width) {
          move = this.imageContainer.rect.width - this.imageViews[this.visibleImages - 1].rect.left;
          finished = true;
        }
      }
      
      this.imageViews[i].offsetBy(move, 0);
    }
    this.tempImageView.offsetBy(move, 0);
    
    
    if (finished) {
      this.animating = false;
      
      // Update the image view references.
      var tmp = this.imageViews[this.visibleImages - 1];
      for (var i = this.visibleImages - 1; i > 0 ; i--) {
        this.imageViews[i] = this.imageViews[i-1];
      }
      this.imageViews[0] = this.tempImageView;
      this.tempImageView = tmp;
      
    }
    else {
      var that = this;
      var tt = window.setTimeout(function() { that._animateLeft(); }, 10);
    }
    
  },
  
  
  _reposition: function() {
    var imageIndex = this.currentImage;
    for (var i = 0; i < this.visibleImages; i++) {
      this.imageViews[i].setValue(this.images[imageIndex]);
      this.imageViews[i].scaleToFit();
      imageIndex++;
    }
  }
  
  
});


HClickTargetButton = HClickButton.extend({
  constructor: function(_rect, _parentClass, _options) {
    this.base(_rect, _parentClass, _options);
    this.target = _options.target;
  },
  click: function(x, y, _leftButton) {
    this.action.call(this.target, this);
  }
});

