
Gem::Specification.new do |s|
  s.name      = 'rsence'
  s.author    = 'Riassence Inc.'
  s.email     = 'info@rsence.org'
  s.version   = File.read('VERSION')
  s.date      = Time.now
  s.homepage  = 'http://www.rsence.org/'
  s.summary   = "Pre-Release 2.0 version of the RSence RIA GUI Framework. Don't use for production (yet)."
  s.has_rdoc  = (not s.version.to_s.end_with?('.pre')) # enable when release is ready
  # s.require_path = '.'
  s.description = <<-END
RSence is primarily a flexible and high-performance RIA framework aimed on building responsive, scalable and over-all as high-performance GUI Applications as possible with the chosen technologies. RSence uses the server for backend tasks and the client to provide responsive user interfaces. The server is a highly optimized Ruby framework for writing applications as plugin bundles containing all resources needed per plugin. The client is a highly optimized Javascript framework with an API similar to many object-oriented desktop frameworks. RSence is not primarily targeted for creating html web sites, there are plenty of other tools for that purpose.
END
  s.add_dependency( "rsence-deps", "957" )
  require 'rake'
  s.files = FileList[
    'bin/rsence',
    'lib/**/*',
    'setup/**/*',
    'conf/*',
    'plugins/client_pkg/**/*',
    'plugins/index_html/**/*',
    'plugins/main/**/*',
    'plugins/legacy/**/*',
    'plugins/ticketservices/**/*',
    'js/**/*',
    'README.rdoc',
    'INSTALL.rdoc',
    'LICENSE',
    'VERSION'
  ].to_a
  s.files.reject! { |fn| fn.start_with? "." }
  s.files.delete 'conf/local_conf.yaml'
  # puts s.files.inspect
  s.executables = [ 'rsence' ]
  s.default_executable = 'rsence'
  s.required_ruby_version = '>= 1.8.7'
end

