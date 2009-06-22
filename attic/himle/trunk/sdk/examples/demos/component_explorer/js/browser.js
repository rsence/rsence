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

componentBrowserNS = {};

MatrixTreeNode = HTreeNode.extend( HValueMatrixComponentExtension );

// 
HComponentBrowser = HApplication.extend({
  
  construct_window: function(){
    
    // The main window
    this.mainWindow = new HWindow( 
      componentBrowserNS.mainWinRect, 
      this, {
        label:    'Component Browser',
        minSize: [ componentBrowserNS.mainWinRect.width, componentBrowserNS.mainWinRect.height ],
        maxSize: [ componentBrowserNS.mainWinRect.width, componentBrowserNS.mainWinRect.height ]
      }
    );
  },
  
  construct_viewer: function(){
    var viewerRect = new HRect( this.mainWindow.rect );
    viewerRect.setLeft( 200 );
    viewerRect.setTop(   10 );
    viewerRect.setWidth(  this.mainWindow.windowView.rect.width - 210 );
    viewerRect.setHeight( this.mainWindow.windowView.rect.height - 20 );
    this.viewer = new HView( viewerRect, this.mainWindow.windowView );
    this.viewer.setStyle( 'background-color', '#eee' );
  },
  
  construct_logo: function(){
    // The Helmi logo
    var logoRect = new HRect( this.mainWindow.rect );
    logoRect.offsetTo(  15, 10 );
    logoRect.setHeight( 80 );
    logoRect.setWidth(  this.mainWindow.windowView.rect.width - this.viewer.rect.width - 40 );
    this.logo = new HImageView( logoRect, this.mainWindow.windowView, { value: '../gfx/logo.gif' } );
  },
  
  construct_navpanel: function(){
    // Content menu
    var navPanelRect = new HRect( this.mainWindow.windowView.rect );
    navPanelRect.setLeft(   10 );
    navPanelRect.setTop(    this.logo.rect.height + 10 );
    navPanelRect.setWidth(  this.mainWindow.windowView.rect.width  - this.viewer.rect.width - 30 );
    navPanelRect.setHeight( this.mainWindow.windowView.rect.height - this.logo.rect.height  - 20 );
    this.navpanel = new HTreeControl( navPanelRect, this.mainWindow.windowView);
  },
  
  construct_values: function(){
    this.navSelectedValue = common_values.navSelectedValue;
    this.navSelectedValue.set(-1);
    this.navMatrix = new HValueMatrix();
    this.navSelectedValue.bind( this.navMatrix );
  },
  
  construct_navnodes: function(){
    var itemRect = new HRect( this.navpanel.rect );
    itemRect.offsetTo( -17, 0 );
    itemRect.setHeight( 20 );
    itemRect.setWidth( itemRect.width - 2 );
    
    this.nodes      = [];
    this.nodeValues = [];
    
    for ( var nodeNum = 0; nodeNum < componentBrowserNS.componentNames.length; nodeNum++ ){
      var nodeComponentName = componentBrowserNS.componentNames[ nodeNum ];
      this.nodeValues[ nodeNum ]  = eval('common_values.'+nodeComponentName);
      var nodeButtonRect = new HRect( itemRect );
      var nodeButton     = new HButton( nodeButtonRect, this.mainWindow.windowView, {label: nodeComponentName});
      var treeNode       = new MatrixTreeNode( this.navpanel, nodeButton ); 
      this.nodes[ nodeNum ] = treeNode;
      this.nodeValues[ nodeNum ].set( false );
      this.nodeValues[ nodeNum ].bind( treeNode );
      this.nodes[ nodeNum ].setValueMatrix( this.navMatrix );
    }
  },
  
  construct_componentview: function(){
    
    var componentAreaRect = new HRect( this.viewer.rect );
    componentAreaRect.offsetTo(0,0);
    
    var quarterHeight = parseInt( (componentAreaRect.height / 4), 10);
    var halfHeight = parseInt( (componentAreaRect.height / 2), 10);
    
    // y coordinates of the viewers
    var info_top    = 0;
    var demo_top    = quarterHeight;
    var src_top     = quarterHeight * 3;
    
    // top viewer for the description
    var infoRect  = new HRect( componentAreaRect );
    infoRect.setBottom( demo_top );
    infoRect.setHeight( quarterHeight );
    
    // middle viewer for the demo itself
    var demoRect  = new HRect( componentAreaRect );
    demoRect.setTop(    demo_top );
    demoRect.setHeight( halfHeight  );
    
    // bottom viewer for source
    var srcRect   = new HRect( componentAreaRect );
    srcRect.setTop( src_top );
    srcRect.setHeight( quarterHeight );
    
    this.infoPanel = new HWindow( infoRect, this.viewer, { label: 'DESCRIPTION' } );
    componentBrowserNS.infoView  = this.infoPanel.windowView;
    
    this.demoPanel = new HWindow( demoRect, this.viewer, { label: 'DEMO'        } );
    componentBrowserNS.demoParent  = this.demoPanel.windowView;
    
    this.srcPanel  = new HWindow(  srcRect, this.viewer, { label: 'SOURCE'      } );
    componentBrowserNS.srcView   = this.srcPanel.windowView;
    
    componentBrowserNS.demoRect = new HRect( componentBrowserNS.demoParent.rect );
    componentBrowserNS.demoRect.offsetTo( 0, 0 );
    componentBrowserNS.demoRect.insetBy( 20, 20 );
    
    componentBrowserNS.demoView = new HView( componentBrowserNS.demoRect, componentBrowserNS.demoParent );
    componentBrowserNS.demoView.setStyle( 'background-color', '#00ffff' );
    
  },
  
  construct_finalize: function(){
    this.construct_values();
    this.construct_navnodes();
    this.construct_componentview();
  },
  
  constructor: function(){
    // We need some responsiveness
    this.base(10);
    // Make the basic parts of the browser before calling the construct_finalize() from the server, when the values are done.
    this.construct_window();
    this.construct_viewer();
    this.construct_logo();
    this.construct_navpanel();
  }
  
});
