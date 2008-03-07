<cfapplication name = "pingapp"
  sessionmanagement = "yes"
  sessiontimeout = "#CreateTimeSpan(0, 0, 20, 0)#"> <!--- 20 minutes --->

<cfset datasource = "pingdemo">
