Gem::Specification.new do |s|
  s.name      = 'html_min'
  s.author    = 'Domen Puncer'
  s.email     = 'domen@cba.si'
  s.version   = '0.1.0'
  s.date      = '2010-02-26'
  s.homepage  = 'http://www.riassence.org/'
  s.summary   = 'Riassence HTMLMin'
  s.has_rdoc  = true
  s.require_path = 'html_min'
  s.description = <<END
Simple C extension that squeezes HTML files quickly by removing white space.
This used to be a fixed part of the Riassence Framework, but it's distributed as a separate gem now.
END
  s.files = %w(
    License.txt
    README.rdoc
    extconf.rb
    html_min.c
    html_min.gemspec
  )
  s.files.reject! { |fn| fn.include? ".svn" }
  s.files.reject! { |fn| fn.include? ".git" }
  s.test_file = 'test_html_min.rb'
  s.required_ruby_version = '>= 1.8.6'
  s.extensions = [
    'extconf.rb'
  ]
end

