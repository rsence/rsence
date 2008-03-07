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

using System.Data.SqlClient;

public partial class createmp3player : System.Web.UI.Page
{
    public string connectionString = "Data Source=.\\SQLEXPRESS;AttachDbFilename=|DataDirectory|\\Database.mdf;Integrated Security=True;User Instance=True";

    private SqlConnection sqlConnection;

    protected void Page_Load(object sender, EventArgs e)
    {
        Response.ContentType = "text/plain;charset=utf-8";

        Response.CacheControl = "no-cache";
        Response.AddHeader("Pragma", "no-cache");
        Response.Expires = -1;

        sqlConnection = new SqlConnection(connectionString);

        makeDBMp3PlayerValue();

        Response.Flush();
    }


    private int makeDBMp3PlayerValue()
    {
        Int32 newProdID = 0;

        string sql =
          "INSERT INTO mp3player(play, name, position, volume, name_id) VALUES (0, N'-', 0, 100, 0); "
            + "SELECT CAST(scope_identity() AS int)";

        SqlCommand cmd = new SqlCommand();
        cmd.CommandType = CommandType.Text;
        cmd.Connection = sqlConnection;
        sqlConnection.Open();
        /* Set changed and valitated to 'good' values */
        // changed = 0
        // validated = 1
        cmd.CommandText = sql;
        newProdID = (Int32)cmd.ExecuteScalar();
        sqlConnection.Close();
        return (int)newProdID;
    }

}
