# -* coding: UTF-8 -*-
###
  # Riassence Core -- http://rsence.org/
  #
  # Copyright (C) 2009 Juha-Jarmo Heinonen <jjh@riassence.com>
  #
  # This file is part of Riassence Core.
  #
  # Riassence Core is free software: you can redistribute it and/or modify
  # it under the terms of the GNU General Public License as published by
  # the Free Software Foundation, either version 3 of the License, or
  # (at your option) any later version.
  #
  # Riassence Core is distributed in the hope that it will be useful,
  # but WITHOUT ANY WARRANTY; without even the implied warranty of
  # MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  # GNU General Public License for more details.
  #
  # You should have received a copy of the GNU General Public License
  # along with this program.  If not, see <http://www.gnu.org/licenses/>.
  #
  ###

=begin
 IndexHtmlPlugin is the servlet plugin that is responsible for initializing the "boot-strap page".
 
 It just loads, caches and sends the page for now.
=end
class IndexHtmlPlugin < ServletPlugin
  
  def match( uri, method )
    if uri == $config[:indexhtml_conf][:respond_address] and method == :get
      return true
    else
      return false
    end
  end
  
  def score
    return 1000 # allows overriding with anything with a score below 0
  end
  
  #def set_deps( deps )
  #  @deps = deps
  #  render_index_html
  #end
  
  def init
    $config[:indexhtml_conf][:instance] = self
  end
  
  def open
    @client_rev = $FILECACHE.client_rev
    #@deps = []
    @index_html_src = file_read( $config[:index_html][:index_tmpl] )
    loading_gif = File.read( File.join( @path, 'img/loading.gif' ) )
    @loading_gif_id = $TICKETSERVE.serve_rsrc( loading_gif, 'image/gif' )
    riassence_gif = File.read( File.join( @path, 'img/riassence.gif' ) )
    @riassence_gif_id = $TICKETSERVE.serve_rsrc( riassence_gif, 'image/gif' )
    render_index_html
  end
  
  def close
    $TICKETSERVE.del_rsrc( @riassence_gif_id )
    $TICKETSERVE.del_rsrc( @loading_gif_id )
  end
  
  def render_index_html
    
    @index_html = @index_html_src.clone
    
    @index_html.gsub!('__DEFAULT_TITLE__',$config[:indexhtml_conf][:loading_title])
    @index_html.gsub!('__LOADING_GIF_ID__',@loading_gif_id)
    @index_html.gsub!('__RIASSENCE_GIF_ID__',@riassence_gif_id)
    @index_html.gsub!('__CLIENT_REV__',@client_rev)
    @index_html.gsub!('__CLIENT_BASE__',File.join($config[:broker_urls][:h],@client_rev))
    @index_html.gsub!('__CLIENT_HELLO__',$config[:broker_urls][:hello])
    @index_html.gsub!('__NOSCRIPT__',$config[:indexhtml_conf][:noscript])
    
    deps_src = ''
    $config[:index_html][:deps].each do |dep|
      deps_src += %{<script src="#{dep}" type="text/javascript"></script>}
    end
    @index_html.gsub!('__SCRIPT_DEPS__',deps_src)
    
    @content_size = @index_html.size
  end
  
  def debug_rescan
    
    puts "re-buffering client files"
    begin
      $FILECACHE.check_scan
      @client_rev = $FILECACHE.client_rev
    rescue => e
      puts "=="*40 if $DEBUG_MODE
      puts "IndexHtml::FileCacheError: $FILECACHE.check_scan failed."
      if $DEBUG_MODE
        puts "--"*40
        puts e.message
        puts "  #{e.backtrace.join("\n  ")}"
        puts "=="*40
      end
    end
    
    unless ARGV.include?('-no-rescan')
      puts "re-scanning plugins."
      begin
        $PLUGINS.rescan()
      rescue => e
        puts "=="*40 if $DEBUG_MODE
        puts "IndexHtml::PluginsRescanError: $PLUGINS.rescan failed."
        if $DEBUG_MODE
          puts "--"*40
          puts e.message
          puts "  #{e.backtrace.join("\n  ")}"
          puts "=="*40
        end
      end
    end
    
    puts "re-rendering index html"
    render_index_html
    
  end
  
  ## Outputs a static web page.
  ## If $DEBUG_MODE is active, re-renders page and reloads filecache.
  def get(request, response, session)
    
    debug_rescan if $DEBUG_MODE
    
    response.status = 200
    response['content-type'] = 'text/html; charset=UTF-8'
    response['content-length'] = @content_size
    
    response.body = @index_html
  end
  
end

index_html = IndexHtmlPlugin.new

