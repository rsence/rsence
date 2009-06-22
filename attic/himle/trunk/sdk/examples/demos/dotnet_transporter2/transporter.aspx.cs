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

using System.Globalization;

using System.Text.RegularExpressions;

using AxWMPLib;
using WMPLib;
//using System.Media;

public partial class transporter : System.Web.UI.Page
{
    public struct Mp3Value
    {
        public int id;
        public string name;
        public string filename;
        public Mp3Value(int id, string name, string filename)
        {
            this.id = id;
            this.name = name;
            this.filename = filename;
        }
    }

    public struct HTableColumn
    {
        public int id;
        public string name;
        public int startrow;
        public int endrow;
        public HTableColumn(int id, string name, int startrow, int endrow)
        {
            this.id = id;
            this.name = name;
            this.startrow = startrow;
            this.endrow = endrow;
        }
    }

    public struct HTable
    {
        public int id;
        public HTableColumn[] columns;
        public string jstype;
        public HTable(int id, HTableColumn[] columns)
        {
            this.id = id;
            this.columns = columns;
            this.jstype = "";
        }
        public HTable(int id, HTableColumn[] columns, string jstype)
        {
            this.id = id;
            this.columns = columns;
            this.jstype = jstype;
        }
        public bool IsNull { get { return id == 0; } }
    }

    public struct Mp3PlayerValue
    {
        public int id;
        public int play;
        public string name;
        public int position;
        public int volume;
        public int name_id;
        public Mp3PlayerValue(int id, int play, string name, int position, int volume, int name_id)
        {
            this.id = id;
            this.play = play;
            this.name = name;
            this.position = position;
            this.volume = volume;
            this.name_id = name_id;
        }
    }



    public struct HValue
    {
        public int id;
        public string value;
        public string jstype;
        public HValue(int id, string value)
        {
            this.id = id;
            this.value = value;
            this.jstype = "";
        }
        public HValue(int id, string value, string jstype)
        {
            this.id = id;
            this.value = value;
            this.jstype = jstype;
        }
        public bool IsNull { get { return id == 0 && value == null; } }
    }

    public struct HControlValue
    {
        public int id;
        public string value;
        public string label;
        public int enabled;
        public int active;
        public string jstype;
        public HControlValue(int id, string value, string label, int enabled, int active)
        {
            this.id = id;
            this.value = value;
            this.label = label;
            this.enabled = enabled;
            this.active = active;
            this.jstype = "";

        }
        public HControlValue(int id, string value, string label, int enabled, int active, string jstype)
        {
            this.id = id;
            this.value = value;
            this.label = label;
            this.enabled = enabled;
            this.active = active;
            this.jstype = jstype;
        }
        public bool IsNull { get { return id == 0 && value == null; } }
    }

    //public string connectionString = "Data Source=.\\SQLEXPRESS;AttachDbFilename=|DataDirectory|\\Database.mdf;User ID=jukka;Password=jukka123;Connect Timeout=30;User Instance=False";
    public string connectionString = "Data Source=.\\SQLEXPRESS;AttachDbFilename=|DataDirectory|\\Database.mdf;Integrated Security=True;User Instance=True";
    
    private SqlConnection sqlConnection;
    private SqlCommand sqlCommand;
    // GET POST etc
    protected void Page_Load(object sender, EventArgs e)
    {
        // The client expect the content to be text/plain
        Response.ContentType = "text/plain;charset=utf-8";

        Response.CacheControl = "no-cache";
        Response.AddHeader("Pragma", "no-cache");
        Response.Expires = -1;
        
        sqlConnection = new SqlConnection(connectionString);
        sqlCommand = new SqlCommand();
        sqlCommand.CommandType = CommandType.Text;
        sqlCommand.Connection = sqlConnection;
        sqlConnection.Open();

        string sesId = (string)Request["ses_id"];

        DateTime dateTimeNow = DateTime.Now;
        long current_time = toEpochSeconds(dateTimeNow);
        long next_timeout = current_time + 60;

        // It's a good idea to flush expired data from the database
        cleanUpSessions(current_time);

        if (sesId == null)
        {
            //Playing sound
            //playSimpleSound();
            
            //SendErrorNoSesId();
        }
        // The client reports its session id as '0' when told otherwise
        // This means that the session is new
        else if (sesId == "0")
        {
            InitializeSession(current_time);
            
        }
        // UNTIL THIS 400 ms

        else if (sesId != "0")
        {
            SqlDataReader sqlDataReader;
            // Let's perform a query to check, it the session exists and
            // is valid:
            sqlCommand.CommandText = "SELECT * FROM [sessions] WHERE ([ses_key] = '" + sesId + "')";
            sqlDataReader = sqlCommand.ExecuteReader();

            int arrayLength = 0;
            int session_id = 0;
            int state = 0;
            while (sqlDataReader.Read())
            {
                session_id = (int)sqlDataReader["id"];
                state = (int)sqlDataReader["state"];
                arrayLength++;

            }
            sqlConnection.Close();
            if (arrayLength != 1)
            {
                throw new Exception("InvalidSessionError");
            }
            // connection closed
            // open the connection
            sqlConnection.Open();

            // Let's update the timeout, so the session will not expire 
            
            sqlCommand.CommandText = "UPDATE sessions SET timeout = " + next_timeout + " WHERE ([id] = " + session_id + ")";
            sqlCommand.ExecuteNonQuery();
            
            // Let's set the state to 2 as in verified, if the sate is 1 as in not verified 
            if (state == 1)
            {
                sqlCommand.CommandText = "UPDATE sessions SET state = 2 WHERE ([id] = " + session_id + ")";
                sqlCommand.ExecuteNonQuery();

            }
            if (state == 1)
            {
                // this is the program code
                // state 1 is the initialization state
                InitializeJukebox(session_id);
            }
            handleClientError();
            handleSyncData(sesId);
            if (state == 2)
            {
                UpdateJukebox(session_id);
            }
            syncJSValues(session_id);
        }
        sqlConnection.Close();
        Response.Flush();
    }
    private void playSimpleSound()
    {
        AxWindowsMediaPlayer Player = new AxWindowsMediaPlayer();
        Player.URL = @"c:\Windows\Media\chimes.wav";
        Player.Ctlcontrols.play();
        //SoundPlayer simpleSound = new SoundPlayer(@"c:\Windows\Media\chimes.wav");
        //simpleSound.Play();
    }
    private void cleanUpSessions(long current_time)
    {
        SqlDataReader sqlDataReader;

        sqlCommand.CommandText = "SELECT CAST(COUNT(*) AS int) as Int FROM [sessions] WHERE ([timeout] < " + current_time + ")";
        int sessionCount = (int)sqlCommand.ExecuteScalar();

        sqlCommand.CommandText = "SELECT [id] FROM [sessions] WHERE ([timeout] < " + current_time + ")";
        sqlDataReader = sqlCommand.ExecuteReader();

        int[] expired_session_ids = new int[sessionCount];

        int arrayIndex = 0;
        while (sqlDataReader.Read())
        {
            expired_session_ids[arrayIndex] = (int)sqlDataReader[0];
            arrayIndex++;
        }
        // must close because SqlDataReader needs it
        // is there other way to do it?
        sqlConnection.Close();
        sqlConnection.Open();
        // flush experied data

        // HValue
        deleteValues(expired_session_ids);
        // HControlValue
        deleteControlValues(expired_session_ids);
        // HTable
        deleteTables(expired_session_ids);

        sqlCommand.CommandText = "DELETE FROM sessions WHERE ([timeout] < " + current_time + ")";
        sqlCommand.ExecuteNonQuery();
        
    }

