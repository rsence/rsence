
KamppaRow = HControl.extend({
  flexRight: true,
  constructor: function(i,row,parent,options){
    this.base(new HRect(0,i*21+1,200,i*21+21),parent,options);
    if(i%2==1){this.setStyle('background-color','#999');}
    this.setStyle('border-bottom','1px solid #ccc');
    this.renderRow(row);
    this.url = row['url'];
  },
  renderRow: function(row){
    
    this.vuokra = new HStringView(new HRect(0,0,57,21),this,{value:row['vuokra']+' &euro;/kk'});
    this.vuokra.setStyle('text-align','right');
    this.vuokra.setStyle('font-size','10px');
    this.vuokra.setStyle('padding-right','3px');
    this.vuokra.setStyle('border-right','1px solid #ccc');
    
    
    this.osoite = new HStringView(new HRect(63,0,160,21),this,{value:row['kaupunginosa']});
    this.osoite.setStyle('border-right','1px solid #ccc',true);
    this.osoite.setStyle('text-align','center');
    this.osoite.setStyle('font-size','10px');
    if(row['sijainti']){
      ELEM.setAttr(this.osoite.elemId,'title',row['sijainti']);
    }
    
    var kokoonpano_str = row['pinta_ala'];
    this.kokoonpano = new HStringView(new HRect(163,0,220,21),this,{value:kokoonpano_str});
    this.kokoonpano.setStyle('font-size','10px');
    this.kokoonpano.setStyle('border-right','1px solid #ccc',true);
    if(this.kokoonpano.stringWidth(kokoonpano_str)>57){
      ELEM.setAttr(this.kokoonpano.elemId,'title',kokoonpano_str);
    }
    
    this.esittely = new HStringView(new HRect(223,0,320,21),this,{value:row['esittelyajat']});
    this.esittely.setStyle('font-size','10px');
    this.esittely.setStyle('border-right','1px solid #ccc',true);
    if(this.esittely.stringWidth(row['esittelyajat'])>97){
      ELEM.setAttr(this.esittely.elemId,'title',row['esittelyajat']);
    }
    
    this.vapautuu = new HStringView(new HRect(323,0,420,21),this,{value:row['vapautumis_pvm']});
    this.vapautuu.setStyle('font-size','10px');
    this.vapautuu.setStyle('border-right','1px solid #ccc',true);
    if(this.vapautuu.stringWidth(row['vapautumis_pvm'])>97){
      ELEM.setAttr(this.vapautuu.elemId,'title',row['vapautumis_pvm']);
    }
    
    var muuta_str = row['kokoonpano']+' ';
    if(row['erityisehdot']){muuta_str += row['erityisehdot'];}
    else if(row['kuvaus']){muuta_str += row['kuvaus'];}
    this.muuta = new (HStringView.extend({
      flexRight: true,
      mouseUp: function(x,y,z){
        window.open(this.parent.url);
      }
    }))(new HRect(423,0,480,21),this,{value:muuta_str,events:{mouseUp:true}});
    this.muuta.setStyle('font-size','10px');
    this.muuta.setStyle('cursor','pointer');
    
  }
});

KamppaButton = HButton.extend({
  mouseDown: function(){
    this.app.sortVal.set(this.value);
  }
});

KamppaHead = HView.extend({
  flexRight: true,
  constructor: function(parent){
    this.base(new HRect(0,0,100,21),parent);
    this.setStyle('background-color','#ccc');
  },
  draw: function(){
    var _drawn = this.drawn;
    this.base();
    if(!_drawn){
      this.sijainti   = new KamppaButton(new HRect(0,0,60,21),   this,{label:'Vuokra',events:{mouseDown:true},value:'k.vuokra'});
      this.osoite     = new KamppaButton(new HRect(60,0,160,21), this,{label:'Kaupunginosa',events:{mouseDown:true},value:'k.kaupunginosa'});
      this.kokoonpano = new KamppaButton(new HRect(160,0,220,21),this,{label:'Pinta-ala',events:{mouseDown:true},value:'k.pinta_ala'});
      this.esittely   = new KamppaButton(new HRect(220,0,320,21),this,{label:'Esittely',events:{mouseDown:true},value:'k.esittelyajat'});
      this.vapautuu   = new KamppaButton(new HRect(320,0,420,21),this,{label:'Vapautuu',events:{mouseDown:true},value:'k.vapautumis_pvm'});
      this.muuta      = new (HButton.extend({flexRight:true}))(new HRect(420,0,480,21),this,{label:'Muuta',enabled:false});
    }
  }
});

KamppaList = HView.extend({
  flexRight: true, flexBottom: true,
  constructor: function(rect,parent,kamppa_rows){
    this.base(rect,parent,kamppa_rows);
    var i=0,row;this.rows=[];
    for(;i<kamppa_rows.length;i++){
      row=kamppa_rows[i];
      this.rows[row['id']] = new KamppaRow(i,row,this);
    }
    
  },
  reorder: function(row_ids){
    var i=0,bgcolor;
    for(;i<row_ids.length;i++){
      if(i%2==1){bgcolor='#999';}
      else{bgcolor='#bbb';}
      this.rows[row_ids[i]].moveTo(0,i*21);
      this.rows[row_ids[i]].setStyle('background-color',bgcolor);
    }
  }
});

KamppaUI = HApplication.extend({
  constructor: function( kamppa_rows, sort_val_id ){
    this.base(200);
    this.sortVal = HVM.values[sort_val_id];
    this.head = new KamppaHead(this);
    this.view = new KamppaList(
      new HRect(0,21,100,100),
      this, kamppa_rows
    );
  },
  reload: function( kamppa_rows ){
    this.view.die();
    this.view = new KamppaList(
      new HRect(0,21,100,100),
      this, kamppa_rows
    );
  }
});


