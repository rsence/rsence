require "test/unit"
require "rubygems"
require "jscompress"

class TestJSCompress < Test::Unit::TestCase
  
  @@test_input = %{
  
  var Something = Foo.extend({
    _fooBarLongName: function(_fooBar){
      if(!_fooBar){
        var _this = this;
        _this['_anotherLongName']();
      }
      else{
        this._dontCompressMe();
      }
    },
    _anotherLongName: function(){
      var _this = this;
      _this.fooBarLongName(_this);
    },
    _dontCompressMe: function(){},
    dontCompressMeEither: '_thisShouldNotBeCompressed';
  });
  
  }
  
  
  @@test_output = %{
  
  var Something = Foo.extend({
    _3: function(_1){
      if(!_1){
        var _0 = this;
        _0['_2']();
      }
      else{
        this._dontCompressMe();
      }
    },
    _2: function(){
      var _0 = this;
      _0.fooBarLongName(_0);
    },
    _dontCompressMe: function(){},
    dontCompressMeEither: '_thisShouldNotBeCompressed';
  });
  
  }
  
  @@reserved_names = [
    '_thisShouldNotBeCompressed',
    '_dontCompressMe'
  ]
  
  def test_init
    jscompress = JSCompress.new( @@reserved_names )
  end
  
  def test_types
    jscompress = JSCompress.new( @@reserved_names )
    assert_equal( JSCompress, jscompress.class )
    assert_equal( NilClass, jscompress.build_indexes(@@test_input).class )
    assert_equal( String, jscompress.compress(@@test_input).class )
    assert_equal( NilClass, jscompress.free_indexes().class )
  end
  
  def test_value
    jscompress = JSCompress.new( @@reserved_names )
    jscompress.build_indexes(@@test_input)
    assert_equal( @@test_output, jscompress.compress(@@test_input) )
    jscompress.free_indexes
  end
  
end