    private bool session_key_found(string ses_key)
    {

        sqlCommand.CommandText = "SELECT CAST(COUNT(*) AS int) as Int FROM [sessions] WHERE ([ses_key] = '" + ses_key + "')";
        int sessionCount = (int)sqlCommand.ExecuteScalar();
        
        if (sessionCount > 0)
        {
            return true;
        }
        return false;

    }

    private string generate_session_key()
    {
        ushort str_size = 48;
        char[] valid_chars = new char[64];
        // 2 chars
        valid_chars[0] = '-';
        valid_chars[1] = '_';
        // 10 chars
        int position = 2;
        for (int i = 48; i <= 57; i++)
        {
            valid_chars[position] = (char)i;
            position++;
        }
        // 26 chars
        for (int i = 65; i <= 90; i++)
        {
            valid_chars[position] = (char)i;
            position++;
        }
        // 26 chars
        for (int i = 97; i <= 122; i++)
        {
            valid_chars[position] = (char)i;
            position++;
        }
        string ses_key = "";

        bool unique = false;
        while (!unique)
        {

            Random random = new Random();
            char[] rand_line = new char[str_size];
            for (int i = 0; i < rand_line.Length; i++)
            {
                rand_line[i] = valid_chars[random.Next(63)];
            }
            ses_key = new string(rand_line);
            unique = !session_key_found(ses_key);
        }
        return ses_key;
    }


    // called if the ses_id is 0
    private void InitializeSession(long epochtime)
    {
        // We need a long enough random, but unique identifier for the client
        //string ses_key = Session.SessionID;
        string ses_key = generate_session_key();
        // Let's also set the state to 1 to mark the initialization done,
        // but the session as new.
        byte state = 1;

        // Let's also set a timeout for the session and store it in sql.
        // Here we use 1 minute as the timeout
        epochtime += 60;

        // The value of this property represents the number of 100-nanosecond intervals that have elapsed since 12:00:00 midnight, January 1, 0001.

        
        
        sqlCommand.CommandText = "INSERT INTO sessions(ses_key, state, timeout) VALUES (N'" + ses_key + "', " + state + ", " + epochtime + ")";
        sqlCommand.ExecuteNonQuery();
        

        // We need to tell the client that it now has a session key.
        // It's the "ses_id" variable in the "HTransporter" namespace
        // in the javascript world.
        string js_ses_id_init_string = "HTransporter.ses_id='" + ses_key + "';";
        Response.Write(js_ses_id_init_string);

        Response.Write("common_values={};");
    }

    private void handleClientError()
    {
        /*string errorMessage = (string)Request["err_msg"];
        if (errorMessage != null)
        {
            Response.Write("alert('" + Regex.Escape(errorMessage) + "');");
            Response.Write("HTransporter.stop();");
        }*/
    }

    // The first thing to do, is to check, whether there is some xml to parse.
    // This is detected by checking, if the HSyncData request key exists.
    private void handleSyncData(string sesId)
    {
        string syncData = (string)Request["HSyncData"];
        if (syncData != null)
        {
            parseSyncData(syncData, sesId);
        }
    }

