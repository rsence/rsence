
class ComponentSampler < Plugin
  def init_ses(msg)
    include_js( msg, ['basic','uploader'] )
    msg.reply require_js_once(msg,'componentsampler')
    unless msg.session.has_key?(:componentsampler)
      msg.session[:componentsampler] = {
        :main_tabs => HValue.new(msg,0),
        :checkbox1 => HValue.new(msg,false),
        :checkbox2 => HValue.new(msg,true),
        :radio_a   => HValue.new(msg,3),
        :radio_b   => HValue.new(msg,1),
      }
    end
  end
  alias restore_ses init_ses
  def idle(msg)
    if msg.session.has_key?(:main) and msg.session[:main][:boot] == 1
      mses = msg.session[:main]
      cses = msg.session[:componentsampler]
      mses[:delayed_calls].push(%{
        componentSampler = new ComponentSampler({
          main_tabs: #{cses[:main_tabs].val_id.to_json},
          checkbox1: #{cses[:checkbox1].val_id.to_json},
          checkbox2: #{cses[:checkbox2].val_id.to_json},
          radio_a:   #{cses[:radio_a].val_id.to_json},
          radio_b:   #{cses[:radio_b].val_id.to_json}
        });
      })
    end
  end
end

plugin = ComponentSampler.new
plugin.register('componentsampler')
