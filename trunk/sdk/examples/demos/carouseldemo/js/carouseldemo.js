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

CarouselDemoApplication = HApplication.extend({
  
  constructor: function(){
    this.base(20);
    
    
    
    var demoImages = ["Pig.gif", "Bird.gif", "Cat.gif", "Dog.gif", "Rabbit.gif"];
    var demoImagePath = "./images/";
    
    var images = [];
    for (var i = 0; i < demoImages.length; i++) {
      images.push(demoImagePath + demoImages[i]);
    }
    
    
    new HColorStringView(new HRect(20, 20, 200, 37), this, {value: "Original size images."});
    new HCarousel(
      new HRect(20, 40, 20, 40), // right and bottom are ignored
      this, {
        images: images,
        imageWidth: 125,
        imageHeight: 125,
        visibleImages: 3,
        animate: true,
        slideSpeed: 7
      }
    );
    
    
    new HColorStringView(new HRect(20, 220, 200, 237), this, {value: "Smaller images, slower sliding."});
    new HCarousel(
      new HRect(20, 240, 20, 240), // right and bottom are ignored
      this, {
        images: images,
        imageWidth: 100,
        imageHeight: 100,
        visibleImages: 2,
        animate: true,
        slideSpeed: 3
      }
    );
    
    
    new HColorStringView(new HRect(20, 400, 200, 417), this, {value: "Bigger images, no sliding."});
    new HCarousel(
      new HRect(20, 420, 20, 420), // right and bottom are ignored
      this, {
        images: images,
        imageWidth: 150,
        imageHeight: 150,
        visibleImages: 1,
        animate: false
      }
    );

  }
  
  
});


HColorStringView = HStringView.extend({

  constructor: function(_rect, _parentClass, _options) {
    this.base(_rect, _parentClass, _options);
    this.setStyle("background-color", HColorStringView.bg);
    this.setStyle("color", HColorStringView.fg);
  }
}, {
  fg: "black",
  bg: "white"
});