    private void parseSyncData(string xmlData, string sesId)
    {
        XmlReader reader = XmlReader.Create(new StringReader(xmlData));
        
        int index = 0;
        int tableIndex = 0;
        reader.ReadToFollowing("hsyncvalues");

        int valueCount = Int32.Parse(reader.GetAttribute("length"));

        HValue[] hsyncvalues = new HValue[valueCount];
        HTable[] hsynctables = new HTable[valueCount];
        //TODO: add HControlValue sync
        bool found = false;
        // hvalue
        found = reader.ReadToFollowing("hvalue");
        if (found)
        {
            do
            {
            //while (reader.ReadToNextSibling("hvalue"))
            //{
                HValue hvalue = new HValue();
                hvalue.id = Int32.Parse(reader.GetAttribute("id"));
                hvalue.jstype = reader.GetAttribute("jstype");
                hvalue.value = reader.ReadString();
                hsyncvalues[index] = hvalue;
                index++;
            //}
            } while (reader.ReadToNextSibling("hvalue"));
        }





        reader = XmlReader.Create(new StringReader(xmlData));
        reader.ReadToFollowing("hsyncvalues");
        found = false;
        // hvalue
        found = reader.ReadToFollowing("tablevalue");

        if (found)
        {
            
            do
            {
                HTable htable = new HTable();
                
                htable.id = Int32.Parse(reader.GetAttribute("id"));
                int columnCount = Int32.Parse(reader.GetAttribute("length"));
                HTableColumn[] columns = new HTableColumn[columnCount];
                bool columnFound = false;
                

                columnFound = reader.ReadToFollowing("getrows");
                
                if (columnFound)
                {
                    int columnIndex = 0;
                    do
                    {
                        HTableColumn column = new HTableColumn();
                        column.name = reader.GetAttribute("column");
                        column.startrow = Int32.Parse(reader.GetAttribute("startrow"));
                        column.endrow = Int32.Parse(reader.GetAttribute("endrow"));
                        columns[columnIndex] = column;
                        columnIndex++;

                    } while (reader.ReadToNextSibling("getrows"));
                }
                htable.columns = columns;
                
                hsynctables[tableIndex] = htable;
                tableIndex++;
            } while (reader.ReadToNextSibling("htablevalue"));
            
        }




        for (int i = 0; i < index; i++)
        {
            setValueFromClient(sesId, hsyncvalues[i].id, hsyncvalues[i].jstype, hsyncvalues[i].value);//, cmd
        }
        
        
        
        for (int i = 0; i < tableIndex; i++)
        {
            setTableFromClient(sesId, hsynctables[i].id, "", hsynctables[i]);//, cmd
        }
    }

    // This function inserts new values to the database and returns the row
    // serial number.
    private int makeDBValue(int ses_id, string name, string value, string jstype)
    {
        Int32 newProdID = 0;
        string sql =
          "INSERT INTO hvalues(ses_id, name, value, jstype, changed, validated) VALUES (" + ses_id + ", N'" + name + "', N'" + value + "', N'" + jstype + "', 0, 1); "
            + "SELECT CAST(scope_identity() AS int)";
        /* Set changed and validated to 'good' values */
        // changed = 0
        // validated = 1
        sqlCommand.CommandText = sql;
        newProdID = (Int32)sqlCommand.ExecuteScalar();
        return (int)newProdID;
    }

    /* This function initializes a new value object into the client's "common_values" namespace */
    private void makeJSValue(string name, int id, string value)
    {
        Response.Write("common_values." + name + "=new HValue(" + id + "," + value + ");");
    }

    // This function gets a current client value by name
    private HValue getDBValueByName(int ses_id, string name)
    {
        SqlDataReader sqlDataReader;

        sqlCommand.CommandText = "SELECT * FROM [hvalues] WHERE (([ses_id] = " + ses_id + ") AND ([name] = '" + name + "'))";
        sqlDataReader = sqlCommand.ExecuteReader();

        // The result should be exactly one row, because the session-specific
        // names should be unique
        int arrayLength = 0;
        string type = "";
        int id = 0;
        string value = "";

        while (sqlDataReader.Read())
        {
            type = (string)sqlDataReader["jstype"];
            id = (int)sqlDataReader["id"];
            value = (string)sqlDataReader["value"];
            arrayLength++;
        }
        sqlConnection.Close();
        sqlConnection.Open();
        if (arrayLength > 1)
        {
            throw new Exception("MultipleValuesForValueNameError");
        }
        // Just returns null HValue, if no value row was found. We'll need
        // to insert one in that case.
        if (arrayLength == 0)
        {
            return new HValue();
        }
        /* Let's quote the the value for use in strings, if the jstype is a string */
        if (type == "string")
        {
            value = "'" + value + "'";
        }
        return new HValue(id, value);
    }
    // This function gets a value from the database or defaults to the value
    // supplied, if not found.
    private void initValue(int ses_id, string name, string value, string jstype)
    {
        HValue hvalue = getDBValueByName(ses_id, name);
        
        int id = 0;
        // If getDBValueByName returns null HValue, the value was not found.
        // In that case, let's make a new value.
        if (hvalue.IsNull)
        {
            id = makeDBValue(ses_id, name, value, jstype);
            //ADDED
            if (jstype == "string")
            {
                value = "'" + value + "'";
            }
        }
        else
        {
            id = hvalue.id;
            value = hvalue.value;
        }
        // At this stage, the value is stored in the database, but let's also
        // make a value in the client namespace.

        makeJSValue(name, id, value);
    }

    /// <summary>jee jee jee
    /// </summary>
    // This function updates a value set by the client.
    private void setValueFromClient(string ses_id, int id, string jstype, string value)//, SqlCommand cmd
    {
        sqlCommand.CommandText = "UPDATE hvalues SET value = N'" + value + "', jstype = N'" + jstype + "', validated = 0 WHERE ([id] = " + id + ")";
        sqlCommand.ExecuteNonQuery();
    }
    private void syncJSValues(int ses_id)
    {
        SqlDataReader sqlDataReader;

        sqlCommand.CommandText = "SELECT CAST(COUNT(*) AS int) as Int FROM [hvalues] WHERE (([changed] = 1) AND ([ses_id] = " + ses_id + "))";
        int sessionCount = (int)sqlCommand.ExecuteScalar();

        sqlCommand.CommandText = "SELECT [id], [value], [jstype] FROM [hvalues] WHERE (([changed] = 1) AND ([ses_id] = " + ses_id + "))";
        sqlDataReader = sqlCommand.ExecuteReader();
        
        int id = 0;
        string jstype = "";
        string value = "";
        
        int[] array = new int[sessionCount];
        int arrayIndex = 0;
        while (sqlDataReader.Read())
        {
            id = (int)sqlDataReader[0];
            value = (string)sqlDataReader[1];
            jstype = (string)sqlDataReader[2];
            if (jstype == "string")
            {
                value = "'" + value.Replace("'","\\'") + "'";
                // ADDED
                value = Regex.Escape(value);
            }
            array[arrayIndex] = id;
            arrayIndex++;
            
            Response.Write("HValueManager.set(" + id + "," + value + ");");
        }
        sqlConnection.Close();
        sqlConnection.Open();
        for (int i = 0; i < arrayIndex; i++)
        {
            sqlCommand.CommandText = "UPDATE hvalues SET changed = 0 WHERE ([id] = " + array[i] + ")";
            sqlCommand.ExecuteNonQuery();
        }
    }

