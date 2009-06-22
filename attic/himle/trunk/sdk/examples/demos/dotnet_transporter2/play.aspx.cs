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

using AxWMPLib;
using WMPLib;

public partial class play : System.Web.UI.Page
{
    WindowsMediaPlayer Player;
    protected void Page_Load(object sender, EventArgs e)
    {
        Response.ContentType = "text/plain;charset=utf-8";

        Response.CacheControl = "no-cache";
        Response.AddHeader("Pragma", "no-cache");
        Response.Expires = -1;
        PlayFile(@"c:\mp3\0.mp3");
        //AxWindowsMediaPlayer Player = new AxWindowsMediaPlayer();
        //Player.
        
        //Player.Visible = false;
        //Player.URL = @"c:\Windows\Media\chimes.wav";
        
        //Player.Ctlcontrols.play();
        //Response.Write(Player.ToString());
        //Response.Flush();

    }
    private void PlayFile(String url)
    {
        Player = null;
        if (Application["MyPlayer"] != null)
        {
            Player = (WindowsMediaPlayer)Application["MyPlayer"];
        }
        else
        {
            Player = new WindowsMediaPlayer();
            Application["MyPlayer"] = Player;
        }
        /*Player.PlayStateChange +=
            new WMPLib._WMPOCXEvents_PlayStateChangeEventHandler(Player_PlayStateChange);
        Player.MediaError +=
            new WMPLib._WMPOCXEvents_MediaErrorEventHandler(Player_MediaError);
        */
        Player.URL = url;
        Player.controls.play();
    }
    private void Pause()
    {
        Player = null;
        if (Application["MyPlayer"] != null)
        {
            Player = (WindowsMediaPlayer)Application["MyPlayer"];
            Player.controls.pause();
        }
    }

}
