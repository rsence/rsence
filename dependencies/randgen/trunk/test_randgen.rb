require "test/unit"
require "rubygems"
require "randgen"

class TestRandgen < Test::Unit::TestCase
  def test_init
    rand = RandGen.new( 64 )
  end
  def test_types
    rand = RandGen.new( 64 )
    assert_equal( RandGen, rand.class )
    assert_equal( String, rand.gen.class )
    assert_equal( Array, rand.gen_many( 99 ).class )
  end
  def test_length
    rand = RandGen.new( 64 )
    assert_equal( 64, rand.gen.length )
    assert_equal( 100, rand.gen_many( 100 ).length )
  end
end

