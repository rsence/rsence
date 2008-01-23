###
  # HIMLE RIA Server
  # Copyright (C) 2008 HIMLE GROUP http://himle.sorsacode.com/
  #  
  #  This program is free software; you can redistribute it and/or modify it under the terms
  #  of the GNU General Public License as published by the Free Software Foundation;
  #  either version 2 of the License, or (at your option) any later version. 
  #  This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
  #  without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
  #  See the GNU General Public License for more details. 
  #  You should have received a copy of the GNU General Public License along with this program;
  #  if not, write to the Free Software Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA
  ###

class EmailValidator < HApplication

  # this gets called whenever an user changes the clicker_val
  def validateEmail(msg,clicker_val)
    email_val = msg.session[:sergey][:email_val]

    email_address = email_val.data
    #email_length = email_address.length

    if email_address.match(/^[0-9A-Za-z][\w\.-]*@[0-9A-Za-z][\w\.-]*[0-9A-Za-z]\.[A-Za-z][A-Za-z\.]*[A-Za-z]$/)
       #email_val.set(msg,'Valid email')
       msg.reply "alert('Successful email address!');"
    else
       #email_val.set(msg,'Invalid email')
       msg.reply "alert('Unsuccessful email address!');"
    end

  end

  # this gets called whenever an user changes the clicker_val
  def validateEmail2(msg,email_val)
    valid_val = msg.session[:sergey][:valid_val]

    email_address = email_val.data
    #email_length = email_address.length

    if email_address.match(/^[0-9A-Za-z][\w\.-]*@[0-9A-Za-z][\w\.-]*[0-9A-Za-z]\.[A-Za-z][A-Za-z\.]*[A-Za-z]$/)
       #email_val.set(msg,'Valid email')
       valid_val.set( msg, "Successful email address!" )
    else
       #email_val.set(msg,'Invalid email')
       valid_val.set( msg, "Unsuccessful email address!" )
    end

  end

  # this gets called on every request performed with an active session
  def idle(msg)
    # assigns the active session to ses
    ses = msg.session
    if not ses.has_key?(:sergey) or msg.new_session
      include_js(msg,'basic')
      include_js(msg,'window')
      include_js(msg,'playground')
      #msg.reply require_js('playground')
      ses[:sergey] = {
        :boot => 0,
        :clicker_val  => HValue.new(msg,0),
        :email_val => HValue.new(msg,''),
        :valid_val => HValue.new(msg,'empty')
      }
      ses[:sergey][:email_val].bind(self.method('validateEmail2'))
      ses[:sergey][:clicker_val].bind(self.method('validateEmail'))
    end

    lses = ses[:sergey]
    if lses[:boot] == 0
      lses[:boot] = 1
      msg.reply require_js('start')
    elsif lses[:boot] == 1
      lses[:boot] = 2
      msg.reply require_js('email_validator')
      msg.reply "emailValApp = new EmailValidatorApp('#{lses[:clicker_val].val_id}','#{lses[:email_val].val_id}','#{lses[:valid_val].val_id}');"
      msg.reply "HTransporter.setPollMode(false);"
    end

  end

end

# register the app
app = EmailValidator.new
app.register( "sergey" )
