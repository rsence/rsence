package demo;

import com.helmitechnologies.Application;
import com.helmitechnologies.value.SimpleValue;
import com.helmitechnologies.value.Value;
import com.helmitechnologies.value.ValueListener;

public class PerfTest extends Application implements ValueListener {
  
	private static final String GRIDSIZE_ID = "gridsize.id";
	private SimpleValue gridSizeValue;
  
  private static final String COMMAND_ID = "command.id";
  private SimpleValue commandValue;
  
  private int gridSize = 0;
  private boolean uiDrawn = false;
  
  private SimpleValue[] values;
  
	/*
	 * (non-Javadoc)
	 * 
	 * @see com.helmitechnologies.bus.Application#initialize()
	 */
	public String initialize() {
    
		this.gridSizeValue = new SimpleValue(GRIDSIZE_ID, "", "string");
		addValue(this.gridSizeValue);
		this.gridSizeValue.addValueListener(this);
    
		this.commandValue = new SimpleValue(COMMAND_ID, "", "string");
		addValue(this.commandValue);
    
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
    
    
    if (this.gridSize > 0 && !this.uiDrawn) {
      this.uiDrawn = true;
      
      this.values = new SimpleValue[this.gridSize];
      
      
      for (int i = 0; i < this.gridSize; i++) {
        this.values[i] = new SimpleValue("n" + i, "", "string");
        addValue(this.values[i]);
      }
      
      this.commandValue.setStringValue("this.makeSecondState();");
      this.commandValue.setChanged(true);
      
    }
    
    
    return "";
    
  }
	
  
	/*
	 * (non-Javadoc)
	 * 
	 * @see com.helmitechnologies.bus.value.ValueListener#valueChanged(java.lang.String,
	 *      java.lang.Object, java.lang.Object)
	 */
	public void valueChanged(String pName, Object pNewValue) {
    
		if (GRIDSIZE_ID.equals(pName)) {
      
      int row = 0;
      String gs = this.gridSizeValue.getStringValue();
      
      if (null != gs && gs.length() > 0) {
      
        try {
          
          row = Integer.parseInt(gs);
          
        }
        catch (NumberFormatException e) {
          // Can't parse int
        }
        
        if (row > 0 && row < 10) {
          
          this.gridSize = row;
          
        }
        
      }
      
        
      
		}
    
	}
  
  
}

