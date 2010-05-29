##   RSence
 #   Copyright 2010 Riassence Inc.
 #   http://riassence.com/
 #
 #   You should have received a copy of the GNU General Public License along
 #   with this software package. If not, contact licensing@riassence.com
 ##

module RSence
  
  # = Description:
  # Generic dependency calculator. Used by PluginManager.
  # = Usage:
  # This is an almost real world example:
  #   ## Initialize with pre-satisfied dependencies
  #   deps = RSence::Dependencies.new( [:foo1,:foo2] )
  #   
  #   ## :client_pkg doesn't depend on anything
  #   deps.set_deps( :client_pkg, nil )
  #   
  #   ## :system is the category of :client_pkg
  #   deps.set_deps( :system, :client_pkg )
  #   
  #   ## :index_html depends on :client_pkg
  #   deps.set_deps( :index_html, :client_pkg )
  #   
  #   ## :system is the category of :index_html
  #   deps.set_deps( :system, :index_html )
  #   
  #   ## :main depends on :index_html
  #   deps.set_deps( :main, :index_html )
  #   
  #   ## :system is the category of :main
  #   deps.set_deps( :system, :main )
  #   
  #   ## :impossible has several dependencies, of which :foo3 can't be satisfied
  #   deps.set_deps( :impossible, [:foo1, :foo2, :foo3] )
  #   
  #   ## :ticket has no dependencies
  #   deps.set_deps( :ticket, nil )
  #   
  #   ## :system is the category of :ticket
  #   deps.set_deps( :system, :ticket )
  #   
  #   ## :welcome depends on the :system category
  #   deps.set_deps( :welcome, :system )
  #   
  #   ## :first doesn't depend on anything
  #   deps.set_deps( :first, nil )
  #   
  #   ## Prepending is handled like this:
  #   deps.set_deps( :client_pkg, :first )
  #   deps.set_deps( :ticket, :first )
  #   
  #   ## Calculates the list of dependencies and returns them in an Array
  #   p deps.list
  #   
  #   ## Output of the example above:
  #   # impossible dependencies:
  #   #   :impossible => [:foo3]
  #   # [:foo1, :foo2, :first, :ticket, :client_pkg, :index_html, :main, :system, :welcome]
  class Dependencies
    
    # Don't use Dependencies for external projects yet. It's subject to change
    # without deprecation warnings.
    # +resolved+ and +categories+ are optional.
    def initialize( resolved = [], categories = {}, quiet=true )
      @quiet = quiet
      @pre_resolved = resolved.clone
      @depends_on = {
        # :name => [ :dep1, :dep2, :dep3, ... ]
      }
      @dependencies_of = {
        #:dep1 => [ :name1, :name2, ... ]
      }
      @categories = []
      categories.each_key do |cat_name, cat_items|
        add_category( cat_name )
        set_deps( cat_name, nil )
      end
      @unresolved = []
      recalculate!
    end
    
    # Returns true, if +name+ is a pre-resolved dependency.
    def pre_resolved?( name )
      @pre_resolved.include?( name )
    end
    
    # Returns true, if +name+ is not a pre-resolved dependency and not a category.
    def loadable?( name )
      return (not pre_resolved?(name) and not category?(name))
    end
    
    # Returns list of items that are dependencies of +name+ in
    # no particular order.
    def deps_of( name )
      outp = []
      if @dependencies_of.has_key?(name)
        @dependencies_of[name].each do |dep|
          outp.push( dep )
          outp += deps_of( dep )
        end
      end
      outp.uniq!
      outp.delete( name )
      return outp
    end
    alias dependencies_of deps_of
    
    # Returns list of items that +name+ depends on in no particular order.
    def deps_on( name )
      outp = []
      if @depends_on.has_key?(name)
        @depends_on[name].each do |dep|
          outp.push( dep )
          outp += deps_on( dep )
        end
      end
      outp.uniq!
      outp.delete( name )
      return outp
    end
    alias depends_on deps_on
    
    # List of categories
    attr_reader :categories
    
    # Adds the gategory +name+.
    def add_category( name )
      @categories.push( name ) unless @categories.include?( name )
    end
    
    # Deletes the category +name+, but doesn't dissolve its dependencies.
    # Essentially turns +name+ into a regular item.
    def del_category( name )
      @categories.delete( name ) if @categories.include?( name )
    end
    
    # Returns true, if +name+ is a category.
    def category?( name )
      @categories.include?( name )
    end
    
    # Set list of dependency names as +deps+ that +name+ depends on
    def set_deps( name, deps )
      if deps.class == Symbol
        deps = [deps]
      elsif deps.class == String
        deps = [deps.to_sym]
      elsif deps.class == NilClass
        deps = []
      elsif deps.class != Array
        raise "Dependencies.set_deps error: the deps is an unsupported type: #{deps.class}"
      end
      if not @depends_on.has_key?(name)
        @depends_on[name] = deps
      else
        deps.each do |dep|
          @depends_on[name].push( dep ) unless @depends_on[name].include?( dep )
        end
      end
      deps.each do |dep|
        if not @dependencies_of.has_key?( dep )
          @dependencies_of[dep] = [name]
        elsif not @dependencies_of[dep].include?( name )
          @dependencies_of[dep].push( name )
        end
      end
      recalculate!
    end
    alias set_dependencies set_deps
    alias set_dependency set_deps
    
    # Returns copy of the @depends_on Array
    def clone_depends_on
      Marshal.load( Marshal.dump( @depends_on ) )
    end
    
    # Returns clone of the @dependencies_of Array
    def clone_dependencies_of
      Marshal.load( Marshal.dump( @dependencies_of ) )
    end
    
    # Remove +name+ from dependency system, throws error if it's depended on another item.
    def del_item( name )
      d_of = deps_of( name )
      if not d_of.empty?
        d_of.each do |dep|
          if category?( dep )
            @depends_on[ dep ].delete( name )
          else
            throw "Dependencies.del_item error: the following items depend on #{name.inspect} -> #{deps_of(name).inspect}"
          end
        end
      end
      unless category?( name )
        deps_on( name ).each do |dep|
          @dependencies_of[dep].delete(name) if @dependencies_of.has_key?(dep)
        end
        @depends_on.delete( name )
        @dependencies_of.delete( name )
      end
      recalculate!
    end
    
    # Returns the order of deletion possible without breaking the dependency chain
    def del_order( name )
      d_order = []
      d_of = deps_of( name )
      list.reverse.each do |dep|
        if d_of.include?( dep )
          d_order.push( dep )
        end
      end
      d_order.push( name )
      return d_order
    end
    
    # Deletes +name+ and all dependencies of +name+
    def del_deps( name )
      del_order( name ).each do |del_name|
        del_item( del_name )
      end
    end
    
    # Returns true, if +name+ is unresolved. The list of unresolved items is
    # updated every time self#recalculate is called.
    def unresolved?( name )
      @unresolved.include?( name )
    end
    
    # Returns true, if +name+ is resolved (a valid dependency). Inverse of self#unresolved?
    def resolved?( name )
      (not unresolved?( name ))
    end
    
    # Recalculates the list and unresolved items.
    def recalculate!
      unresolved = []
      resolved = @pre_resolved.clone
      same_len = false
      depends_on = clone_depends_on
      target_len = depends_on.keys.length + resolved.length
      until resolved.length == target_len
        len = resolved.length
        depends_on.each do | name, deps |
          if deps.empty? and not resolved.include?(name)
            resolved.push( name )
          elsif deps.empty?
            next
          else
            deps.each do |dep|
              deps.delete(dep) if resolved.include?(dep)
            end
          end
        end
        if len == resolved.length
          if same_len
            warn "impossible dependencies:" unless @quiet
            (depends_on.keys - resolved).each do |unsatisfied|
              warn "  #{unsatisfied.inspect} => #{depends_on[unsatisfied].inspect}" unless @quiet
              unresolved.push( unsatisfied )
            end
            break
          else
            same_len = true
          end
        else
          same_len = false
        end
      end
      @unresolved = unresolved
      @resolved = resolved
    end
    
    # Returns dependencies sorted in load order
    def list
      @resolved.clone
    end
    alias load_order list
  end
end

