<%@ Page Language="C#" ValidateRequest="false" AutoEventWireup="true" CodeFile="transporter.aspx.cs" Inherits="transporter" %>

<asp:sqldatasource id="SqlDataSource1" runat="server" connectionstring="<%$ ConnectionStrings:ConnectionString %>"
  selectcommand="SELECT * FROM [Customers]"></asp:sqldatasource>
