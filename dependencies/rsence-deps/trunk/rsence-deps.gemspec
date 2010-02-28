Gem::Specification.new do |s|
  s.name      = 'rsence-deps'
  s.author    = 'Juha-Jarmo Heinonen'
  s.email     = 'o@rsence.org'
  s.version   = '934'
  s.date      = '2010-02-27'
  s.homepage  = 'http://www.riassence.org/'
  s.summary   = 'Riassence Framework Dependencies'
  s.has_rdoc  = true
  s.description = <<END
This is a dummy gem containing a list of dependencies for the Riassence Framework.
More info: http://riassence.org/
END
  s.add_dependency( 'rake', '>= 0.8.7')
  s.add_dependency( 'highline', '>= 1.5.2')
  s.add_dependency( 'rack', '>= 1.1.0')
  s.add_dependency( 'mongrel', '>= 1.1.5')
  s.add_dependency( 'soap4r', '>= 1.5.8')
  s.add_dependency( 'rmagick', '>= 2.12.2')
  s.add_dependency( 'json', '>= 1.2.1')
  s.add_dependency( 'sequel', '>= 3.8.0')
  s.add_dependency( 'sqlite3-ruby', '>= 1.2.5')
  s.add_dependency( 'cssmin', '>= 1.0.2')
  s.add_dependency( 'randgen', '>= 1.0.3')
  s.add_dependency( 'jsmin_c', '>= 1.0.0')
  s.add_dependency( 'jscompress', '>= 1.0.2')
  s.add_dependency( 'html_min', '>= 0.1.2')
  s.files = %w(
    README.rdoc
  )
    # test_rsence_deps.rb
  # s.test_file = 'test_rsence_deps.rb'
  s.required_ruby_version = '>= 1.8.7'
end



#deps = %w( rake highline rack mongrel soap4r rmagick json sequel sqlite3-ruby cssmin randgen jsmin_c jscompress html_min )