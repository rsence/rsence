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


ELEM = {
  
  // stuff moved inside this function, because (surprise, surprise!) ie6 had some issues with it.
  _constructor: function(){
    var _this=ELEM;
    
    // pre-init queue
    _this._domLoadQueue = [];
    _this._domLoadTimer = null;
    
    // turns true when document is actually loaded:
    _this._domLoadStatus = false;
    
    // initial tasks
    _this._initDone = false;
    
    _this._makeCount = 0;
    
    _this._setStyleCount = 0; _this._setStyleDiffCount = 0;
    _this._getStyleCount = 0; _this._getStyleMissCount = 0;
    
    _this._flushLoopCount = 0;
    _this._flushLoopFlushedCount = 0;
    _this._flushStylCount = 0;
    
    _this._flushTime = 0;
    _this._flushCounter = 0;
    _this._idleDelay = 500;
    
    _this._timer = null;
    _this._minDelay = 40;
    _this._flushing = false;
    _this._needFlush = false;
    _this._slowness = 1;
    
    _this._elements =   [];
    _this._recycler =   {_tagNames:[]};
    _this._styleCache = {};
    _this._styleTodo =  {};
    _this._attrTodo =   {};
    _this._attrCache =  {};
    _this._elemTodo =   [];
    _this._elemTodoH =  {};
    _this._blockElems = ",ADDRESS,BLOCKQUOTE,CENTER,DIR,DIV,DL,FIELDSET,FORM,H1,H2,H3,H4,H5,H6,HR,ISINDEX,MENU,NOFRAMES,NOSCRIPT,OL,P,PRE,TABLE,UL,";
  },
  
  
  _fillTrash: function(_count,_tagName){
    var _this=ELEM,i=0,_toDel=[],_recycler=_this._initRecycler(_tagName),_trashId=_recycler._trashId;
    for(;i!=_count;i++){_toDel.push(_this.make(_trashId,_tagName));}
    for(i=0;i!=_count;i++){_this.del(_toDel[i]);}
  },
  
  // adds an element reference
  // returns its id
  _add: function(_elem){
    var _id, _this, _elements;
    _this = ELEM;
    _elements = _this._elements;
    
    // Adds the element to the cache
    _elements.push(_elem);
    // Get cache size == serial id
    _id = _elements.length-1;
    
    return _id;
  },
  
  // makes new style caches
  _initCache: function(_id){
    var _this = ELEM;
    _this._styleTodo[_id] = [];
    _this._styleCache[_id] = {};
    _this._attrTodo[_id] = [];
    _this._attrCache[_id] = {};
    _this._elemTodoH[_id] = false;
  },
  
  // binds a dom element by dom id property
  // returns id
  bindId: function(_domId){
    var _this=ELEM,_elem=document.getElementById(_domId),_elemId=_this._add(_elem);
    _this._initCache(_elemId);
    return _elemId;
  },
  
  // binds a dom element
  // returns id
  bind: function(_elem){
    var _id, _this=ELEM;
    _id = _this._add(_elem);
    _this._initCache(_id);
    return _id;
  },
  
  // deprecated; backwards-compatibility
  _replace: function(_id,_elem){
    var _this=ELEM;
    _this._elements[_id] = _elem;
  },
  
  // returns dom element by id
  get: function(_id){
    return ELEM._elements[_id];
  },
  
  // sets inner html of element
  setHTML: function(_id,_html){
    var _this=ELEM;
    _this._elements[_id].innerHTML = _html;
    //_this._initCache(_id);
  },
  
  _initRecycler: function(_tagName){
    var _this=ELEM,_recycler=_this._recycler;
    if(!_recycler[_tagName]){
      _recycler._tagNames.push(_tagName);
      _recycler[_tagName]=[];
      _recycler[_tagName]._countIn=1;
      _recycler[_tagName]._countOut=0;
      _recycler[_tagName]._trashId=_this.make(_this._trashId,'div');
    }
    return _recycler[_tagName]._trashId;
  },
  
  // deletes element and all its associated caches by id
  del: function(_id){
    var _this=ELEM,_elem=_this._elements[_id],_tagName=_elem.tagName,_trashId;
    _trashId=_this._initRecycler(_tagName);
    _this.append(_id,_trashId);
    
    var _elemTodoIdx=_this._elemTodo.indexOf(_id),_recycler=_this._recycler[_tagName];
    if(_elemTodoIdx!=-1){
      _this._elemTodo.splice(_elemTodoIdx,1);
    }
    
    try{_elem.innerHTML='';}catch(e){}
    _this.setCSS(_id,'display:none;');
    //_this.setAttr(_id,'id','',true);
    _this.delAttr(_id,'id');
    _this.delAttr(_id,'ctrl');
    
    _this._initCache(_id);
    _recycler._countIn++;
    _recycler.push(_id);
    
  },
  
  // places element inside another
  append: function(_sourceId,_targetId){
    var _source, _target, _this;
    _this   = ELEM;
    _source = _this._elements[_sourceId];
    _target = _this._elements[_targetId];
    _target.appendChild(_source);
  },
  
  setCSS: function(_id,_css){
    ELEM._elements[_id].style.cssText = _css;
  },
  
  getCSS: function(_id){
    return ELEM._elements[_id].style.cssText;
  },
  
  // returns element's size from the part that is not hidden by its parent elements with overflow property
  getVisibleSize: function(_id){
    var _this,_elem,w,h,_parent,_parentOverflow;
    _this=ELEM;_elem=_this._elements[_id];
    w=_elem.offsetWidth;h=_elem.offsetHeight;
    _parent=_elem.parentNode;
    while(_parent&&_parent.nodeName.toLowerCase()!='body'){
      if(!_this._is_ie){_parentOverflow=document.defaultView.getComputedStyle(_parent,null).getPropertyValue('overflow');}
      else{_parentOverflow=_parent.currentStyle.getAttribute('overflow');}
      _parentOverflow=_parentOverflow!='visible';
      if(w>_parent.clientWidth&&_parentOverflow){w=_parent.clientWidth-_elem.offsetLeft;}
      if(h>_parent.clientHeight&&_parentOverflow){h=_parent.clientHeight-_elem.offsetTop;}
      _elem=_elem.parentNode;_parent=_elem.parentNode;
    }
    return [w,h];
  },

  getVisiblePosition: function(_id){
    var x,y,_elem,_this;_this=ELEM;
    x=0;y=0;_elem=_this._elements[_id];
    while(_elem!==document){
      x+=_elem.offsetLeft;y+=_elem.offsetTop;
      x-=_elem.scrollLeft;y-=_elem.scrollTop;
      _elem=_elem.parentNode;
    }
    return [x,y];
  },

  // these two are created in _init
  //getStyle: function(_id,_key,_bypass){},
  //_flushStyleCache: function(_id){},
  
  getOpacity: function(_id){
    var _this, _opacity, _try_opacity, _getStyle;
    _this = ELEM;
    _getStyle = _this.getStyle;
    // old safari (1.x):
    if (_opacity = _getStyle(_id,'-khtml-opacity')) {
      return parseFloat(_opacity);
    }
    // old mozilla (ff 1.0 and below):
    if (_opacity = _getStyle(_id,'-moz-opacity')) {
      return parseFloat(_opacity);
    }
    _try_opacity = _getStyle(_id,'opacity',true);
    if (_opacity = _try_opacity || (_try_opacity==0)) {
      return parseFloat(_opacity);
    }
    if (_opacity = (_this._elements[_id].currentStyle['filter'] || '').match(/alpha\(opacity=(.*)\)/)) {
      if(_opacity[1]) {
        return parseFloat(_opacity[1]) / 100;
      }
    }
    return 1.0;
  },
  
  setOpacity: function(_id, _value){
    var _this = ELEM;
    if (_value == 1 && is_ie) {
      _this._elements[_id].style.setAttribute('filter',_this.getStyle(_id,'filter', true).replace(/alpha\([^\)]*\)/gi,''));
    } else {  
      if(_value < 0.00001){
        _value = 0;
      }
      if(_this._is_ie) {
        _this._elements[_id].style.setAttribute('filter',_this.getStyle(_id,'filter',true).replace(/alpha\([^\)]*\)/gi,'')+'alpha(opacity='+_value*100+')');
      } else {
        _this._elements[_id].style.setProperty('opacity',_value,'');
      }
    }
  },
  
  getIntStyle: function(_id,_key){
    var _value = ELEM.getStyle(_id,_key);
    return parseInt(_value,10);
  },
  setBoxCoords: function(_id,_coords){
    ELEM.setStyle(_id,'left',_coords[0]+'px');
    ELEM.setStyle(_id,'top',_coords[1]+'px');
    ELEM.setStyle(_id,'width',_coords[2]+'px');
    ELEM.setStyle(_id,'height',_coords[3]+'px');
  },
  
  getExtraWidth: function(_id){
    var _int = ELEM.getIntStyle;
    return _int(_id,'padding-left')+_int(_id,'padding-right')+_int(_id,'border-left-width')+_int(_id,'border-right-width');
  },
  
  getExtraHeight: function(_id){
    var _int = ELEM.getIntStyle;
    return _int(_id,'padding-top')+_int(_id,'padding-bottom')+_int(_id,'border-top-width')+_int(_id,'border-bottom-width');
  },
  
  setFPS: function(_fps){
    ELEM._minDelay = 1000/_fps;
  },
  setSlowness: function(_slowness){
    // we should replace this with an
    // actual browser speed benchmark
    ELEM._slowness = _slowness;
  },
  setIdleDelay: function(_idleDelay){
    ELEM._idleDelay = _idleDelay;
  },
  
  flushLoop: function(_delay){
    //console.log('flushLoop('+_delay+')');
    var _this=ELEM; _this._flushLoopCount++;
    clearTimeout(_this._timer);
    if(_this._flushing){
      _delay *= 2;
      _this._timer = setTimeout('ELEM.flushLoop('+_delay+');',_delay);
      return;
    } else {
      if(!_this._needFlush){
        // goto sleep mode
        _this._timer = setTimeout('ELEM.flushLoop('+_delay+');',_this._idleDelay);
        return;
      }
      _delay = parseInt(_this._slowness*(_this._flushTime/_this._flushCounter), 10);
      if(_delay<_this._minDelay||!_delay){_delay=_this._minDelay;}
      _this._flushing = true;
      _this._timer = setTimeout('ELEM.flushLoop('+_delay+');',_delay);
    }
    _this._flushTime -= new Date().getTime();
    var _loopMaxL, _currTodo, i, _styleTodo;
    _elemTodo=_this._elemTodo;
    _loopMaxL=_elemTodo.length;
    _currTodo=_elemTodo.splice(0,_loopMaxL);
    //console.log('flushing:');
    var _flushStartTime = new Date().getTime();
    for(i=0;i<_loopMaxL;i++){
      _this._flushLoopFlushed++;
      var _id = _currTodo.pop();
      _this._elemTodoH[_id]=false;
      _this._flushStyleCache(_id);
      _this._flushAttrCache(_id);
    }
    _this._flushCounter++;
    _this._flushTime += new Date().getTime();
    if(_this._elemTodo.length==0&&_this._needFlush){
      _this._needFlush=false;
    }
    //console.log('flush took '+(new Date().getTime()-_flushStartTime));
    _this._flushing = false;
  },
  _flushAttrCache: function(_id){
    var _this=ELEM,_attrTodo=_this._attrTodo[_id],_attrCache=_this._attrCache[_id],
        _elem=_this._elements[_id],//_elemP=_elem.setAttribute,
        _key,_val,i,_iMax=_attrTodo.length,_currTodo=_attrTodo.splice(0,_iMax);
    for(i=0;i!=_iMax;i++){
      _key=_currTodo.pop();
      _val=_attrCache[_key];
      //console.log('id:'+_id+' key:'+_key+' val:'+_val);
      //console.log(_elem);
      //console.log('real val:'+_this.getAttr(_id,_key,true));
      _elem.setAttribute(_key,_val);
      //_elem[_key]=_val;
    }
  },
  getAttr: function(_id,_key,_bypass){
    var _this=ELEM,_attrVal=_this._attrCache[_id][_key],_val;
    //console.log('_attrVal:'+_attrVal);
    if(_attrVal!==undefined&&!_bypass){return _attrVal;}
    var _elem=_this._elements[_id];
    if(_elem.getAttribute(_key)==null){
      _elem[_key]='';
    }
    _val=_elem.getAttribute(_key);
    //console.log(_val+'=getAttr(id:'+_id+', key:'+_key+')');
    _this._attrCache[_id][_key]=_val;
    return _val;
  },
  setAttr: function(_id,_key,_value,_bypass){
    var _differs,_this=ELEM,_attrTodo=_this._attrTodo[_id],_attrCache=_this._attrCache[_id];
    _differs=_value!=_this.getAttr(_id,_key);
    if(_differs){
      _attrCache[_key]=_value;
      if(_bypass){_this._elements[_id].setAttribute(_key,_value);}
      else{
        if(_attrTodo.indexOf(_key)==-1){_attrTodo.push(_key);}
        if(!_this._elemTodoH[_id]){
          _this._elemTodo.push(_id);
          _this._elemTodoH[_id]=true;
          _this._checkNeedFlush();
        }
      }
    }
  },
  delAttr: function(_id,_key){
    var _differs,_this=ELEM,_attrTodo=_this._attrTodo[_id],_attrCache=_this._attrCache[_id];
    delete _attrCache[_key];
    _this._elements[_id].removeAttribute(_key);
    if(_attrTodo.indexOf(_key)!=-1){_attrTodo.splice(_attrTodo.indexOf(_key,1));}
    if(_this._elemTodoH[_id]){
      _this._elemTodo.splice(_this._elemTodo.indexOf(_id,1));
      _this._elemTodoH[_id]=false;
      _this._checkNeedFlush();
    }
  },
  
  // class name functions mostly ripped from moo.fx's prototype.lite.js
  hasClassName: function(_elemId, _className) {
    //_element = $(_element);
    var _element = ELEM.get(_elemId);
    if (!_element) return;
    
    var _hasClass = false;
    var _classNames = _element.className.split(' ');
    
    for(var i = 0; i < _classNames.length; i++) {
      if (_classNames[i] == _className) {
        _hasClass = true;
      }
    }
    
    return _hasClass;
  },

  addClassName: function(_elemId, _className) {
    //_element = $(_element);
    var _element = ELEM.get(_elemId);
    if (!_element) return;
    
    ELEM.removeClassName(_elemId, _className);
    _element.className += ' ' + _className;
  },
  
  removeClassName: function(_elemId, _className) {
    //_element = $(_element);
    var _element = ELEM.get(_elemId);
    if (!_element) return;
    
    var _newClassName = '';
    var _classNames = _element.className.split(' ');
    
    for(var i = 0; i < _classNames.length; i++) {
      if (_classNames[i] != _className){
        if (i > 0) _newClassName += ' ';
        _newClassName += _classNames[i];
      }
    }
    
    _element.className = _newClassName;
  },
  
  _checkNeedFlush: function(){
    var _this=ELEM;
    if(!_this._needFlush){
      _this._needFlush=true;
      if(!_this._flushing){
        clearTimeout(_this._timer);
        _this._timer = setTimeout('ELEM.flushLoop('+_this._minDelay+');',_this._minDelay);
      }
    }
  },
  // sets style key to value of id, bypass sets immediately
  printStats: function(){
    var _this=ELEM,_recycler=_this._recycler,i=0,_tagName,_tagLen,_countIn,_countOut;
    console.log('Recycler efficiency:');
    var _allCountOut=0;
    for(;i!=_recycler._tagNames.length;i++){
      _tagName=_recycler._tagNames[i];
      console.log(' tagName: '+_tagName);
      _tagLen=_recycler[_tagName].length;
      console.log('   length  : '+_tagLen);
      _countIn=_recycler[_tagName]._countIn;
      console.log('   countIn : '+_countIn);
      _countOut=_recycler[_tagName]._countOut;
      _allCountOut+=_countOut;
      console.log('   countOut: '+_countOut);
      console.log('--------------------------------');
    }
    console.log('================================');
    console.log('Flushing efficiency:');
    console.log('  total real time spent: '+_this._flushTime+'ms');
    console.log('  total times called:    '+_this._flushLoopCount);
    console.log('  total times flushed:   '+_this._flushCounter);
    console.log('  total items flushed:   '+_this._flushLoopFlushedCount);
    console.log('  total real style sets: '+_this._flushStylCount);
    console.log('================================');
    console.log('setStyle efficiency:');
    console.log('  total times called:    '+_this._setStyleCount);
    console.log('  total times non-cache: '+_this._setStyleDiffCount);
    console.log('================================');
    console.log('getStyle efficiency:');
    console.log('  total times called:    '+_this._getStyleCount);
    console.log('  total times non-cache: '+_this._getStyleMissCount);
    console.log('================================');
    console.log('Summary:');
    console.log('  recycler saved '+(_allCountOut)+' of '+_this._makeCount+' ('+Math.round(_allCountOut/_this._makeCount*100)+'%) document.createElement calls');
    console.log('  style buffer saved '+(_this._setStyleDiffCount-_this._flushStylCount)+' of '+_this._setStyleDiffCount+' ('+Math.round(((_this._setStyleDiffCount-_this._flushStylCount)/_this._setStyleDiffCount)*100)+'%) non-cached DOM style sets');
    console.log('  style cache saved '+(_this._setStyleCount-_this._setStyleDiffCount)+' of '+_this._setStyleCount+' ('+Math.round(((_this._setStyleCount-_this._setStyleDiffCount)/_this._setStyleCount)*100)+'%) DOM style sets');
    console.log('  style cache saved '+(_this._getStyleCount-_this._getStyleMissCount)+' of '+_this._getStyleCount+' ('+Math.round(((_this._getStyleCount-_this._getStyleMissCount)/_this._getStyleCount)*100)+'%) DOM style gets');
    console.log('  style buffer and cache saved '+(_this._setStyleCount-_this._flushStylCount)+' of '+_this._setStyleCount+' ('+Math.round(((_this._setStyleCount-_this._flushStylCount)/_this._setStyleCount)*100)+'%) total DOM style sets');
  },
  setStyle: function(_id,_key,_value,_bypass){
    var _this=ELEM,_cached=_this._styleCache[ _id ],
        _elems=_this._elements,_differs,_styleTodo;
    _this._setStyleCount++;
    //console.log('setStyle(id:',_id,',key:',_key,',value:',_value,')');
    _differs=_value!==_cached[_key];//;_this.getStyle(_id,_key);
    if(_differs){
      _this._setStyleDiffCount++;
      _cached[_key]=_value;
      if(_bypass){
        if(_key=='opacity'){_this.setOpacity(_id,_value);}
        else{_this._is_ie?(_elems[_id].style.setAttribute(_key.replace(/((-)([a-z])(\w))/g,function($0,$1,$2,$3,$4){return $3.toUpperCase()+$4;}),_cached[_key])):(_elems[_id].style.setProperty(_key,_cached[_key],''));}
      } else {
        _elemTodoH=_this._elemTodoH;
        _styleTodo=_this._styleTodo[_id];
        if(_styleTodo.indexOf(_key)==-1){_styleTodo.push(_key);}
        if(!_elemTodoH[_id]){
          _this._elemTodo.push(_id);
          _elemTodoH[_id]=true;
          _this._checkNeedFlush();
        }
      }
    }
  },
  
  // creates a new dom node inside _targetId
  // _tagName is a string (eg 'div', 'span' or 'img'
  // returns id
  // _target defaults to document.body's id: 0
  // _tagName defaults to 'div'
  make: function(_targetId,_tagName){
    if( _targetId === undefined ){
      _targetId = 0;
    }
    if( _tagName === undefined ){
      _tagName = 'DIV';
    } else {
      _tagName = _tagName.toUpperCase();
    }
    var _this=ELEM,_elem,_id;
    _this._makeCount++;
    if(_this._recycler[_tagName]){
      if(_this._recycler[_tagName].length!=0){
        // Recycle the id of a previously deleted element
        _id = _this._recycler[_tagName].pop();
        _this._recycler[_tagName]._countOut++;
        _elem = _this._elements[_id];
        //_elem.innerHTML='';
        /*
        if(_elem.tagName!=_tagName){
          _elem.outerHTML='<'+_tagName+'></'+_tagName+'>';
        }
        */
        if(_this._blockElems.indexOf(','+_tagName+',')!=-1){
          _this.setCSS(_id,'display:block;');
        } else {
          _this.setCSS(_id,'display:inline;');
        }
        _this.append(_id,_targetId);
        return _id;
      }
    }
    _elem = document.createElement(_tagName);
    _this._elements[_targetId].appendChild(_elem);
    _id = _this._add(_elem);
    _this._initCache(_id);
    return _id;
  },
  
  _init: function(){
    var _this=ELEM,_cmdStr, _cmdResult;
    var _getStyleTmpl = [
      // idx   source
      /*  0 */ "ELEM.getStyle=function(_id,_key,_bypass){",
      /*  1 */   "var _this=ELEM,_cached=_this._styleCache[_id],_retval;_this._getStyleCount++;",
      /*  2 */   "if((_cached[_key]===undefined)||_bypass){",
      /*  3 */     "if(!_bypass){_this._getStyleMissCount++;}",
      /*  4 */     "if((_key=='opacity')&&_bypass){_retval=_this.getOpacity(_id);}",
      /*  5 */     "else{",
      
            /*  idx:6 for non-ie */
      /*  6 */       "_retval=document.defaultView.getComputedStyle(_this._elements[_id],null).getPropertyValue(_key);",
      
            /*  idx:7,8,9 for ie */
      /*  7 */       "_camelName=_key.replace(/((-)([a-z])(\\w))/g,function($0,$1,$2,$3,$4){",
      /*  8 */         "return $3.toUpperCase()+$4});",
      /*  9 */       "_retval=_this._elements[_id].currentStyle[_camelName];",
      
      /* 10 */     "}_cached[_key]=_retval;",
      /* 11 */   "}return _cached[_key];};"
    ];
    if(_this._is_ie){
      _getStyleTmpl.splice(6,1);
    } else {
      _getStyleTmpl.splice(7,3);
    }
    eval(_getStyleTmpl.join(''));
    
    var _flushStyleCacheTmpl = [
      // idx   source
      /*  0 */ "ELEM._flushStyleCache=function(_id){",
      /*  1 */   "var _this=ELEM,_styleTodo=_this._styleTodo[_id],_cached=_this._styleCache[_id],_elem=_this._elements[_id],_elemS,_loopMaxP,_cid,_key,_currTodo,_retval;",
      /*  2 */   "if(!_elem){return;}",
      /*  3 */   "_elemS=_elem.style;",
      /*  4 */   "_loopMaxP=_styleTodo.length;",
      /*  5 */   "_currTodo=_styleTodo.splice(0,_loopMaxP);",
      /*  6 */   "for(_cid=0;_cid!=_loopMaxP;_cid++){",
      /*  7 */     "_key=_currTodo.pop();_this._flushStylCount++;",
      /*  8 */     "if(_key=='opacity'){_retval=_this.getOpacity(_id,_cached[_key]);}else{",
            /*  idx:  9 for ie */

                     //"alert(_cached[_key]);eval('_elemS.'+_key.replace(/((-)([a-z])(\\w))/g,function($0,$1,$2,$3,$4){return $3.toUpperCase()+$4})+'=\"'+_cached[_key]+'\";');}}};",
                     //"_elemS.cssText+=_key+':'+_cached[_key]+';';}}};",
                     //"var _keyIE=_key.replace(/((-)([a-z])(\\w))/g,function($0,$1,$2,$3,$4){return $3.toUpperCase()+$4});\nalert(_keyIE);\n_elemS[_keyIE]=_cached[_key];}}};",
      /*  9 */       "try{_elemS.setAttribute(_key.replace(/((-)([a-z])(\\w))/g,function($0,$1,$2,$3,$4){return $3.toUpperCase()+$4}),_cached[_key]);}catch(e){}}}};",

            /*  idx: 10 for non-ie */
      /* 10 */       "_elemS.setProperty(_key,_cached[_key],'');}}};"
    ];
    if(_this._is_ie){
      _flushStyleCacheTmpl.pop();
    } else {
      _flushStyleCacheTmpl.splice(9,1);
    }
    eval(_flushStyleCacheTmpl.join(''));
    
    _this._add(document.body);
    
    // creates an 'trash' for div elements
    _this._trashId = _this.make(0,'div');
    _this.setCSS(_this._trashId,"display:none;");
    _this.setAttr(_this._trashId,'id','trashcan_'+_this._trashId);
    
    _this._timer = setTimeout('ELEM.flushLoop('+_this._minDelay+')',_this._minDelay);
    
    if(!_this._domLoadQueue){return;}
    
    while(_this._domLoadQueue.length!=0){
      _cmdStr = _this._domLoadQueue.shift();
      if(typeof _cmdStr == 'string'){
        _cmdResult = eval(_cmdStr);
        if(typeof _cmdResult == 'string'){
          _this._domLoadQueue.push( _cmdResult );
        }
      }
    }
    _this._initDone = true;
  },
  
  _warmup: function(){
    _this = ELEM;
    _this._is_ie=(document.all&&navigator.userAgent.indexOf("Opera")==-1);
    _this._is_ie6=(_this._is_ie&&navigator.userAgent.indexOf("MSIE 6")!=-1);
    _this._is_ie7=(_this._is_ie&&navigator.userAgent.indexOf("MSIE 7")!=-1);
    _this._is_safari=(navigator.userAgent.indexOf("KHTML")!=-1);
    _this._is_ff=(navigator.userAgent.indexOf("Firefox")!=-1);
    _this._is_opera=(navigator.userAgent.indexOf("Opera")!=-1);
    _this._domWaiter();
  },
  // adds items to eval after the dom is done:
  _domLoader: function(_cmdStr){
    var _this = ELEM;
    if(typeof _cmdStr == 'string'){
      if(_this._initDone==true){
        eval(_cmdStr);
      } else {
        _this._domLoadQueue.push(_cmdStr);
      }
    }
  },
  _domWaiter: function(){
    var _isloaded = false;
    var _this = ELEM;
    // A hack for ie (ripped from DomLoaded.js)
    // http://www.cherny.com/demos/onload/domloaded.js
    if(_this._is_ie){
      var _ie_proto = "javascript:void(0)";
      if (location.protocol == "https:"){
        _ie_proto = "src=//0";
      }
      document.write("<scr"+"ipt id=__ie_onload defer src=" + _ie_proto + "><\/scr"+"ipt>");
      var _ie_script = document.getElementById("__ie_onload");
      _ie_script.onreadystatechange = function(){
        if(this.readyState == "complete"){
          ELEM._domLoadStatus = true;
          ELEM._init();
          delete ELEM._domLoadQueue;
          clearTimeout( ELEM._domLoadTimer );
          delete ELEM._domLoadTimer;
        }
      };
      // the event will trigger on ie, so we don't have to keep on polling:
      return;
    }
    
    // Safari / KHTML readyness detection:
    else if((/KHTML|WebKit/i.test(navigator.userAgent)) &&
            (/loaded|complete/.test(document.readyState))) {
      _this._domLoadStatus = true;
    }
    
    // Works for Mozilla:
    else if(document.body){
      _this._domLoadStatus = true;
    }
    
    if(!_this._domLoadStatus){
      _this._domLoadTimer = setTimeout('ELEM._domWaiter()',100);
    } else {
      _this._init();
      delete _this._domLoadQueue;
      clearTimeout(_this._domLoadTimer);
      delete _this._domLoadTimer;
    }
  }
};
ELEM._constructor();
LOAD = ELEM._domLoader;
ELEM._warmup();

