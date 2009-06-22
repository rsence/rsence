using System;
using System.Data;
using System.Configuration;
using System.Collections;
using System.Web;
using System.Web.Security;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Web.UI.WebControls.WebParts;
using System.Web.UI.HtmlControls;
using System.Collections.Specialized;
using System.Xml;
using System.IO;
using System.Data.SqlClient;

public partial class transporter : System.Web.UI.Page
{
    // GET POST etc
    protected void Page_Load(object sender, EventArgs e)
    {
        string sesId = (string)Request["ses_id"];
        
        Response.ContentType = "text/plain;charset=utf-8";
        
        if (sesId == null)
        {
            SendErrorNoSesId();
        }
        else if (sesId == "0")
        {
            InitializeSession();
        }
        else
        {

            handleSyncData();
            
            Send();
        }
        Response.Flush();
    }
    private void handleSyncData()
    {
        string syncData = (string)Request["HSyncData"];
        if (syncData != null)
        {
            parseSyncData(syncData);
        }
    }
    private void parseSyncData(string xmlData)
    {
        XmlReader reader = XmlReader.Create(new StringReader(xmlData));
        while (reader.Read())
        {
            if (reader.IsStartElement())
            {
                if (reader.IsEmptyElement)
                    Response.Write("<" + reader.Name + "/>\r\n");
                else
                {
                    string startTag1 = reader.Name;
                    Response.Write("<"+ reader.Name);
                    if (reader.HasAttributes)
                    {
                        while (reader.MoveToNextAttribute())
                        {
                            Response.Write(" " + reader.Name + "=\"" + reader.Value + "\"");
                        }
                        // Move the reader back to the element node.
                        reader.MoveToElement();
                    }
                    Response.Write(">\r\n");
                    reader.Read(); // Read the start tag.
                    string startTag2 = reader.Name;
                    if (reader.IsStartElement())  // Handle nested elements.
                        Response.Write("<"+ reader.Name);
                    if (reader.HasAttributes)
                    {
                        while (reader.MoveToNextAttribute())
                        {
                            Response.Write(" " + reader.Name + "=\"" + reader.Value + "\"");
                        }
                        // Move the reader back to the element node.
                        reader.MoveToElement();
                    }
                    Response.Write(">\r\n");
                    Response.Write(reader.ReadString() + "\r\n");  //Read the text content of the element.
                    Response.Write("</" + startTag2 + ">\r\n");
                    Response.Write("</" + startTag1 + ">\r\n");
                }
            }
        }
        InsertCustomer();

        //SqlDataSource1

        //SqlConnection sqlConnection1 = 
        //    new SqlConnection("Data Source=.\\SQLEXPRESS;AttachDbFilename=|DataDirectory|\\Database.mdf;Integrated Security=True;User Instance=True");

        
        //Response.Write(sqlConnection1);
        //InsertCustomer(sqlConnection1);
        Response.Write(Session.SessionID);

        Response.Write(xmlData);
    }
    private void InsertCustomer() {
        //SqlCommand cmd = new SqlCommand();
        //cmd.CommandType = CommandType.Text;

        //cmd.CommandText = "INSERT Customers (CustomerID, CompanyName) VALUES ('0', 'Helmi1')";

        //cmd.Connection = connection;
        //connection.Open();
        //cmd.ExecuteNonQuery();
        //connection.Close();
        SqlDataSource1.InsertCommand = "INSERT Customers (CustomerID, CompanyName) VALUES ('0', 'Helmi1')";
        SqlDataSource1.Insert();
    }

    private void SendErrorNoSesId()
    {
        Response.Write("alert('aspx error: no ses_id');t.syncDelay=-1;");   
    }
    private void InitializeSession()
    {
        Response.Write("t.ses_id='newsession';");
    }
    private void Send()
    {
        Response.Write("window.status='moi';");
    }
}