    private void setValueToClient(int ses_id, string name, string jstype, string value)//, SqlCommand cmd
    {
        sqlCommand.CommandText = "UPDATE hvalues SET value = N'" + value + "', validated = 1, jstype = N'" + jstype + "', changed = 1 WHERE (([name] = '" + name + "') AND ([ses_id] = " + ses_id + "))";
        sqlCommand.ExecuteNonQuery();
    }

    private void setValueToAllClients(string name, string jstype, string value)//, SqlCommand cmd
    {
        sqlCommand.CommandText = "UPDATE hvalues SET value = N'" + value + "', validated = 1, jstype = N'" + jstype + "', changed = 1 WHERE ([name] = '" + name + "')";
        sqlCommand.ExecuteNonQuery();
    }

    private void SendErrorNoSesId()
    {
        Response.Write("alert('aspx error: no ses_id');t.syncDelay=-1;");
    }

    private void deleteValues(int[] expired_session_ids)
    {
        for (int i = 0; i < expired_session_ids.Length; i++)
        {
            sqlCommand.CommandText = "DELETE FROM hvalues WHERE ([ses_id] = " + expired_session_ids[i] + ")";
            sqlCommand.ExecuteNonQuery();
        }
    }

    private long toEpochSeconds(DateTime dateTimeNow)
    {
        DateTime dateTime1970 = new DateTime(1970, 1, 1);

        long tnow = dateTimeNow.Ticks;
        long t1970 = dateTime1970.Ticks;
        //timeout
        long epochtime = ((tnow - t1970) / 10000000);
        return epochtime;
    }
    /////////////////////////////////////////////////////////////////////

    // HTableValue

    private void setTableFromClient(string ses_id, int id, string jstype, HTable value)//, SqlCommand cmd
    {
        sqlCommand.CommandText = "UPDATE htables SET validated = 0 WHERE ([id] = " + id + ")";
        sqlCommand.ExecuteNonQuery();
        // update columns
        for (int i = 0; i < value.columns.Length; i++)
        {
            sqlCommand.CommandText = "UPDATE htablecolumns SET startrow = " + value.columns[i].startrow + ", endrow = " + value.columns[i].endrow + " WHERE (([table_id] = " + id + ") AND ([name] = '" + value.columns[i].name + "'))";
            sqlCommand.ExecuteNonQuery();
        }

    }

    private void initTable(int ses_id, string name, HTable value, string jstype)
    {
        HTable hvalue = getDBTableByName(ses_id, name);

        int id = 0;
        // If getDBTableByName returns null HTable, the value was not found.
        // In that case, let's make a new value.
        if (hvalue.IsNull)
        {
            id = makeDBTable(ses_id, name, value, jstype);
        }
        else
        {
            id = hvalue.id;
            value = hvalue;
        }
        // At this stage, the value is stored in the database, but let's also
        // make a value in the client namespace.
        makeJSTable(name, id, value);
    }

    private void makeJSTable(string name, int id, HTable value)
    {
        int numberOfRows = InitializeMp3sTest();
        string tableArray = "[]";
        string columns = "";
        string dbcolumns = "";
        if (value.columns.Length > 0) {
            columns += "'" + value.columns[0].name + "'";
            dbcolumns += value.columns[0].name;
            for (int i = 1; i < value.columns.Length; i++) {
                columns += ",'" + value.columns[i].name + "'";
                dbcolumns += ", " + value.columns[i].name;
            }
        }
        int startrow = 0;
        int endrow = 0;
        if (value.columns.Length > 0)
        {
            startrow = value.columns[0].startrow;
            endrow = value.columns[0].endrow;
            tableArray = GetMp3s(startrow, endrow, dbcolumns);
        }
        Response.Write("common_values." + name + "=new HTableValue(" + id + ",{length:" + numberOfRows + ",startrow:" + startrow + ",endrow:" + endrow + ",value:" + tableArray + ",columns:[" + columns + "]});");
    }

    private int makeDBTable(int ses_id, string name, HTable value, string jstype)
    {
        Int32 newProdID = 0;
        string sql =
          "INSERT INTO htables(ses_id, name, jstype, changed, validated) VALUES (" + ses_id + ", N'" + name + "', N'" + jstype + "', 0, 1); "
            + "SELECT CAST(scope_identity() AS int)";
        // Set changed and validated to 'good' values 
        // changed = 0
        // validated = 1
        sqlCommand.CommandText = sql;
        newProdID = (Int32)sqlCommand.ExecuteScalar();
        // creates htablecolumns
        for (int i = 0; i < value.columns.Length; i++)
        {
            sqlCommand.CommandText = "INSERT INTO htablecolumns(table_id, name, startrow, endrow) VALUES (" + newProdID + ", N'" + value.columns[i].name + "', " + value.columns[i].startrow + ", " + value.columns[i].endrow + "); ";
            sqlCommand.ExecuteNonQuery();
        }
        return (int)newProdID;
    }

