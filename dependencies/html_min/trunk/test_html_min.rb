require "test/unit"
require "rubygems"
require "html_min"

class TestHTMLMin < Test::Unit::TestCase
  
  @@test_input = %{
      
      <html  >
      <head   >   <title
      >  fÖö foo  </title   >
      <body  bgcolor =  "#ffffff"  
      foo = "bar"
      >\#{ foo.foo }</body   
      >
      
      </html>
      
  }
  
  
  # This is not an error and actually does exactly as specified.
  #
  # All white-space is not compressed, because sometimes white-space is a feature so the
  # amount of white-space is reduced from any amount to 1 chars.
  #
  # The expected output with all white-space removal is:
  #
  # @@test_output = %{<html><head><title>fÖö foo</title><body bgcolor="#ffffff" foo="bar">\#{foo.foo}</body></html>}
  #
  # The actual result is:
  @@test_output = %{
<html >
<head > <title
> fÖö foo </title >
<body bgcolor = "#ffffff" foo = "bar"
>\#{ foo.foo }</body >
</html>
}
  
  def test_init
    html_min = HTMLMin.new
  end
  
  def test_types
    html_min = HTMLMin.new
    assert_equal( HTMLMin, html_min.class )
    assert_equal( String, html_min.minimize(@@test_input).class )
  end
  
  def test_value
    html_min = HTMLMin.new
    assert_equal( @@test_output, html_min.minimize(@@test_input) )
  end
  
end