// backwards-compatibility
onloader = function( _cmdStr ){
  console.log('WARN: the onloader(..) call is deprecated');
  ELEM._domLoader( _cmdStr );
};
elem_bind = function( _elemId ){
  console.log('WARN: the elem_bind(..) call is deprecated');
  return ELEM.bindId( _elemId );
};
elem_add = function( _elem ){
  console.log('WARN: the elem_add(..) call is deprecated');
  return ELEM.bind( _elem );
};
elem_get = function( _elemId){
  console.log('WARN: the elem_get(..) call is deprecated');
  return ELEM.get( _elemId );
};
elem_set = function( _elemId, _html ){
  console.log('WARN: the elem_set(..) call is deprecated');
  return ELEM.setHTML( _elemId, _html );
};
elem_del = function( _elemId ){
  console.log('WARN: the elem_del(..) call is deprecated');
  return ELEM.del( _elemId );
};

// deprecated, please don't use
elem_replace = function( _elemId, _elem ){
  console.log('WARN: the elem_replace(..) call is deprecated');
  return ELEM._replace( _elemId, _elem );
};

elem_append = function( _pid, _id ){
  console.log('WARN: the elem_append(..) call is deprecated');
  return ELEM.append( _id, _pid );
};
elem_mk = function(_pid,_type){
  console.log('WARN: the elem_mk(..) call is deprecated');
  return ELEM.make( _pid, _type );
};

styl_get = function(_id, _name){
  console.log('WARN: the styl_get(..) call is deprecated');
  return ELEM.getStyle( _id, _name );
};
prop_get = function(_id, _name, _direct){
  console.log('WARN: the prop_get(..) call is deprecated');
  return ELEM.getStyle( _id, _name, _direct );
};

styl_set = function(_id,_name,_value){
  console.log('WARN: the styl_get(..) call is deprecated');
  return ELEM.setStyle( _id, _name, _value );
};
prop_set = function(_id,_name,_value,_direct){
  console.log('WARN: the prop_set(..) call is deprecated');
  return ELEM.setStyle( _id, _name, _value, _direct );
};
prop_get_extra_width = function(_id) {
  console.log('WARN: the prop_get_extra_width(..) call is deprecated');
  return ELEM.getExtraWidth(_id);
};
prop_get_extra_height = function(_id) {
  console.log('WARN: the prop_get_extra_height(..) call is deprecated');
  return ELEM.getExtraHeight(_id);
};










