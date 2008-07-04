package demo;

import java.util.Timer;
import java.util.TimerTask;

import com.helmitechnologies.Application;
import com.helmitechnologies.value.SimpleValue;
import com.helmitechnologies.value.Value;
import com.helmitechnologies.value.ValueListener;

public class MemTest extends Application implements ValueListener {
  
	private static final String DUMMY_ID = "dummy.id";
	private SimpleValue dummyValue;
  
	/*
	 * (non-Javadoc)
	 * 
	 * @see com.helmitechnologies.bus.Application#initialize()
	 */
	public String initialize() {
    
		this.dummyValue = new SimpleValue(DUMMY_ID, "", "string");
		addValue(this.dummyValue);
		this.dummyValue.addValueListener(this);
    
    
		TimerTask tt = new TimerTask() {
			public void run() {
				dummyValue.setStringValue("" + new java.util.Date());
			}
		};

		Timer t = new Timer();
		t.schedule(tt, 0, 1000);
    
		return null;
    
	}
  
  
	/*
	 * (non-Javadoc)
	 * @see com.helmitechnologies.Application#validate(com.helmitechnologies.value.Value)
	 */
	public boolean validate(Value pValue) {
		return true;
	}
  
  
  public String onAfterProcessAjaxRequest() {
    
    return "window.status='" + this.dummyValue.getStringValue() + "';";
    
  }
	
  
	/*
	 * (non-Javadoc)
	 * 
	 * @see com.helmitechnologies.bus.value.ValueListener#valueChanged(java.lang.String,
	 *      java.lang.Object, java.lang.Object)
	 */
	public void valueChanged(String pName, Object pNewValue) {
    
    System.out.println("MemTest: valueChanged(" + pName + ", " + pNewValue + ")");
    
	}
  
  
}
