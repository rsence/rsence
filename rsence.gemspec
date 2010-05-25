
Gem::Specification.new do |s|
  s.name      = 'rsence'
  s.author    = 'Riassence Inc.'
  s.email     = 'info@rsence.org'
  s.version   = File.read('VERSION')
  s.date      = Time.now
  s.homepage  = 'http://www.rsence.org/'
  prerelease  = s.version.to_s.end_with?('.pre')
  normalized_version = s.version.to_s.to_f
  s.summary   = "#{'Pre-' if prerelease}Release #{normalized_version} version of the RSence framework."
  s.has_rdoc  = true
  s.description = <<-END
RSence is a RIA framework designed for responsive GUI applications on the web.

RSence is a flexible and high-performance RIA framework aimed on building responsive, scalable and over-all as high-performance GUI Applications as possible with the chosen technologies.

RSence includes a server for backend tasks and client suppert as well as a Javascript GUI framework to provide responsive user interfaces.

The purpose of the server is to provide a highly optimized yet easy to use Ruby framework for writing applications containing all their assets needed as self-contained plugins bundles. The bundles enable easy distribution and maintenance of RSence projects.

RSence is not primarily targeted as an engine for plain old html web sites, there are plenty of other tools for that purpose and some of them are easily integrated into RSence.
END
  s.add_dependency( "rsence-deps", "958" )
  require 'rake'
  s.files = FileList[
    'bin/rsence',
    'lib/**/*',
    'setup/**/*',
    'conf/default_conf.yaml',
    'conf/default_strings.yaml',
    'conf/rsence_command_strings.yaml',
    'plugins/client_pkg/**/*',
    'plugins/index_html/**/*',
    'plugins/main/**/*',
    'plugins/ticket/**/*',
    'js/**/*',
    'README.rdoc',
    'INSTALL.rdoc',
    'LICENSE',
    'VERSION'
  ].to_a
  s.files.reject! { |fn| fn.start_with? "." }
  s.executables = [ 'rsence' ]
  s.default_executable = 'rsence'
  s.required_ruby_version = '>= 1.8.7'
end

