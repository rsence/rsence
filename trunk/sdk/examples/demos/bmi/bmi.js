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

// JavaScript Document

defaultStatus = '';

MyFormHandlingApp = HApplication.extend({
  makeTheSlider: function() {
    var sliderWeightRect = new HRect( 10, 10, 210, 31 );
    this.sliderWeight = new HSlider( sliderWeightRect, this, {
      minValue: 30,
      maxValue: 160,
      value: 60
    });
    var sliderWeightValueRect = new HRect( 224, 8, 200, 29 );
    this.sliderWeightValueField = new HStringView( sliderWeightValueRect, this, {} );
    var sliderHeightRect = new HRect( 10, 30, 210, 51 );
    this.sliderHeight = new HSlider( sliderHeightRect, this, {
      minValue: 100,
      maxValue: 230,
      value: 180
    });
    var sliderHeightValueRect = new HRect( 224, 28, 200, 49 );
    this.sliderHeightValueField = new HStringView( sliderHeightValueRect, this, {} );
  },
  
  makeTheFields: function() {
    var bmiRect = new HRect( 10, 50, 70, 71 );
    this.bmiField = new HTextControl( bmiRect, this, {} );
    
    var alertValueRect = new HRect( 224, 50, 280, 71 );
    this.alertValueField = new HStringView( alertValueRect, this, {value:''} );
  },
/*  
  makeTheCheckBoxes: function() {
    var lockCheckBoxRect = new HRect( 80, 50, 98, 71 );
    this.lockCheckBox = new HCheckbox( lockCheckBoxRect, this );
  },
*/  
  makeImage: function() {
    this.kuva = new HImageView(
      new HRect(300,10,500,410),
      this,
      {value:"kuva.jpg"}
    );
  },
  
  constructor: function( windowTitle, windowWidth, windowHeight, valueIDs ) {
    this.isDone = false;
    this.base( 10 );
    
    
    this.valueIDs = valueIDs;
    
    this.makeTheSlider();
    //this.makeTheValues();
    
    this.makeTheFields();
    
//    this.makeTheCheckBoxes();
    
    //this.makeImage();
    //this.kuva.scaleToFit();
    
    this.testWeight = 0;
    this.testHeight = 0;
    
    this.isDone = true;
  },
  
  onIdle: function() {
    if( this.isDone ){
      this.base();

 //     if( !this.lockCheckBox.value ) {
      if( 1 ) {
        this.weight = Math.round( this.sliderWeight.value );
        this.height = Math.round( this.sliderHeight.value ) / 100;
        oi = Math.round( ( this.weight / this.height / this.height ) * 100 ) / 100;
        this.bmiField.setValue( oi );
        this.sliderHeightValueField.setValue( Math.round( this.height * 100 ) + ' cm' );
        //this.weight = Math.round( this.weight );
        this.sliderWeightValueField.setValue( this.weight + ' kg' );
        this.testWeight = this.sliderWeight.value;
        this.testHeight = this.sliderHeight.value;
      } else {
        var moveWeight = false;
        var moveHeight = false;
        if( this.testWeight != this.sliderWeight.value ) moveWeight = true;
        if( this.testHeight != this.sliderHeight.value ) moveHeight = true;
      
        if( moveWeight ) {
          window.status = "moveWeight";
          this.weight = this.sliderWeight.value;
          oi = this.bmiField.value;
          this.height = Math.sqrt( this.weight / oi );
          this.weight = Math.round( this.weight );
          this.sliderWeightValueField.setValue( this.weight + ' kg' );
        
          this.sliderHeightValueField.setValue( Math.round( this.height * 100 ) + ' cm' );
          this.sliderHeight.setValue( this.height * 100 );
          this.testWeight = this.sliderWeight.value;
        
        } else if( moveHeight ) {
          window.status = "moveHeight";
          this.height = this.sliderHeight.value;
          oi = this.bmiField.value;
          this.weight = Math.round( oi * this.height * this.height / 100 ) / 100;
        
          this.sliderWeightValueField.setValue( Math.round( this.weight ) + ' kg' );
          this.sliderWeight.setValue( this.weight );
          this.sliderHeightValueField.setValue( Math.round( this.height ) + ' cm' );
          this.testHeight = this.sliderHeight.value;
        }
        this.weight = this.sliderWeight.value;
        this.height = this.sliderHeight.value;
        this.testWeight = this.sliderWeight.value;
        this.testHeight = this.sliderHeight.value;
      }
    
      if( this.bmiField.value < 15 ) {
        this.alertValueField.setValue( 'Starvation' );
      }
      else if( this.bmiField.value < 17.5 ){
        this.alertValueField.setValue( 'Anorectic' );
      }
      else if( this.bmiField.value < 18.5 ){
        this.alertValueField.setValue( 'Underweight' );
      }
      else if( this.bmiField.value < 25 ){
        this.alertValueField.setValue( 'Ideal' );
      }
      else if( this.bmiField.value < 30 ){
        this.alertValueField.setValue( 'Overweight' );
      }
      else if( this.bmiField.value < 40 ){
        this.alertValueField.setValue( 'Obese' );
      }
      else {
        this.alertValueField.setValue( 'DEATH!' );
      }
    }
  }
});