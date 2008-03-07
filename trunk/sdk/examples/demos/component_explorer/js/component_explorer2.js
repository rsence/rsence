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

// JScript File

TreeNode = HTreeNode.extend( HValueMatrixComponentExtension );

ComponentExplorer = HApplication.extend({
  constructor: function(_windowRect,_windowLabel,_logoPath){
    this.base(100);
    
    // The main window
    this.window1 = new HWindowControl( 
      _windowRect, 
      this, 
      { label:_windowLabel,
        minSize:[ _windowRect.width, _windowRect.height ], 
        maxSize:[_windowRect.width, _windowRect.height] 
      } 
    );
    
    // The componentpanel
    var panelRect = new HRect( _windowRect );
    panelRect.setLeft( 200 );
    panelRect.setTop( 10 );
    panelRect.setWidth( this.window1.windowView.rect.width - 210 );
    panelRect.setHeight( this.window1.windowView.rect.height - 20 );
    this.panel = new HView( panelRect, this.window1.windowView );
    this.panel.setStyle( 'background-color', '#eee' );
    
    // The Helmi logo    
    var logoRect = new HRect( _windowRect );
    logoRect.offsetTo( 15, 10 );
    logoRect.setHeight( 80 );
    logoRect.setWidth( this.window1.windowView.rect.width - this.panel.rect.width - 40 );
    this.logo = new HImageView( logoRect, this.window1.windowView, {value: _logoPath} );
    
    // <<<<<<< Content menu
    var navigationPanelRect = new HRect( _windowRect );
    navigationPanelRect.setLeft( 10 );
    navigationPanelRect.setTop( this.logo.rect.height + 10 );
    navigationPanelRect.setWidth( this.window1.windowView.rect.width - this.panel.rect.width - 30 );
    navigationPanelRect.setHeight( this.window1.windowView.rect.height - this.logo.rect.height - 20 );
    this.navigationtree = new HTreeControl( navigationPanelRect, this.window1.windowView);
 
    //var matrixContainerValue = new HValue('dummyParentId',-1);
    var matrixContainerValue = php_db.selectedComponentNumber;

    // Work-around until HMatrixValue is fixed (it has to be -1 when constructed)
      matrixContainerValue.set(-1);
    // End Work-around

    var multiValue = new HValueMatrix( );
    matrixContainerValue.bind( multiValue );
    
    // teststring  
    //var matrixstring = new HStringView( new HRect(120,100,200,120), this, {label: "nothing yet (1)" } );
    //matrixContainerValue.bind( matrixstring );
     
    var itemRect = new HRect( navigationPanelRect );
    itemRect.offsetTo( -17, 0 );
    itemRect.setHeight( 20 );
    itemRect.setWidth( navigationPanelRect.width - 2 );
    
    var node = [];
    var nodevalue = [];
    
    for ( var i=0; i<(components.length-1); i++ ){   
      nodevalue[i] = php_db[components[i]];
      node[i] = new TreeNode( this.navigationtree, new HButton( itemRect, this.window1.windowView, {label: components[i]} ) ); 
      nodevalue[i].set( false );
      nodevalue[i].bind( node[i] );
      node[i].setValueMatrix( multiValue );
    }
    
    //alert(multiValue.values[0].id);

 /*     
    this.button_value = php_db.Button;
    this.buttonMenuItem = new TreeNode( this.navigationtree, new HButton( itemRect, this.window1.windowView, {label: "Button"} ) );
    this.button_value.set( false );
    this.button_value.bind( this.buttonMenuItem);
    this.buttonMenuItem.setValueMatrix( multiValue );

    this.checkbox_value = php_db.Checkbox;
    this.checkboxMenuItem = new TreeNode( this.navigationtree, new HButton( itemRect, this.window1.windowView, {label: "Checkbox"} ) );
    this.checkbox_value.set( false );
    this.checkbox_value.bind( this.checkboxMenuItem);
    this.checkboxMenuItem.setValueMatrix( multiValue );

    this.imageview_value = php_db.ImageView;
    this.imageviewMenuItem = new TreeNode( this.navigationtree, new HButton( itemRect, this.window1.windowView, {label: "ImageView"} ) );
    this.imageview_value.set( false );
    this.imageview_value.bind( this.imageviewMenuItem);
    this.imageviewMenuItem.setValueMatrix( multiValue );

*/     
  
    // >>>>>>>>> Content menu
  } 

});

// Dim of NavigationPanel is constant, while the dim of ComponentPanel is variable. 
ComponentPanel = HApplication.extend({
  constructor: function( _parentView, demoJSSrc, demoDescr, demoHTMLJSSrc ){  // , demoJSSrc, demoDescr, demoHTMLJSSrc
    this.base(20);
    var _mainRect = new HRect( _parentView.rect );
    _mainRect.offsetTo(0,0);
    this.mainView = new HView( _mainRect, _parentView);
    var _quarterHeight = parseInt(_parentView.rect.height / 4, 10);
    var _parentWidth   = _parentView.rect.width;
    
    var _descrRect = new HRect(0,0, _parentWidth, _quarterHeight);
    this.descrPanel = new HWindowControl( _descrRect, this.mainView, {label:'DESCRIPTION'} );
    
    //alert(this.descrPanel.windowView.elemId);
    //elem_set( this.descrPanel.windowView.elemId, demoDescr );
    
    //elem_set( this.descrPanel.windowView.elemId, demoDescr );
    
    var _demoRect = new HRect(0,_quarterHeight, _parentWidth, _quarterHeight * 3);
    this.demoPanel = new HWindowControl( _demoRect, this.mainView, {label:'DEMO'} );
    //eval( demoJSSrc );
    
    var _srcRect = new HRect(0,_quarterHeight*3, _parentWidth, 4*_quarterHeight );
    this.sourcePanel = new HWindowControl( _srcRect, this.mainView, {label:'SOURCE'} );
    //elem_set( this.sourcePanel.windowView.elemId, demoHTMLJSSrc );    
    
  }
});

panelapp = false;

