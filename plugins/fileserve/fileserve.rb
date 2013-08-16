
# The FileServe is accessible as +@plugins.fileserve+ and just +fileserve+ from other plugins.
#
# = FileServe automatically server files from your project files path, if it exists.
# You can add paths with the #serve method, which takes the mount path and filesystem path as arguments.
# If you want to unmount a mountpoint, just define path as false.
class FileServe < Servlet

  # This plugin prefers the mimemagic gem for identifying files.
  begin
    require 'mimemagic'
    @@has_magic = true
  rescue LoadError
    warn "Please install the 'mimemagic' gem"
    @@has_magic = false
  end

  # Setup by serving '/files' from the project 'files' directory.
  def open
    super
    @dirs = {}
    @opts = {}
    @default_opts = {
      :content_type => 'binary/octet-stream',
      :chunk_max => 256*1024 # 256kB
    }
    default_path = File.expand_path( 'files', RSence.env_path )
    mount( '/files', default_path )
  end

  # Returns which mount point the uri belongs to. Return nil, if none.
  def mountpt_of( uri )
    @dirs.each_key do |mountpt|
      return mountpt if uri.start_with? mountpt
    end
    nil
  end

  # Returns the option of uri, or default if none defined
  def uri_opt( uri, option )
    return nil unless @default_opts.include? option
    mountpt = mountpt_of( uri )
    return nil unless mountpt
    return @opts[mountpt][option] if @opts[mountpt].has_key? option
    @default_opts[option]
  end

  # Returns the mount state of mountpt
  def mounted?( mountpt ); @dirs.has_key?( mountpt ); end

  # Mounts and unmounts filesystem paths on mountpt.
  # Options may include the following:
  # :content_type     Default content_type, if mimemagic is not installed
  # :chunk_max        Max size of chunk in bytes. For streaming purposes, set it fairly small.
  def mount( mountpt, path=false, options={} )
    if not path
      @dirs.delete path
      @opts.delete path
      true
    elsif File.exist? path and File.directory? path
      @dirs[mountpt] = path
      @opts[mountpt] = options
      true
    else
      warn "FileServe#serve: no such path: #{path}"
    end
    false
  end

  # Shortcut for unmounting
  def unmount( mountpt ); mount( mountpt, false ); end

  # Converts uri to filesystem path from mounted dirs. Returns nil, if no match.
  def uri2path( uri )
    mountpt = mountpt_of( uri )
    return nil unless mountpt
    file_path = valid_file?( mountpt, uri, true )
    return file_path if file_path
    nil
  end

  # Returns false, unless the uri at mountpt exists, is a file and is readable.
  # If return_path is true, returns the path instead of true.
  def valid_file?( mountpt, uri, return_path=false )
    mount_path = @dirs[mountpt]
    file_path = File.expand_path( uri[(mountpt.length+1)..-1], mount_path )
    return false unless file_path.start_with? mount_path
    return false unless File.exist? file_path
    return false unless File.readable? file_path
    return false unless File.file? file_path
    return true unless return_path
    file_path
  end

  # Checks if a file exists, based on uri.
  def has_file?( uri )
    mountpt = mountpt_of( uri )
    return false unless mountpt
    valid_file?(mountpt,uri)
  end

  # @private Checks if a uri and method combination matches.
  def match( uri, method )
    return has_file? uri if method == :get
    false
  end

  # @private Returns a 404 error
  def res404( uri, res )
    res.status = 404
    res['Content-Type'] = 'text/plain'
    body = "# 404\r\nNo such file: #{uri}"
    res['Content-Length'] = body.bytesize
    res.body = body
  end

  # @private Handles file serving, supports ranges
  def serve_file( uri, res, range=nil )
    file_path = uri2path( uri )
    fstat = File.stat( file_path )
    fh = File.open(file_path,'rb:binary')
    if @@has_magic
      res['Content-Type'] = MimeMagic.by_magic( fh )
    else
      res['Content-Type'] = uri_opt( uri, :content_type )
    end
    ( file_len, file_mtime ) = [ fstat.size, httime(fstat.mtime) ]
    res['Last-Modified'] = file_mtime
    if range
      ( range_min, range_max ) = range
      range_max = file_len - 1  if range_max.nil?
      range_len = range_max - range_min + 1
      chunk_max = uri_opt( uri, :chunk_max )
      if range_len > chunk_max
        range_len = chunk_max
        range_max = range_min+range_len
      end
      if file_len > range_len
        res.status = 206
        res['Content-Length'] = range_len
        res['Accept-Ranges'] = 'bytes'
        res['Content-Range'] = "bytes #{range_min}-#{range_max}/#{file_len}"
        fh.seek(range_min) unless range_min == 0
        file_data = fh.read(range_len)
      else
        range = false
      end
    end
    unless range
      res.status = 200
      res['Content-Length'] = file_len
      fh.seek(0)
      file_data = fh.read
    end
    fh.close
    res.body = file_data
  end

  # @private Responder of get requests
  def get( req, res, ses )
    uri = req.path
    head = req.header
    if head['range']
      req_range = head['range']
      ( range_unit, range_rest ) = req_range.split('=')
      ( range_start, range_end ) = range_rest.split('-')
      range_start = range_start.to_i
      range_end   = range_end.to_i unless range_end.nil?
      range = [range_start,range_end]
      if range_unit != 'bytes'
        warn "Unknown range unit: #{range_unit.inspect}"
        range = nil
      end
    else
      range = nil
    end
    return res404(uri,res) unless has_file?( uri )
    serve_file(uri,res,range)
  end
end
