/*   Riassence Framework
 *   Copyright 2009 Riassence Inc.
 *   http://riassence.com/
 *
 *   You should have received a copy of the GNU General Public License along
 *   with this software package. If not, contact licensing@riassence.com
 */




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


