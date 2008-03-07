/***  HIMLE RIA SYSTEM
  ** 
  **  Copyright (C) 2008 HIMLE GROUP http://himle.sorsacode.com/
  **  Copyright (C) 2007 Juha-Jarmo Heinonen <o@sorsacode.com>
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


AsWizardWindow = HWindowControl.extend({
  //componentName = 'as_wizard';
  constructor: function(
      _parent,
      _cmdId,_rowNameId,_rowTypeId,        // for editor
      _selectedRowId,_nameColId,_typeColId // for viewer
    ){
    var _rect = new HRect(48,16,656,416);
    var _options = {
      label:   'AppBuilder'
    };
    this.tabs = {
      nfo: null,
      db: null,
      ui: null
    };
    this.base(_rect,_parent,_options);
    var _tabRect = new HRect( this.windowView.rect );
    _tabRect.offsetTo(0,0);
    _tabRect.insetBy(8,8);
    var _tabctl = new HTabControl(_tabRect,this.windowView);
    _tabctl.draw();
    this.tabs.nfo = _tabctl.tabs[ _tabctl.addTab(null,true, '1. Description', 256) ];
    this.descreditor = new AppDescrEditor(this.tabs.nfo);
    this.tabs.db  = _tabctl.tabs[ _tabctl.addTab(null,false,'2. Database', 256)    ];
    this.dbeditor = new DBEditor(
      this.tabs.db,
      _cmdId,_rowNameId,_rowTypeId,        // for editor
      _selectedRowId,_nameColId,_typeColId // for viewer
    );
    this.tabs.ui  = _tabctl.tabs[ _tabctl.addTab(null,false,'3. User Interface', 256)];
    this.toolbox = new Toolbox(this.tabs.ui);
    this.killButton = new (SmallButton.extend({
      flexTop: false, flexBottom: true, flexBottomOffset: 4,
      constructor: function(_parent){
        _rect = new HRect(8,0,104,21);
        _options = {
          events: {mouseDown:true},
          label:  'Cancel',
          actionVal: 3
        };
        this.base(_rect,_parent,_options);
      }
    }))(this.windowView);
    appspace.editorState.bind(this.killButton);
  }
});

AsWizardApp = HApplication.extend({
  constructor: function(
      _toolActiveValId,
      _toolSelectionRectValId,
      _cmdId,_rowNameId,_rowTypeId,        // for editor
      _selectedRowId,_nameColId,_typeColId // for viewer
    ){
    this.base(20);
    this.activeTool = HVM.values[_toolActiveValId];
    this.selectionRect = HVM.values[_toolSelectionRectValId];
    this.view = new AsWizardWindow(
      this,
      _cmdId,_rowNameId,_rowTypeId,        // for editor
      _selectedRowId,_nameColId,_typeColId // for viewer
    );
  }
});




