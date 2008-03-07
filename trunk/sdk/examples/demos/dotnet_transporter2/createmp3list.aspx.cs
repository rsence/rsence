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


using System.IO;
using HundredMilesSoftware.UltraID3Lib;

public partial class createmp3list : System.Web.UI.Page
{
    private string mp3sUrl = "c:\\mp3s";

    public string connectionString = "Data Source=.\\SQLEXPRESS;AttachDbFilename=|DataDirectory|\\Database.mdf;Integrated Security=True;User Instance=True";

    private SqlConnection sqlConnection;

    protected void Page_Load(object sender, EventArgs e)
    {
        Response.ContentType = "text/plain;charset=utf-8";

        Response.CacheControl = "no-cache";
        Response.AddHeader("Pragma", "no-cache");
        Response.Expires = -1;

        sqlConnection = new SqlConnection(connectionString);
        
        readDirectory();
        
        Response.Flush();
    }
    public void readDirectory()
    {
        DirectoryInfo dir = new DirectoryInfo(mp3sUrl);
        foreach (FileInfo f in dir.GetFiles("*.mp3"))
        {
            //string name = f.Name.Substring(0,f.Name.IndexOf("."));
            string name = f.Name;
            
            string filename = mp3sUrl + "\\" + name;
            UltraID3 ultra = new UltraID3();
            ultra.Read(filename);

            name = name.Replace("'", "");
            filename = filename.Replace("'", "");

            string artist = ultra.Artist;
            string album = ultra.Album;
            string comments = ultra.Comments;
            string genre = ultra.Genre;
            /*
            short tracknum = (short)ultra.TrackNum;
            short trackcount = (short)ultra.TrackCount;
            short year = (short)ultra.Year;
            */
            short tracknum = 0;
            short trackcount = 0;
            short year = 0;

            short bitrate = ultra.FirstMPEGFrameInfo.Bitrate;
            int frequency = ultra.FirstMPEGFrameInfo.Frequency;
            string duration = ultra.FirstMPEGFrameInfo.Duration.ToString();
            string layer = ultra.FirstMPEGFrameInfo.Layer.ToString();
            string level = ultra.FirstMPEGFrameInfo.Level.ToString();
            string mode = ultra.FirstMPEGFrameInfo.Mode.ToString();
            
            /*Response.Write(name + "\n");
            Response.Write(artist + "\n");
            Response.Write(album + "\n");
            Response.Write(comments + "\n");
            Response.Write(genre + "\n");
            Response.Write(tracknum + "\n");
            Response.Write(trackcount + "\n");
            Response.Write(year + "\n");
            
            
            Response.Write(bitrate + "\n");
            Response.Write(frequency + "\n");
            Response.Write(duration + "\n");
            Response.Write(layer + "\n");
            Response.Write(level + "\n");
            Response.Write(mode + "\n");*/
            
            Response.Write("\n");
            createAndCheckMp3Value(filename, name, artist, album, comments, genre,
                tracknum, trackcount, year, bitrate, frequency, duration,
                layer, level, mode);
        }
    }
    private void createAndCheckMp3Value(string filename, string name, string artist,
    string album, string comments, string genre, short tracknum, short trackcount, short year, short bitrate, int frequency, string duration, string layer, string mpeglevel, string mode
    )
    {
        SqlCommand cmd = new SqlCommand();
        cmd.CommandType = CommandType.Text;
        cmd.Connection = sqlConnection;
        sqlConnection.Open();

        cmd.CommandText = "SELECT CAST(COUNT(*) AS int) as Int FROM [mp3s] WHERE ([filename] = N'"+filename+"')";
        int filenameCount = (int)cmd.ExecuteScalar();
        sqlConnection.Close();


        if (filenameCount == 0)
        {

            makeDBMp3Value(filename, name, artist, album, comments, genre,
        tracknum, trackcount, year, bitrate, frequency, duration,
        layer, mpeglevel, mode);
        }
    }



    private int makeDBMp3Value(string filename,string name,string artist,
        string album, string comments, string genre, short tracknum, short trackcount, short year, short bitrate, int frequency, string duration, string layer, string mpeglevel, string mode
        )
    {
        Int32 newProdID = 0;
        
        string sql =
          "INSERT INTO mp3s(filename, name, artist, album, comments, genre, tracknum, trackcount, year, bitrate, frequency, duration, layer, mpeglevel, mode) VALUES (N'"+filename+"', N'"+name+"', N'"+artist+"', N'"+album+"', N'"+comments+"', N'"+genre+"', "+tracknum+", "+trackcount+", "+year+", "+bitrate+", "+frequency+", N'"+duration+"', N'"+layer+"', N'"+mpeglevel+"', N'"+mode+"'); "
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