    private HTable getDBTableByName(int ses_id, string name)
    {
        SqlDataReader sqlDataReader;
        sqlCommand.CommandText = "SELECT * FROM [htables] WHERE (([ses_id] = " + ses_id + ") AND ([name] = '" + name + "'))";
        sqlDataReader = sqlCommand.ExecuteReader();

        // The result should be exactly one row, because the session-specific
        // names should be unique
        int arrayLength = 0;
        string type = "";
        int id = 0;

        while (sqlDataReader.Read())
        {
            type = (string)sqlDataReader["jstype"];
            id = (int)sqlDataReader["id"];
            arrayLength++;
        }
        sqlConnection.Close();
        sqlConnection.Open();
        if (arrayLength > 1)
        {
            throw new Exception("MultipleValuesForValueNameError");
        }
        // Just returns null HValue, if no value row was found. We'll need
        // to insert one in that case.
        if (arrayLength == 0)
        {
            return new HTable();
        }


        sqlCommand.CommandText = "SELECT CAST(COUNT(*) AS int) as Int FROM [htablecolumns] WHERE ([table_id] = " + id + ")";
        int columnCount = (int)sqlCommand.ExecuteScalar();

        // get also the columns
        sqlCommand.CommandText = "SELECT [id], [name], [startrow], [endrow] FROM [htablecolumns] WHERE ([table_id] = " + id + ")";
        
        
        HTableColumn[] columns = new HTableColumn[columnCount];
        
        sqlDataReader = sqlCommand.ExecuteReader();
        
        arrayLength = 0;
        int columnid = 0;
        string columnname = "";
        int startrow = 0;
        int endrow = 0;

        while (sqlDataReader.Read())
        {
            columnid = (int)sqlDataReader[0];
            columnname = (string)sqlDataReader[1];
            startrow = (int)sqlDataReader[2];
            endrow = (int)sqlDataReader[3];
            columns[arrayLength] = new HTableColumn(columnid,columnname,startrow,endrow);
            
            arrayLength++;
        }
        sqlConnection.Close();
        sqlConnection.Open();

        return new HTable(id,columns);
    }
    private void deleteTables(int[] expired_session_ids)
    {
        for (int i = 0; i < expired_session_ids.Length; i++)
        {
            sqlCommand.CommandText = "SELECT [id] as Int FROM [htables] WHERE ([ses_id] = " + expired_session_ids[i] + ")";
            object obj = sqlCommand.ExecuteScalar();
            int id = 0;
            if (obj != null)
            {
                id = (int)obj;
            }
            // delete htables
            sqlCommand.CommandText = "DELETE FROM htables WHERE ([ses_id] = " + expired_session_ids[i] + ")";
            sqlCommand.ExecuteNonQuery();
            // deletes htablecolumns
            if (id != 0)
            {
                sqlCommand.CommandText = "DELETE FROM htablecolumns WHERE ([table_id] = " + id + ")";
                sqlCommand.ExecuteNonQuery();
            }
        }
    }
    private bool getDBTableByNameNotValidated(int ses_id, string name)
    {
        sqlCommand.CommandText = "SELECT CAST(COUNT(*) AS int) as Int FROM [htables] WHERE (([ses_id] = " + ses_id + ") AND ([name] = '" + name + "')AND ([validated] = 0))";
        int valueCount = (int)sqlCommand.ExecuteScalar();
        if (valueCount == 0)
        {
            return false;
        }
        else if (valueCount == 1)
        {
            return true;
        }
        else
        {
            throw new Exception("MultipleValuesForValueNameError");
        }
    }
    private void setTableValidated(int ses_id, string name)
    {
        sqlCommand.CommandText = "UPDATE htables SET validated = 1 WHERE (([name] = '" + name + "') AND ([ses_id] = " + ses_id + "))";
        sqlCommand.ExecuteNonQuery();
    }

    ///////////////////////////////////////////////////////////////////
    
    // HControlValue

    //makeDBControlValue
    //deleteControlValues
    //setControlValue
    //makeJSControlValue
    //setControlValueFromClient
    //getDBControlValueByName
    //initControlValue
    //syncJSControlValues

    private int makeDBControlValue(int ses_id, string name, string value, string label, int enabled, int active, string jstype)
    {
        Int32 newProdID = 0;
        
        string sql =
          "INSERT INTO hcontrolvalues(ses_id, name, value, label, enabled, active, jstype, changed, validated) VALUES (" + ses_id + ", N'" + name + "', N'" + value + "', N'" + label + "', " + enabled + ", " + active + ", N'" + jstype + "', 0, 1); "
            + "SELECT CAST(scope_identity() AS int)";
        SqlCommand cmd = new SqlCommand();
        cmd.CommandType = CommandType.Text;
        cmd.Connection = sqlConnection;
        sqlConnection.Open();
        // Set changed and validated to 'good' values
        // changed = 0
        // validated = 1
        cmd.CommandText = sql;
        newProdID = (Int32)cmd.ExecuteScalar();
        sqlConnection.Close();
        return (int)newProdID;
    }

    private void deleteControlValues(int[] expired_session_ids)
    {
        //SqlCommand cmd = new SqlCommand();
        //cmd.CommandType = CommandType.Text;
        //cmd.Connection = sqlConnection;
        //sqlConnection.Open();
        for (int i = 0; i < expired_session_ids.Length; i++)
        {
            sqlCommand.CommandText = "DELETE FROM hcontrolvalues WHERE ([ses_id] = " + expired_session_ids[i] + ")";
            sqlCommand.ExecuteNonQuery();
        }
        //sqlConnection.Close();
    }

    private void setControlValue(string ses_id, string name, string jstype, string value, string label, int enabled, int active, SqlCommand cmd)
    {
        cmd.CommandText = "UPDATE hcontrolvalues SET value = N'" + value + "', label = N'" + label + "', enabled = " + enabled + ", active = " + active + ", jstype = N'" + jstype + "', changed = 1 WHERE (([name] = '" + name + "') AND ([ses_id] = '" + ses_id + "'))";
        cmd.ExecuteNonQuery();
    }

    private void makeJSControlValue(string name, int id, string value, string label, int enabled, int active)
    {
        Response.Write("common_values." + name + "=new HControlValue(" + id + ",{value:" + value + ",label:" + label + ",enabled:" + enabled + ",active:" + active + "});");
    }


