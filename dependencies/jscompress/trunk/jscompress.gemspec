Gem::Specification.new do |s|
  s.name      = 'jscompress'
  s.author    = 'Domen Puncer'
  s.email     = 'domen@cba.si'
  s.version   = '1.0.0'
  s.date      = '2010-02-26'
  s.homepage  = 'http://www.riassence.org/'
  s.summary   = 'Riassence JSCompress'
  s.has_rdoc  = true
  s.require_path = 'jscompress'
  s.description = <<END
C extension that replaces javascript variable names with short ones.
This used to be a fixed part of the Riassence Framework, but it's distributed as a separate gem now.
END
  s.files = %w(
    License.txt
    README.rdoc
    extconf.rb
    jscompress.c
    jscompress.gemspec
    test_jscompress.rb
  )
  s.files.reject! { |fn| fn.include? ".svn" }
  s.files.reject! { |fn| fn.include? ".git" }
  s.test_file = 'test_jscompress.rb'
  s.required_ruby_version = '>= 1.8.6'
  s.extensions = [
    'extconf.rb'
  ]
end

