/**
  * Riassence Core -- http://rsence.org/
  *
  * Copyright (C) 2009 Juha-Jarmo Heinonen <jjh@riassence.com>
  *
  * This file is part of Riassence Core.
  *
  * Riassence Core is free software: you can redistribute it and/or modify
  * it under the terms of the GNU General Public License as published by
  * the Free Software Foundation, either version 3 of the License, or
  * (at your option) any later version.
  *
  * Riassence Core is distributed in the hope that it will be useful,
  * but WITHOUT ANY WARRANTY; without even the implied warranty of
  * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  * GNU General Public License for more details.
  *
  * You should have received a copy of the GNU General Public License
  * along with this program.  If not, see <http://www.gnu.org/licenses/>.
  *
  **/


/**
  *  The current purpose of JSONRenderer is to render JSON hashes to GUI views.
  *
  *  It's currently considered being as pre-alpha quality and will later
  *  greatly expand to cover most situations.
  *
  **/

JSONRenderer = HClass.extend({

/** consturctor parameters:
  *  - _data:   The data structure used for building.
  *  - _parent: The parent view (or app)
  **/
  constructor: function(_data, _parent){
    if((_data['type'] === 'GUITree') && ([0.1,0.2].indexOf(_data['version']) !== -1)){
      this.data   = _data;
      this.parent = _parent;
      this.render();
    }
    else{
      throw("JSONRenderer: Only GUITree 0.1 and 0.2 data can be built at this time.");
    }
  },
  render: function(){
    this.view = this.renderNode( this.data, this.parent );
  },
  renderNode: function( _dataNode, _parent ){
    var // Currently only window-level classes are supported
        _className = _dataNode['class'],
        _hasClass = (_className !== undefined) && (window[_className] !== undefined),
        _class = _hasClass?(window[_className]):false,
        
        // Currently only HView -derived classes are supported, so 
        // the rect is mandatory.
        _rect = _dataNode['rect'],
        _hasRect = (_rect !== undefined) && (_rect instanceof Array),
        
        // Checks, if any sub-views are defined.
        _hasSubviews = _dataNode['subviews'] !== undefined,
        _subViews    = _hasSubviews?_dataNode['subviews']:null,
        
        // Checks, if any options are defined.
        _hasOptions  = _dataNode['options'] !== undefined,
        _options     = _hasOptions?_dataNode['options']:null,
        
        // The HView-derived class instance, instance is by default the parent
        _instance = _parent,
        
        // not used yet:
        _subView;
    try{
      if(_hasClass){
        if(_hasOptions){
          if(_options['valueObjId'] !== undefined){
            var _valueObjId = _options['valueObjId'];
            _options['valueObj'] = COMM.Values.values[_options['valueObjId']];
          }
        }
        // For HApplication -derived classes
        if(!_hasRect && _hasOptions){
          _instance = _class.nu(_options);
        }
        // For HView and HControl -derived classes
        else if(_hasRect){
          _instance = _class.nu(_rect,_parent,_options);
        }
      }
      else {
        console.log('renderNode warning; No such class: '+_className);
      }
    }
    catch(e){
      console.log('renderNode error:',e,', rect:',_rect,', class:',_dataNode['class'],', options:', _options);
    }
    // Iterates recursively through all subviews, if specified.
    if(_hasSubviews){
      for( var i = 0; i < _subViews.length; i++ ){
        _subView = this.renderNode( _subViews[i], _instance );
      }
    }
    
    // Returns the main view (or subview when recursively called).
    return _instance;
  }
});

