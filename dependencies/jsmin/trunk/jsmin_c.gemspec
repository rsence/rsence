Gem::Specification.new do |s|
  s.name      = 'jsmin_c'
  s.author    = 'Domen Puncer'
  s.email     = 'domen@cba.si'
  s.version   = '1.0.0'
  s.date      = '2010-02-26'
  s.homepage  = 'http://www.riassence.org/'
  s.summary   = 'Riassence JSMin Wrapper'
  s.has_rdoc  = true
  s.require_path = 'jsmin_c'
  s.description = <<END
This is a ruby -> C wrapper extension for Douglas Crockford's awesome jsmin.
It's just as fast as the original (orders of magnitude faster than the pure ruby version in the 'jsmin' gem).
This used to be a fixed part of the Riassence Framework, but it's distributed as a separate gem now.
END
  s.files = %w(
    License.txt
    README.rdoc
    extconf.rb
    jsmin_c.c
    jsmin_c.gemspec
    test_jsmin.rb
  )
  s.files.reject! { |fn| fn.include? ".svn" }
  s.files.reject! { |fn| fn.include? ".git" }
  s.test_file = 'test_jsmin.rb'
  s.required_ruby_version = '>= 1.8.6'
  s.extensions = [
    'extconf.rb'
  ]
end

