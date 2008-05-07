
require 'pp'

class HConsole < Plugin
  def hash_to_js( node_hash, node='', indent=0 )
    node += "{ "
    keysize = node_hash.keys.size
    indent += 1
    node_hash.each_key do |key|
      value = node_hash[key]
      unless keysize == node_hash.keys.size
        node += "#{'  '*indent}"
      end
      node += "#{key.inspect} =&gt; "
      keysize -= 1
      if key == :by_id
        value = value.keys
      end
      if value.class == HValue
        node += %{#<HValue:#{value.val_id} @data="#{value.data.inspect[0..100]}#{'...' if value.data.inspect.size > 100}", @sync=#{value.sync.inspect}, @valid=#{value.valid.inspect}, @jstype=#{value.jstype.inspect}, @members=#{value.members.inspect}>}.gsub('<','&lt;').gsub('>','&gt;')
      elsif value.class == Hash
        node += hash_to_js( value, node, indent+1 )
      else
        node += "#{value.inspect[0..100].gsub('<','&lt;').gsub('>','&gt;')}"
      end
      if keysize == 0
        node += "\n"
      else
        node += ",\n"
      end
    end
    indent -= 1
    node += "#{'  '*indent}}\n"
    return node
  end
  def init_ses(msg)
    msg.session[:console] = {
      :session_to_js => HValue.new(msg,''),
      :reload_button => HValue.new(msg,0),
      :clear_button  => HValue.new(msg,0)
    }
    msg.session[:console][:reload_button].bind('console','reload_session_to_js')
    msg.session[:console][:clear_button].bind('console','clear_session_to_js')
  end
  def restore_ses(msg)
    init_ses(msg) unless msg.session.has_key?(:console)
  end
  def reload_session_to_js(msg,val)
    pp msg.session
    msg.session[:console][:session_to_js].set(msg,hash_to_js(msg.session))
    return true
  end
  def clear_session_to_js(msg,val)
    msg.session[:console][:session_to_js].set(msg,'')
    return true
  end
  def idle(msg)
    include_js(msg,['basic','tabs'])
    if msg.session.has_key?(:main)
      if msg.session[:main][:boot] == 2
        msg.reply require_js('console')
        msg.reply "cons = new HConsole({
  session_to_js: '#{msg.session[:console][:session_to_js].val_id}',
  reload_button: '#{msg.session[:console][:reload_button].val_id}',
  clear_button:  '#{msg.session[:console][:clear_button].val_id}'
  
});"
      end
    end
  end
end
console = HConsole.new
console.register('console')