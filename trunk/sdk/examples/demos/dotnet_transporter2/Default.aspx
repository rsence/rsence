<%@ Page Language="C#" AutoEventWireup="true"  CodeFile="Default.aspx.cs" Inherits="_Default" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml" >
<head runat="server">
    <title>Untitled Page</title>
</head>
<body>
    <form id="form1" runat="server">
    <div>
      <asp:SqlDataSource ID="SqlDataSource1" runat="server" ConnectionString="<%$ ConnectionStrings:ConnectionString %>"
        SelectCommand="SELECT * FROM [hvalues]" InsertCommand="INSERT INTO mp3s(filename, name, artist, album, comments, genre, tracknum, trackcount, year, bitrate, frequency, duration, layer, mpeglevel, mode) VALUES (N'e', N'e', N'ee', N'ee', N'ee', N'ee', 1, 1, 1, 1, 1, N'22', N'33', N'3', N'33')" ></asp:SqlDataSource>
    
    </div>
      <asp:DataList ID="DataList1" runat="server" DataKeyField="id" DataSourceID="SqlDataSource1">
        <ItemTemplate>
          id:
          <asp:Label ID="idLabel" runat="server" Text='<%# Eval("id") %>'></asp:Label><br />
          ses_id:
          <asp:Label ID="ses_idLabel" runat="server" Text='<%# Eval("ses_id") %>'></asp:Label><br />
          name:
          <asp:Label ID="nameLabel" runat="server" Text='<%# Eval("name") %>'></asp:Label><br />
          value:
          <asp:Label ID="valueLabel" runat="server" Text='<%# Eval("value") %>'></asp:Label><br />
          jstype:
          <asp:Label ID="jstypeLabel" runat="server" Text='<%# Eval("jstype") %>'></asp:Label><br />
          changed:
          <asp:Label ID="changedLabel" runat="server" Text='<%# Eval("changed") %>'></asp:Label><br />
          valitated:
          <asp:Label ID="valitatedLabel" runat="server" Text='<%# Eval("valitated") %>'></asp:Label><br />
          <br />
        </ItemTemplate>
      </asp:DataList>
    </form>
</body>
</html>
