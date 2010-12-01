
Gem::Specification.new do |s|
  s.name      = 'rsence'
  s.author    = 'Riassence Inc.'
  s.email     = 'info@rsence.org'
  s.version   = File.read('VERSION')
  s.date      = Time.now
  s.homepage  = 'http://www.rsence.org/'
  s.rubyforge_project = 'rsence-'
  prerelease  = s.version.to_s.end_with?('.pre')
  s.name      = 'rsence-pre' if prerelease
  normalized_version = s.version.to_s.to_f
  # there is no actual 2.1 version yet, so lets make the "gem install rsence-pre --pre" -> "gem install rsence-pre"
  if normalized_version >= 2.1 and prerelease
    s.version = s.version.to_s[0..-5]
  end
  s.summary   = "#{'Pre-' if prerelease}Release #{normalized_version} version of the RSence framework."
  s.has_rdoc  = 'yard'
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
    'setup/welcome/**/*',
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
    'LICENSE.txt',
    'docs/*.rdoc',
    'VERSION'
  ].to_a
  s.files.reject! { |fn| fn.start_with? "." }
  s.files.push '.yardopts'
  if prerelease
    s.files.push 'bin/rsence-pre'
    s.executables = [ 'rsence-pre' ]
    s.default_executable = 'rsence-pre'
  else
    s.executables = [ 'rsence' ]
    s.default_executable = 'rsence'
  end
  s.required_ruby_version = '>= 1.8.7'
end

