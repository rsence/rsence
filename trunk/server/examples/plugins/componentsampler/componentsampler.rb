
class ComponentSampler < Plugin
  def init_ses(msg)
    include_js( msg, ['basic','tabs'] )
    msg.reply require_js_once(msg,'componentsampler')
    msg.session[:main][:delayed_calls].push("componentSampler = new ComponentSampler();")
  end
  alias restore_ses init_ses
end

