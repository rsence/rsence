module RSence
  module Plugins
    module Localization
      def read_strings( fn='strings.yaml' )
        yaml_read( fn )
      end
      def fill_strs_raw_path( hash, path, val )
        key = path.shift
        if path.empty?
          hash[key] = val
        else
          hash[key] = {} unless hash.has_key? key
          fill_strs_raw_path( hash[key], path, val )
        end
      end
      def parse_strs_raw( hash_out, hash_node_in, path )
        hash_node_in.each do |key,val|
          if val.class == Hash
            child_path = path.dup
            child_path.push( key )
            parse_strs_raw( hash_out, val, child_path )
          else
            out_path = path.dup
            out_path.unshift( key )
            fill_strs_raw_path( hash_out, out_path, val )
          end
        end
      end
      def deep_merge_hash( src, tgt={} )
        src.each do |key,val|
          if val.class == Hash
            tgt[key] = {} unless tgt.has_key? key and tgt[key].class == Hash
            deep_merge_hash( src[key], tgt[key] )
          else
            if [String,Array].include? val.class
              dupval = val.dup
            else
              dupval = val
            end
            tgt[key] = dupval unless tgt.has_key? key and tgt[key].class == val.class
          end
        end
      end
      def process_localized_strings( str_hash )
        langs = str_hash.keys.sort { |a,b| (a > b) ? ( ( a.length > b.length ) ? 1 : -1 ) : -1 }
        default_lang = RSence.config[:lang]
        if langs.include? default_lang
          default_hash = deep_merge_hash( str_hash[default_lang] )
        else
          warn "Warning in #{bundle_path} #process_localized_strings: No default language in localized, using '#{langs.first}' instead"
          default_hash = deep_merge_hash( str_hash[langs.first] )
        end
        langs.each do |lang|
          # create a new copy of the default hash
          base_hash = deep_merge_hash( default_hash )
          if lang.length == 5 and langs.include? lang[0..1]
            # create a base of extended language from the base languge (eg. 'en' for 'en-US')
            base_hash = deep_merge_hash( str_hash[lang[0..1]], base_hash )
          end
          # finally complete the language hash with the base
          deep_merge_hash( base_hash, str_hash[lang] )
        end
      end
      def read_localized_strings( fn='localized.yaml' )
        strs_raw = read_strings( fn )
        return nil unless strs_raw
        str_hash = {}
        if strs_raw
          parse_strs_raw( str_hash, strs_raw, [] )
        end
        process_localized_strings( str_hash )
        str_hash
      end
      def init_strings
        [ 'strings.yaml', 'gui/strings.yaml' ].each do |yaml_name|
          strs = read_strings( yaml_name )
          @strings = strs
          break if strs
        end
      end
      def init_localized_strings
        [ 'localized.yaml', 'gui/localized.yaml' ].each do |yaml_name|
          strs = read_localized_strings( yaml_name )
          @localized_strings = strs
          break if strs
        end
      end
      def init
        super
        init_strings
        init_localized_strings
      end
      def gui_params( msg )
        params = {}
        if @strings
          params[:strings] = strings()
        end
        if @localized_strings
          params[:localized] = localized_strings( msg )
        end
        params
      end
      def strings_params_search( arr_path, params )
        if arr_path.class == String
          arr_path = arr_path.split('.')
        elsif arr_path.class != Array
          warn "Warning in #{bundle_path} #strings_params_search: Invalid string_path class #{arr_path.class.to_s}"
          return nil
        end
        item = arr_path.shift
        if params.class == Hash
          if params.has_key?( item )
            if arr_path.size == 0
              return params[item]
            else
              return strings_params_search( arr_path, params[ item ] )
            end
          end
        end
        ''
      end
      def strings( string_path=nil )
        return nil unless @strings
        return @strings if string_path.nil?
        strings_params_search( arr_path.dup, @strings )
      end
      def localized_strings( msg, string_path=nil )
        return nil unless @localized_strings
        if msg.class == String
          lang = msg
        else
          lang = msg.lang
        end
        default_lang = RSence.config[:lang]
        if @localized_strings.has_key?( lang )
          search_obj = @localized_strings[lang]
        elsif lang.length == 5 and lang[2] == '-' and @localized_strings.has_key?( lang[0..1] )
          # warn "Warning in #{bundle_path} #localized_strings: No '#{lang}' language, using variant '#{lang[0..1]}' instead" if RSence.args[:verbose]
          lang = lang[0..1]
          search_obj = @localized_strings[lang]
        elsif @localized_strings.has_key?( default_lang )
          # warn "Warning in #{bundle_path} #localized_strings: No '#{lang}' language, using default '#{default_lang}' instead" if RSence.args[:verbose]
          search_obj = @localized_strings[lang]
        else
          warn "Error in #{bundle_path} #localized_strings: No '#{lang}' language, no default '#{default_lang}' either"
          return nil
        end
        return search_obj if string_path.nil?
        strings_params_search( string_path, search_obj )
      end
    end
  end
end
