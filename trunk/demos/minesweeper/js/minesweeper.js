
MineSweeper = HApplication.extend({
  MineGrid: HControl.extend({
    controlDefaults: HControlDefaults.extend({ events: { click: true } }),
    click: function( x, y, b ){
      if(b){ this.app.test( this ); }
      else{  this.app.flag( this ); }
    },
    drawSubviews: function(){
      this.gridElems = [];
      var i = 0, j, elemId, x, y;
      for( ; i < this.app.gridWidth ; i++ ){
        this.gridElems[i] = [];
        for( j = 0; j < this.app.gridHeight; j++ ){
          elemId = ELEM.make( this.elemId );
          x = i * this.app.gridItemSize + i;
          y = j * this.app.gridItemSize + j;
          ELEM.setCSS(
            elemId,
            'position:absolute;left:' + x + 
            'px;top:' + y + 'px;width:' + 
            this.app.gridItemSize + 
            'px;height:' + 
            this.app.gridItemSize + 'px;'
          );
          this.gridElems[i][j] = elemId;
        }
      }
      this.refreshValue();
    },
    refreshValue: function(){
      if( this.value instanceof Array && this.gridElems){
        var i = 0, j;
        for( ; i < this.app.gridWidth; i++ ){
          for( j = 0; j < this.app.gridHeight; j++ ){
            ELEM.setStyle(this.gridElems[i][j],'background-color',this.value[i][j]?'red':'green');
          }
        }
      }
    }
  }),
  flag: function( item ){
    console.log('flag');
  },
  test: function( item ){
    console.log('test');
  },
  constructor: function( rect, parent ){
    var label = 'Mine Sweeper';
    this.base( 20, label );
    this.gridWidth = 16;
    this.gridHeight = 16;
    this.gridItemSize = 24;
    var gridViewWidth  = (this.gridWidth*this.gridItemSize)+this.gridWidth,
        gridViewHeight = (this.gridHeight*this.gridItemSize)+this.gridHeight;
    this.view = HWindow.nu( [rect[0],rect[1],gridViewWidth+20,gridViewHeight+78], this, { label: label } );
    this.mines = HValue.nu( false, 10 );
    this.minesView = HStringView.nu(
      [8,8,96,24],
      this.view, {
        valueObj: this.mines
      }
    ).setStyle('border','1px solid #c00').setStyle('text-align','right');
    this.time = HValue.nu( false, 0 );
    this.timeView = HStringView.nu(
      [null,8,96,24,8,null],
      this.view, {
        valueObj: this.time
      }
    ).setStyle('border','1px solid #c00');
    this.restartButton = HButton.extend({
      click: function(){
        this.app.reset();
      }
    }).nu(
      [ 160, 6, 64, 24, 160, null ],
      this.view, {
        label: 'Reset Game',
        events: {
          click: true
        }
      }
    );
    this.grid = HValue.nu( false, this.populateGrid() );
    this.gridView = this.MineGrid.nu( 
      [ 8, 40, gridViewWidth, gridViewHeight ],
      this.view, {
        valueObj: this.grid
      }
    ).setStyle('background-color','blue');
  },
  reset: function(){
    this.time.set( 0 );
    this.mines.set( 10 );
    this.grid.set( this.populateGrid() );
  },
  populateGrid: function(){
    var grid = [], i = 0, j;
    for( ; i < this.gridWidth ; i++ ){
      grid[i] = [];
      for( j = 0; j < this.gridHeight ; j++ ){
        grid[i][j] = false;
      }
    }
    var x = null, y;
    for( i = 0; i < 10 ; i++ ){
      while( x === null || grid[x][y] === true ){
        x = Math.floor(Math.random()*this.gridWidth);
        y = Math.floor(Math.random()*this.gridHeight);
      }
      grid[x][y] = true;
    }
    return grid;
  }
});