    private void setControlValueFromClient(string ses_id, int id, string jstype, string value, string label, int enabled, int active, SqlCommand cmd)
    {
        cmd.CommandText = "UPDATE hcontrolvalues SET value = N'" + value + "', label = N'" + label + "', enabled = " + enabled + ", active = " + active + ", jstype = N'" + jstype + "', validated = 0 WHERE ([id] = " + id + ")";
        cmd.ExecuteNonQuery();
    }

    private HControlValue getDBControlValueByName(int ses_id, string name)
    {
        SqlDataReader sqlDataReader;

        SqlCommand cmd = new SqlCommand();
        cmd.CommandType = CommandType.Text;
        cmd.Connection = sqlConnection;
        sqlConnection.Open();
        cmd.CommandText = "SELECT * FROM [hcontrolvalues] WHERE (([ses_id] = " + ses_id + ") AND ([name] = '" + name + "'))";
        sqlDataReader = cmd.ExecuteReader();

        // The result should be exactly one row, because the session-specific
        // names should be unique
        int arrayLength = 0;
        string type = "";
        int id = 0;
        string value = "";
        string label = "";
        int enabled = 0;
        int active = 0;

        while (sqlDataReader.Read())
        {
            type = (string)sqlDataReader["jstype"];
            id = (int)sqlDataReader["id"];
            value = (string)sqlDataReader["value"];
            label = (string)sqlDataReader["label"];
            enabled = (int)sqlDataReader["enabled"];
            active = (int)sqlDataReader["active"];
            arrayLength++;
        }
        sqlConnection.Close();

        if (arrayLength > 1)
        {
            throw new Exception("MultipleValuesForValueNameError");
        }
        // Just returns null HControlValue, if no value row was found. We'll need
        // to insert one in that case.
        if (arrayLength == 0)
        {
            return new HControlValue();
        }
        /* Let's quote the the value for use in strings, if the jstype is a string */
        if (type == "string")
        {
            value = "'" + value + "'";
        }
        return new HControlValue(id, value, label, enabled, active);
    }

    private void initControlValue(int ses_id, string name, string value, string label, int enabled, int active, string jstype)
    {
        HControlValue hvalue = getDBControlValueByName(ses_id, name);
        int id = 0;
        // If getDBControlValueByName returns null HControlValue, the value was not found.
        // In that case, let's make a new value.
        if (hvalue.IsNull)
        {
            id = makeDBControlValue(ses_id, name, value, label, enabled, active, jstype);
        }
        else
        {
            id = hvalue.id;
            value = hvalue.value;
            label = hvalue.label;
            enabled = hvalue.enabled;
            active = hvalue.active;
        }
        // At this stage, the value is stored in the database, but let's also
        // make a value in the client namespace.
        makeJSControlValue(name, id, value, label, enabled, active);
    }

    private void syncJSControlValues(string ses_id)
    {
        SqlDataReader sqlDataReader;
        SqlCommand cmd = new SqlCommand();
        cmd.CommandType = CommandType.Text;
        cmd.Connection = sqlConnection;
        sqlConnection.Open();

        cmd.CommandText = "SELECT CAST(COUNT(*) AS int) as Int FROM [hcontrolvalues] WHERE (([changed] = 1) AND ([ses_id] = '" + ses_id + "'))";
        int sessionCount = (int)cmd.ExecuteScalar();

        cmd.CommandText = "SELECT [id], [value], [label], [enabled], [active], [jstype] FROM [hcontrolvalues] WHERE (([changed] = 1) AND ([ses_id] = '" + ses_id + "'))";
        sqlDataReader = cmd.ExecuteReader();

        int id = 0;
        string jstype = "";
        string value = "";
        string label = "";
        int enabled = 0;
        int active = 0;

        int[] array = new int[sessionCount];
        int arrayIndex = 0;
        while (sqlDataReader.Read())
        {
            id = (int)sqlDataReader[0];
            
            value = (string)sqlDataReader[1];
            label = (string)sqlDataReader[2];
            enabled = (int)sqlDataReader[3];
            active = (int)sqlDataReader[4];
            jstype = (string)sqlDataReader[5];
            if (jstype == "string")
            {
                value = "'" + value.Replace("'", "\\'") + "'";
            }
            label = "'" + label + "'";
            array[arrayIndex] = id;
            arrayIndex++;
            Response.Write("HValueManager.set(" + id + ",{value:" + value + ",label:" + label + ",enabled:" + enabled + ",active:" + active + "});");
        }
        sqlConnection.Close();

        sqlConnection.Open();
        for (int i = 0; i < arrayIndex; i++)
        {
            cmd.CommandText = "UPDATE hcontrolvalues SET changed = 0 WHERE ([id] = " + array[i] + ")";
        }
        sqlConnection.Close();
    }



    ////////////////////////////////////////////////////////////////////

    //Jukebox



    // Start the HelmiJukebox application
    private void InitializeJukebox(int ses_id)
    {
        Mp3PlayerValue mp3player = getMp3PlayerValue();
        // volume: 0 - 100
        initValue(ses_id, "jukeboxvolume", "100", "number");
        // on, off: 1, 0
        string play = "";
        int int_play = mp3player.play;
        if (int_play == 1)
        {
            play = "true";
        }
        else
        {
            play = "false";
        }

        initValue(ses_id, "jukeboxplay", play, "boolean");
        // song to play

        initValue(ses_id, "jukeboxsong", mp3player.name_id.ToString(), "number");
        initValue(ses_id, "jukeboxsongname", mp3player.name, "string");
        initValue(ses_id, "jukeboxindicator", mp3player.position.ToString(), "number");

        HTableColumn column1 = new HTableColumn(1,"id",1,100);
        HTableColumn column2 = new HTableColumn(1, "filename", 1, 100);
        HTableColumn column3 = new HTableColumn(1, "name", 1, 100);
        HTableColumn[] columns = new HTableColumn[] {column1, column2, column3};
        HTable table = new HTable(1,columns);
        initTable(ses_id, "tablevalue1", table, "object");

        Response.Write("application = new HelmiJukebox();");
    }
    private void setValidated(int ses_id, string name)
    {
        sqlCommand.CommandText = "UPDATE hvalues SET validated = 1 WHERE (([name] = '" + name + "') AND ([ses_id] = " + ses_id + "))";
        sqlCommand.ExecuteNonQuery();
    }


