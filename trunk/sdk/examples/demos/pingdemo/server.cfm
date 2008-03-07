<cfoutput>

<!--- How many seconds to wait for another request before the client is considered dead. --->
<cfset deactivate_users_after = 10>

<cfset ses_id = form.ses_id>


<cfif ses_id eq 0 or not StructKeyExists(session, ses_id)>

  <!--- Session not yet defined. Create new session id. --->
  
  <!--- Just a random ID, nothing fancy. --->
	<cfset ses_id = CreateUUID()>
  
  <cfset session[ses_id] = StructNew()>
	t.ses_id = '#ses_id#';
  <!--- console.log("Setting ses_id: " + t.ses_id); --->
  
  t.syncDelay = 0;
  <!--- console.log("Setting syncDelay: " + t.syncDelay); --->
  
  <!--- <cfset temp = StructClear(session)> --->
  <!--- <cfset session.ses_id = ses_id> --->
  
  <cfquery name="cleanup" datasource="#datasource#">
  delete from pings where id = '#ses_id#'
  </cfquery>
  <cfquery name="insert_initial" datasource="#datasource#">
  insert into pings
  (id, minimum, maximum, average, user_agent, last_update, active)
  values
  ('#ses_id#', 0, 0, 0, '#CGI.HTTP_USER_AGENT#', #CreateODBCDateTime(now())#, 0)
  </cfquery>
  
<cfelse>

  <cfset tick_count = GetTickCount()>
  
  <cfparam name="session[ses_id].ui" default="false">
  <cfparam name="session[ses_id].running" default="false">
  <cfparam name="session[ses_id].last_tick" default="">
  <cfparam name="session[ses_id].min_tick" default="">
  <cfparam name="session[ses_id].max_tick" default="">
  <cfparam name="session[ses_id].ticks_done" default="0">
  <cfparam name="session[ses_id].ticks_total" default="0">
  
  <!--- Session OK. Proceed with the UI. --->
  
  <cfif not session[ses_id].ui>
    pingDemoApp = new PingDemoApp();
    HValueManager.set("running", false);
    <cfset session[ses_id].ui = true>
  </cfif>
  
  <!--- UI done. Start doing stuff. --->
  
  <cfif session[ses_id].running>

    <cfif isNumeric(session[ses_id].last_tick)>
    
      <cfset delay = tick_count - session[ses_id].last_tick>
      
      <cfset session[ses_id].ticks_done = session[ses_id].ticks_done + 1>
      <cfset session[ses_id].ticks_total = session[ses_id].ticks_total + delay>
      
      HValueManager.set("delayData", #delay#);
      
      <cfset average = round(session[ses_id].ticks_total / session[ses_id].ticks_done)>
      HValueManager.set("averageDelayData", #average#);
      
      <cfif not isNumeric(session[ses_id].min_tick) or delay lt session[ses_id].min_tick>
        <cfset session[ses_id].min_tick = delay>
        HValueManager.set("minDelayData", #delay#);
      </cfif>
      
      <cfif not isNumeric(session[ses_id].max_tick) or delay gt session[ses_id].max_tick>
        <cfset session[ses_id].max_tick = delay>
        HValueManager.set("maxDelayData", #delay#);
      </cfif>
      
      
      <cfquery name="update_values" datasource="#datasource#">
      update pings set
      minimum = #session[ses_id].min_tick#,
      maximum = #session[ses_id].max_tick#,
      average = #average#,
      active = 1,
      last_update = #CreateODBCDateTime(now())#
      where id = '#ses_id#'
      </cfquery>
      
    </cfif>
    
    <cfset session[ses_id].last_tick = tick_count>
    
  </cfif>
  
  
  <cfquery name="cleanup_old_users" datasource="#datasource#">
  update pings set
  active = 0
  where last_update < #CreateODBCDateTime(DateAdd("s", -deactivate_users_after, now()))#
  </cfquery>
  
  
  <cfquery name="active_users" datasource="#datasource#">
  select count(*) as cnt
  from pings
  where
  active = 1 and
  average > 0 and
  last_update >= #CreateODBCDateTime(DateAdd("s", -deactivate_users_after, now()))#
  </cfquery>
  HValueManager.set("activeUsersData", #active_users.cnt#);
  
  <cfquery name="active_average" datasource="#datasource#">
  select round(sum(average) / count(*)) as average
  from pings
  where
  active = 1 and
  average > 0 and
  last_update >= #CreateODBCDateTime(DateAdd("s", -deactivate_users_after, now()))#
  </cfquery>
  HValueManager.set("activeAverageDelayData", #val(active_average.average)#);
  

  <!---
  <hsyncvalues version="1700" length="2">
    <hvalue id="running" order="0" jstype="boolean" length="5">false</hvalue>
    <hvalue id="delayData" order="1" jstype="number" length="2">84</hvalue>
  </hsyncvalues>
  --->
  <cfif isDefined("form.hsyncdata")>
    <cfset xmldoc = XmlParse(form.hsyncdata, yes)>
    <cfset running = XmlSearch(xmldoc, "/hsyncvalues/hvalue[@id='running']")>
    
    <cfloop from="1" to="#ArrayLen(running)#" index="i">
      <cfset session[ses_id].running = running[i].XmlText>
      <cfif not session[ses_id].running>
        <cfquery name="deactivate" datasource="#datasource#">
        update pings set
        active = 0
        where id = '#ses_id#'
        </cfquery>
        <cfset session[ses_id].last_tick = "">
      <cfelse>
        <cfquery name="activate" datasource="#datasource#">
        update pings set
        active = 1
        where id = '#ses_id#'
        </cfquery>
      </cfif>
    </cfloop>
    
  </cfif>
  
</cfif>

</cfoutput>
