---
title: "Exercise: Prepare and Send an API Request to the Table API"
source: "https://developer.servicenow.com/dev.do#!/learn/courses/zurich/app_store_learnv2_rest_zurich_rest_integrations/app_store_learnv2_rest_zurich_inbound_rest_integrations/app_store_learnv2_rest_zurich_exercise_prepare_and_send_an_api_request_to_the_table_api"
captured: 2026-04-02
---

# Exercise: Prepare and Send an API Request to the Table API

Inbound REST Integrations\>Exercise: Prepare and Send an API Request to the Table API

In this exercise, you will use the REST API Explorer to prepare a request for the ServiceNow _Table API_. You will create a request that returns all active _Incident_ table records with the string _email_ in the _Short description_ field. You will also test the API request.

**NOTE**: If your PDI automatically opens App Engine Studio, you need to change the user role used to access the PDI. To complete the exercises, [switch to the **Admin** user role](https://developer.servicenow.com/dev.do#!/guides/utah/developer-program/pdi-guide/managing-your-pdi#changing-your-instance-user-role).

## Preparation - Get the Encoded Query

1.  In the main ServiceNow browser window, use the _All_ menu to open **Incident > Open**.
2.  Click the **Show / hide filter** icon (
    
    ![The filter icon is in the header.  It opens the Condition Builder.](https://developer.servicenow.com/app_store_learnv2_rest_zurich_inbound_images_inbound_filtericon.png)
    
    ) in the _Incidents_ to open the Condition Builder.
3.  Create the conditions shown:
    
    ![Find the active incidents with the string email in the short description field.](https://developer.servicenow.com/app_store_learnv2_rest_zurich_inbound_images_inbound_emailincidentscondition.png)
    
4.  Click the **Run** button.
5.  Notice how many records are returned and examine their _Short descriptions_.
6.  Right-click the **Short description contains email** part of the breadcrumbs and select the **Copy query** menu item.
    
    ![Copy the query](https://developer.servicenow.com/app_store_learnv2_rest_zurich_inbound_images_inbound_copyemailquery.png)
    

## Configure the Table API Query

1.  In the main ServiceNow browser window, use the _All_ menu to open **System Web Services > REST > REST API Explorer**.
2.  In the REST API Explorer, configure the API:
    1.  _Method (this field does not have a label)_: **Retrieve records from a table (GET)**
        
3.  Configure the _Path parameters_:
    1.  _tableName_:  **Incident (incident)**
        
4.  Configure the _Query parameters_:
    1.  _sysparm\_query_: **<paste in the encoded query you copied in the preparation section of this exercise>**
        
        _sysparm\_display\_value_: **true**
        
        _sysparm\_limit_: **10 (Limited to 10 results for testing)**
        
5.  Read about the possible performance implications of setting _sysparm\_display\_value_ to true.
    1.  Click the **REST API Explorer** menu and select the **API documentation** menu item.
        
        ![](https://developer.servicenow.com/app_store_learnv2_rest_zurich_inbound_images_inbound_apidocsmenu.png)
        
    2.  On the docs site, click the appropriate ServiceNow version link.
    3.  On the _Table API_ docs site page, scroll to the **Table - GET /now/table/{tableName}** section of the page.
    4.  Locate the _sysparm\_display\_value_ description and read the _Note_. The personal developer instances have small data sets, so setting this value to _true_ will not cause performance issues.
6.  Return to the REST API Explorer and add fields to the _sysparm\_fields_ list.
    1.  Click the **Edit** button (
        
        ![Edit button](https://developer.servicenow.com/app_store_learnv2_rest_zurich_inbound_images_inbound_editbutton.png)
        
        ) on the _sysparm\_fields_ field.
    2.  When the slushbucket opens, start typing **Number** or scroll down until you see the **Number** field.
    3.  Click the **Number** field then click the **Add** button (
        
        ![Add button](https://developer.servicenow.com/app_store_learnv2_rest_zurich_inbound_images_inbound_addbutton.png)
        
        ).
    4.  Also add the **Caller**, **Short description**, and **Priority** fields.
    5.  Click the **Save** button.
        
        ![The fields in the sysparm_fields list](https://developer.servicenow.com/app_store_learnv2_rest_zurich_inbound_images_inbound_sysparmfields.png)
        

## Configure the Request Headers

1.  In the REST API Explorer, scroll to the _Request Headers_ section and verify the header fields are set as shown:
    
    ![The request header settings for the exercise are application/json for both the Request format and Request response](https://developer.servicenow.com/app_store_learnv2_rest_zurich_inbound_images_inbound_requestheadersexercise.png)
    

## Test the API Request

1.  Click the **Send** button.
2.  When the response is returned, examine the _Status code_. It should be _200_.
3.  The returned result is an array of objects. Each of the objects is a record from the _Incident_ table. Examine the response body to see which records were returned. Are these the records you expected?
4.  In the returned records, the _caller\_id_ object contains a link. For one of the returned records, copy the link and paste it into a new browser tab. What record does the link open?
    
    ![The caller_id object is part of the Incident record object](https://developer.servicenow.com/app_store_learnv2_rest_zurich_inbound_images_inbound_calleridobject.png)
    

## Test the sysparm\_exclude\_reference\_link Query Parameter

1.  Scroll back to the _Query parameters_ section in the REST API Explorer and set the _sysparm\_exclude\_reference\_link_ parameter to **true**.
2.  Click the **Send** button again.
3.  Return to the response body and examine the format of the response.

## Test the sysparm\_fields Query Parameter

1.  Scroll back to the _Query parameters_ section in the REST API Explorer and delete the contents of the _sysparm\_fields_ parameter.
    
    ![No value in the sysparm_fields parameter](https://developer.servicenow.com/app_store_learnv2_rest_zurich_inbound_images_inbound_nofields.png)
    
2.  Click the **Send** button again.
3.  Return to the response body and examine the format of the response.