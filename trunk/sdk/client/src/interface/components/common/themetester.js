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

HThemeTester = HApplication.extend({
  
  initValues: function(){
  },
  
  create: function( _parentView ){
  },
  
  animate: function(){
    var _tryScale = this._currScale + this._animStep;
    if ((_tryScale > this._maxScale) || (_tryScale < this._minScale)){
      this._animStep = 0 - this._animStep;
    }
    var _nextScale = this._currScale + this._animStep;
    for ( var _bgNum = 0; _bgNum < this.bgViews.length; _bgNum ++ ) {
      var _bgView = this.bgViews[ _bgNum ];
      var _bgRect = this.bgRects[ _bgNum ];
      _bgView.rect.set( parseInt( _bgRect.left   * _nextScale ),
                        parseInt( _bgRect.top    * _nextScale ),
                        parseInt( _bgRect.right  * _nextScale ),
                        parseInt( _bgRect.bottom * _nextScale )
      );
      _bgView.drawRect();
    }
    
    this.manageRect.setWidth(  parseInt( this._origWidth * 3 * _nextScale ) );
    this.manageRect.setHeight( parseInt( 20 * _nextScale ) );
    this.manageView.drawRect();
    
    for ( var _compNum = 0; _compNum < this.components.length; _compNum ++ ) {
      
      var _compObj  = this.components[ _compNum ];
      var _compRect = this.compRects[  _compNum ];
      var _origRect = this.origRects[  _compNum ];
      
      _compRect.setLeft(   parseInt( _origRect.left   * _nextScale ));
      _compRect.setTop(    parseInt( _origRect.top    * _nextScale ));
      _compRect.setWidth(  parseInt( _origRect.width  * _nextScale ));
      _compRect.setHeight( parseInt( _origRect.height * _nextScale ));
      
      _compObj.drawRect();
    }
    
    this._currScale = _nextScale;
  },
  
  onIdle: function(){
    if(this._appIdle && !this._paused){
      this._appIdle = false;
      this.animate();
      this._appIdle = true;
    }
  },
  
  constructor: function( _themeName, _width, _height, _minScale, _maxScale ){
    
    this._appIdle = false;
    this._paused  = true;
    
    this._animSpeed = 11;
    this.base( this._animSpeed );
    
    this.initValues();
    
    this.manageRect = new HRect( 0,0,(_width*3),20);
    this.manageView = new HView( this.manageRect, this );
    this.manageView.setStyle('background-color','#ccc');
    
    var _manageButton = HControl.extend({
      constructor: function(_rect,_parent,_options){
        this.base(_rect,_parent,_options);
        this.setStyle( 'background-color','#eee' );
        this.setStyle( 'border','1px solid #666' );
        this.setStyle( 'cursor','pointer' );
        this.setStyle( 'font-family','sans-serif' );
        this.setStyle( 'font-size','10px' );
        this.setStyle( 'line-height','20px' );
        this.setStyle( 'align','center' );
        this.setStyle( 'vertical-align','middle' );
        this.setMouseDown( true );
      }
    });

    this.toggleCtrl = new (_manageButton.extend({
      mouseDown: function(_x,_y,_b){
        this.app._paused = !this.app._paused;
      }
    }))( new HRect( 0, 0, 100, 20 ), this.manageView);
    this.toggleCtrl.setHTML(  'TOGGLE' );

    this.reverseCtrl = new (_manageButton.extend({
      mouseDown: function(_x,_y,_b){
        this.app._animStep = 0-this.app._animStep;
      }
    }))( new HRect( 100, 0, 200, 20 ), this.manageView);
    this.reverseCtrl.setHTML(  'REVERSE' );

    this.stepCtrl = new (_manageButton.extend({
      mouseDown: function(_x,_y,_b){
        this.app.animate();
      }
    }))( new HRect( 200, 0, 300, 20 ), this.manageView);
    this.stepCtrl.setHTML(  'STEP' );

    this.slowerCtrl = new (_manageButton.extend({
      mouseDown: function(_x,_y,_b){
        this.app._animSpeed += 10;
        HSystem.reniceApp( this.appId, this.app._animSpeed );
      }
    }))( new HRect( 300, 0, 400, 20 ), this.manageView);
    this.slowerCtrl.setHTML(  'SLOWER' );

    this.fasterCtrl = new (_manageButton.extend({
      mouseDown: function(_x,_y,_b){
        if( this.app._animSpeed > 10) {
          this.app._animSpeed -= 10;
          HSystem.reniceApp( this.appId, this.app._animSpeed );
        }
      }
    }))( new HRect( 400, 0, 500, 20 ), this.manageView);
    this.fasterCtrl.setHTML(  'FASTER' );

    
    HThemeManager.setTheme( _themeName );
    
    this._currScale = 1.0;
    this._minScale  = _minScale;
    this._maxScale  = _maxScale;
    this._animStep  = 0.1;
    
    var _top    = 20;
    var _left   = 0;
    this._origWidth = _width;
    var _right  = _width;
    var _bottom = _height + 20;
    
    var _colorGrid = [
      ['000','333','666','999','ccc','fff'],
      ['900','090','009','990','909','099'],
      ['f00','0f0','00f','ff0','f0f','0ff']
    ];
    
    this.bgViews = [];
    this.bgRects = [];
    for ( var _colNum=0; _colNum<_colorGrid.length; _colNum ++ ){
      var _column = _colorGrid[ _colNum ];
      for ( var _rowNum=0; _rowNum<_column.length; _rowNum++ ){
        var _bgColor = '#'+_column[_rowNum];
        var _bgView = new HView( new HRect(_left,_top,_right,_bottom), this );
        this.bgViews.push( _bgView );
        this.bgRects.push( new HRect( _bgView.rect ) );
        _bgView.setStyle( 'background-color', _bgColor );
        _top += _height; _bottom += _height;
      }
      _top = 20; _bottom = _height + 20;
      _left += _width; _right += _width;
    }
    
    this.components = [];
    this.compRects  = [];
    for( var _bgNum = 0; _bgNum < this.bgViews.length; _bgNum++ ){
      this.create( this.bgViews[_bgNum] );
    }
    this.origRects  = [];
    for( var _compNum = 0; _compNum < this.compRects.length; _compNum ++ ){
      this.origRects.push( new HRect( this.compRects[_compNum] ) );
    }
    this._appIdle = true;
    
  }
});