    private bool getDBValueByNameNotValidated(int ses_id, string name)
    {
        sqlCommand.CommandText = "SELECT CAST(COUNT(*) AS int) as Int FROM [hvalues] WHERE (([ses_id] = " + ses_id + ") AND ([name] = '" + name + "')AND ([validated] = 0))";
        int valueCount = (int)sqlCommand.ExecuteScalar();
        if (valueCount == 0)
        {
            return false;
        }
        else if (valueCount == 1)
        {
            return true;
        }
        else
        {
            throw new Exception("MultipleValuesForValueNameError");
        }
    }

    private void UpdateJukebox(int ses_id)
    {
        bool song_notvalidated = getDBValueByNameNotValidated(ses_id, "jukeboxsong");
        bool play_notvalidated = getDBValueByNameNotValidated(ses_id, "jukeboxplay");
        bool volume_notvalidated = getDBValueByNameNotValidated(ses_id, "jukeboxvolume");
        bool indicator_notvalidated = getDBValueByNameNotValidated(ses_id, "jukeboxindicator");
        

        bool table_notvalidated = getDBTableByNameNotValidated(ses_id, "tablevalue1");

        if (table_notvalidated == true)
        {
            HTable hvalue = getDBTableByName(ses_id, "tablevalue1");
            
            string tableArray = "[]";
            string dbcolumns = "";
            if (hvalue.columns.Length > 0)
            {
                dbcolumns += hvalue.columns[0].name.Trim();
                for (int i = 1; i < hvalue.columns.Length; i++)
                {
                    dbcolumns += ", " + hvalue.columns[i].name.Trim();
                }
            }
            int startrow = 0;
            int endrow = 0;
            if (hvalue.columns.Length > 0)
            {
                startrow = hvalue.columns[0].startrow;
                endrow = hvalue.columns[0].endrow;
                tableArray = GetMp3s(startrow, endrow, dbcolumns);
            }
            // MAY BE MOVED TO syncJSTables
            Response.Write("HValueManager.set(" + hvalue.id + "," + tableArray + ");");

            setTableValidated(ses_id, "tablevalue1");

        }
        bool updatedPlaying = false;
        if (song_notvalidated == true)
        {
            HValue song = getDBValueByName(ses_id, "jukeboxsong");
            int int_song = int.Parse(song.value);

            string name = getMp3SongName(int_song).Trim();

            Mp3PlayerValue mp3player = getMp3PlayerValue();
            sqlCommand.CommandText = "UPDATE mp3player SET play = 1, name = N'" + name + "', name_id = " + int_song + " WHERE ([id] = " + mp3player.id + ")";
            sqlCommand.ExecuteNonQuery();

            
            setValidated(ses_id, "jukeboxsong");
            setValueToAllClients("jukeboxsongname", "string", name);

            setValueToAllClients("jukeboxplay", "boolean", "true");
            //updatedPlaying = true;
            PlayFile(name);
        }
        if (volume_notvalidated == true)
        {
            NumberFormatInfo info = new NumberFormatInfo();
            info.NumberDecimalSeparator = ".";

            HValue volume = getDBValueByName(ses_id, "jukeboxvolume");

            int int_volume = (int)double.Parse(volume.value, info);
            Mp3PlayerValue mp3player = getMp3PlayerValue();
            

            sqlCommand.CommandText = "UPDATE mp3player SET volume = " + int_volume + " WHERE ([id] = " + mp3player.id + ")";
            sqlCommand.ExecuteNonQuery();

            setVolume(int_volume);

            setValueToAllClients("jukeboxvolume", "number", int_volume.ToString());

        }
        if (play_notvalidated == true)
        {
            HValue play = getDBValueByName(ses_id, "jukeboxplay");
            bool bool_play = bool.Parse(play.value);
            
            Mp3PlayerValue mp3player = getMp3PlayerValue();
            if (bool_play == false)
            {
                sqlCommand.CommandText = "UPDATE mp3player SET play = 0 WHERE ([id] = " + mp3player.id + ")";
                sqlCommand.ExecuteNonQuery();
                setValueToAllClients("jukeboxplay", "boolean", "false");

                Pause();
            }

            else
            {
                if (mp3player.name_id != 0)
                {
                    if (updatedPlaying == false)
                    {
                        sqlCommand.CommandText = "UPDATE mp3player SET play = 1 WHERE ([id] = " + mp3player.id + ")";
                        sqlCommand.ExecuteNonQuery();
                        setValueToAllClients("jukeboxplay", "boolean", "true");
                        PlayFile(mp3player.name);
                    }
                }
                // reverts the button if the song is not selected
                // -> TODO: make disabled instead
                else
                {
                    setValueToAllClients("jukeboxplay", "boolean", "false");
                }   
            }
        }

        if (indicator_notvalidated == true)
        {
            WindowsMediaPlayer Player = getPlayer();
            // has song?
            if (Player.controls.currentItem != null)
            {
                NumberFormatInfo info = new NumberFormatInfo();
                info.NumberDecimalSeparator = ".";

                HValue indicator = getDBValueByName(ses_id, "jukeboxindicator");
                double double_indicator = double.Parse(indicator.value, info);

                double duration = Player.controls.currentItem.duration;
                
                double position = (double_indicator / 100) * duration;
                //Response.Write("aaaa=" + (double_indicator / 100) + "");
                setPosition(position);
                setValueToAllClients("jukeboxindicator", "number", indicator.value);
                //Response.Write("indicator=" + indicator.value + ";");*/
            }
        }
        else
        {
            WindowsMediaPlayer Player = getPlayer();
            if (Player.controls.currentItem != null)
            {
                double currentPosition = Player.controls.currentPosition;
                double duration = Player.controls.currentItem.duration;
                int position = (int)(currentPosition / duration * 100);
                setValueToAllClients("jukeboxindicator", "number", position.ToString());
            }
        }
        
    }
    string getMp3SongName(int id)
    {
        SqlDataReader sqlDataReader;
        sqlCommand.CommandText = "SELECT [filename] FROM [mp3s] WHERE ([id] = "+id+")";
        sqlDataReader = sqlCommand.ExecuteReader();

        int arrayLength = 0;
        string filename = "";

        while (sqlDataReader.Read())
        {
            filename = (string)sqlDataReader["filename"];
            arrayLength++;
        }
        sqlConnection.Close();
        sqlConnection.Open();
        if (arrayLength > 1)
        {
            throw new Exception("MultipleValuesForMp3PlayerValueNameError");
        }
        return filename;
    }

