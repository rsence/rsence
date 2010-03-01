class ComponentSampler < GUIPlugin
  def init
    super
    @checker_pattern_gif_url = nil
  end
  def serve_checker_pattern_gif
    return if @checker_pattern_gif_url
    @checker_pattern_gif_url = $TICKETSERVE.serve_rsrc(
      file_read( 'js/checker_pattern.gif' ),
      'image/gif'
    )
  end
  def release_checker_pattern_gif
    return unless @checker_pattern_gif_url
    $TICKETSERVE.del_rsrc( @checker_pattern_gif_url )
  end
  def open
    super
    serve_checker_pattern_gif
  end
  def close
    super
    release_checker_pattern_gif
  end
  def parse_components( msg )
    components = {}
    components_path = File.join( @path, 'components' )
    Dir.entries( components_path ).each do |component_file|
      next if component_file.start_with?('.')
      next unless component_file.end_with?('.yaml')
      component_path = File.join( components_path, component_file )
      next unless File.file?( component_path )
      component_yaml = file_read( component_path )
      component_data = YAML.load( component_yaml )
      json_data = {
        'type' => 'GUITree',
        'version' => 0.4,
        'subviews' => YAML.load( component_data['yaml'] )['subviews']
      }
      component_data['json'] = json_data
      components[ component_file[0..-6] ] = component_data
    end
    return components
  end
  def gui_params( msg )
    return {
      :values => @gui.values( get_ses( msg ) ),
      :components => parse_components( msg ),
      :checker_pattern_gif_url => @checker_pattern_gif_url
    }
  end
end
ComponentSampler.new.register('component_sampler')
