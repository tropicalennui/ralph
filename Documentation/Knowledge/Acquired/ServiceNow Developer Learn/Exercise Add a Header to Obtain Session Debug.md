---
title: "Exercise: Add a Header to Obtain Session Debug"
source: "https://developer.servicenow.com/dev.do#!/learn/courses/zurich/app_store_learnv2_rest_zurich_rest_integrations/app_store_learnv2_rest_zurich_inbound_rest_integrations/app_store_learnv2_rest_zurich_exercise_add_a_header_to_obtain_session_debug"
captured: 2026-04-02
---

# Exercise: Add a Header to Obtain Session Debug

In this exercise, you will add the _X-WantSessionDebug_ header to the _Incident_ table GET request.

## Preparation - Create a Query

1.  If you do not still have the REST API Explorer open from the last exercise, open it now.
2.  Create this query for the _Table API_:
    
    ![Create a query for the incident table which returns the Number and Short description fields.  Limit the request to one record.](https://developer.servicenow.com/app_store_learnv2_rest_zurich_inbound_images_inbound_oneincrec.png)
    

## Add a Header

1.  In the REST API Explorer, scroll to the _Request headers_ section.
2.  Click the **Add header** button.
3.  Configure the new header:
    1.  _Name_: **X-WantSessionDebugMessages**
        
        _Value_: **true**
        
        ![The value for X-WantSessionDebugMessages is true.](https://developer.servicenow.com/app_store_learnv2_rest_zurich_inbound_images_inbound_addheaderdebug.png)
        
4.  Session debug must be enabled for this header to return results. Enable session debugging for SQL queries.
    1.  Open your personal developer instance in a new browser tab, so you do not lose the configuration you just did in the REST API Explorer.
    2.  Use the _All_ menu to enable **System Diagnostics > Session Debug > Debug SQL**. Debugging will be enabled.

## Test the Header

1.  Return to the REST API Explorer and click the **Send** button.
2.  Examine the _session_ object in the _Response body_.
3.  Return to the ServiceNow browser window where you enabled _Debug SQL_ and disable session debugging by selecting **System Diagnostics > Session Debug > Disable All** in the _All_ menu.
4.  Enable security debugging by selecting **System Diagnostics > Session Debug > Debug Security** in the _All_ menu.
5.  Return to the REST API Explorer and send the request again.
6.  Examine the _session_ object in the response body. Access control evaluation is included in the _session_ object.
    
    ![Access control evaluation is logged to the session object](https://developer.servicenow.com/app_store_learnv2_rest_zurich_inbound_images_inbound_accesscontroldebug.png)
    
7.  Return to the ServiceNow browser window where you set _Debug Security_ and disable session debugging. Select **System Diagnostics > Session Debug > Disable All** in the _All_ menu.