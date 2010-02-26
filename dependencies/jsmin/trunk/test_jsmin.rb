require "test/unit"
require "rubygems"
require "jsmin_c"

class TestJSMin < Test::Unit::TestCase
  
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
  
  
  @@test_output = "\nvar Something=Foo.extend({_fooBarLongName:function(_fooBar){if(!_fooBar){var _this=this;_this['_anotherLongName']();}\nelse{this._dontCompressMe();}},_anotherLongName:function(){var _this=this;_this.fooBarLongName(_this);},_dontCompressMe:function(){},dontCompressMeEither:'_thisShouldNotBeCompressed';});"
  
  def test_init
    jsmin = JSMin.new
  end
  
  def test_types
    jsmin = JSMin.new
    assert_equal( JSMin, jsmin.class )
    assert_equal( String, jsmin.minimize( @@test_input ).class )
  end
  
  def test_value
    jsmin = JSMin.new
    assert_equal( @@test_output, jsmin.minimize( @@test_input ) )
  end
  
end

