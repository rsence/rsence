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




/** Example structure render for JSONRenderer
  **/ 

JSONRendererTest = HApplication.extend({
  data: {
    'type':    'GUITree',
    'version': 0.1,
    
    'class':   'HWindow',
    'rect':    [16,16,700,400],
    'options': {
      'minSize': [300,300],
      'maxSize': [700,700],
      'label':   'TestWindow'
    },
    'subviews': [
      { 'class': 'HButton',
        'rect':  [8,8,200,24],
        'options': {
          'label': 'TestButton, left/top align'
        }
      },
      { 'class': 'HButton',
        'rect':  [null,null,200,24,8,8],
        'options': {
          'label': 'TestButton, right/bottom align'
        }
      },
      { 'class': 'HButton',
        'rect':  [8,null,200,24,null,8],
        'options': {
          'label': 'TestButton, left/bottom align'
        }
      },
      { 'class': 'HButton',
        'rect':  [null,8,200,24,8,null],
        'options': {
          'label': 'TestButton, right/top align'
        }
      }
    ]
  },
  constructor: function(){
    this.base();
    console.log('starting render');
    this.renderer = JSONRenderer.nu( this.data, this );
    console.log('finished render');
  }
}).nu();

JSONRendererTest.nu();