    Mp3PlayerValue getMp3PlayerValue()
    {
        SqlDataReader sqlDataReader;

        sqlCommand.CommandText = "SELECT * FROM [mp3player]";
        sqlDataReader = sqlCommand.ExecuteReader();

        int arrayLength = 0;
        int id = 0;
        int play = 0;
        string name = "";
        int position = 0;
        int volume = 0;
        int name_id = 0;

        while (sqlDataReader.Read())
        {
            id = (int)sqlDataReader["id"];
            play = (int)sqlDataReader["play"];
            name = (string)sqlDataReader["name"];
            position = (int)sqlDataReader["position"];
            volume = (int)sqlDataReader["position"];
            name_id = (int)sqlDataReader["name_id"];
            arrayLength++;
        }
        sqlConnection.Close();
        sqlConnection.Open();
        if (arrayLength > 1)
        {
            throw new Exception("MultipleValuesForMp3PlayerValueNameError");
        }
        return new Mp3PlayerValue(id, play, name, position, volume, name_id);
    }
    void updateMp3PlayerValue(int id, int play, string name, int position)
    {
        SqlCommand cmd = new SqlCommand();
        cmd.CommandType = CommandType.Text;
        cmd.Connection = sqlConnection;
        sqlConnection.Open();
        cmd.CommandText = "UPDATE mp3player SET play = "+play+", name = N'" + name + "', position = " + position + " WHERE ([id] = " + id + ")";
        cmd.ExecuteNonQuery();
        sqlConnection.Close();
    }
    private WindowsMediaPlayer getPlayer()
    {
        WindowsMediaPlayer Player = null;
        if (Application["MyPlayer"] != null)
        {
            Player = (WindowsMediaPlayer)Application["MyPlayer"];
        }
        else
        {
            Player = new WindowsMediaPlayer();
            Application["MyPlayer"] = Player;
        }
        return Player;
    }
    private void setVolume(int volume)
    {
        WindowsMediaPlayer Player = getPlayer();
        Player.settings.volume = volume;
        
    }
    private void setPosition(double position)
    {
        WindowsMediaPlayer Player = getPlayer();
        Player.controls.currentPosition = position;

    }
    private void PlayFile(String url)
    {
        WindowsMediaPlayer Player = null;
        if (Application["MyPlayer"] != null)
        {
            Player = (WindowsMediaPlayer)Application["MyPlayer"];
        }
        else
        {
            Player = new WindowsMediaPlayer();
            Application["MyPlayer"] = Player;
        }
        Player.URL = url;
        Player.controls.play();
    }
    private void Pause()
    {
        WindowsMediaPlayer Player = null;
        if (Application["MyPlayer"] != null)
        {
            Player = (WindowsMediaPlayer)Application["MyPlayer"];
            Player.controls.pause();
        }
    }

    private int InitializeMp3sTest()
    {
        sqlCommand.CommandText = "SELECT CAST(COUNT(*) AS int) as Int FROM [mp3s]";
        int mp3Count = (int)sqlCommand.ExecuteScalar();
        return mp3Count;
    }



    private string GetMp3s(int startRow,int endRow, string columns)
    {
        sqlCommand.CommandText = "SELECT CAST(COUNT(*) AS int) as Int FROM [mp3s]";
        int mp3Count2 = (int)sqlCommand.ExecuteScalar();
        // limit check
        if (endRow >= mp3Count2)
        {
            endRow = mp3Count2;
        }

        SqlDataReader sqlDataReader;
        sqlCommand.CommandText = "WITH OrderedOrders AS "+
        "("+
        "SELECT " + columns + ", " +
        "ROW_NUMBER() OVER (ORDER BY id) AS 'RowNumber' "+
        "FROM mp3s "+
        ") "+
        "SELECT * "+
        "FROM OrderedOrders "+
        "WHERE RowNumber BETWEEN " + startRow + " AND " + endRow;

        int mp3Count = endRow - startRow + 1;
        Mp3Value[] mp3s = new Mp3Value[mp3Count];
        
        sqlDataReader = sqlCommand.ExecuteReader();
        int arrayLength = 0;

        int id = 0;
        string name = "";
        string filename = "";

        while (sqlDataReader.Read())
        {

            id = (int)sqlDataReader["id"];
            name = (string)sqlDataReader["name"];
            filename = (string)sqlDataReader["filename"];
            mp3s[arrayLength] = new Mp3Value(id, name, filename);

            arrayLength++;
        }
        sqlConnection.Close();
        sqlConnection.Open();
        string myArray = "[";
        if (mp3Count > 0)
        {
            myArray += "[" + mp3s[0].id + ",'" + Regex.Escape(mp3s[0].name.Trim()) + "','" + Regex.Escape(mp3s[0].filename.Trim()) + "']\n";
            for (int i = 1; i < mp3Count; i++)
            {
                myArray += ",[" + mp3s[i].id + ",'" + Regex.Escape(mp3s[i].name.Trim()) + "','" + Regex.Escape(mp3s[i].filename.Trim()) + "']\n";
            }
        }
        myArray += "]";
        return myArray;
    }

}
