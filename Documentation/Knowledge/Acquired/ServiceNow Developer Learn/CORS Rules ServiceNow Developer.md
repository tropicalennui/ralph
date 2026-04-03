---
title: "CORS Rules | ServiceNow Developer"
source: "https://developer.servicenow.com/dev.do#!/learn/courses/zurich/app_store_learnv2_rest_zurich_rest_integrations/app_store_learnv2_rest_zurich_inbound_rest_integrations/app_store_learnv2_rest_zurich_cors_rules"
captured: 2026-04-03
---

# CORS Rules | ServiceNow Developer

# CORS Rules

Inbound REST Integrations\>CORS Rules

Cross-Origin Resource Sharing (CORS) rules control which domains can access specific REST API endpoints. To create a CORS rule, use the _All_ menu to open **System Web Services > REST > CORS Rules**.

In the example, the resource [https://www.test-cors.org](https://www.test-cors.org) can only access the _Table API_ using the _GET_ method.  

![https://www.test-cors.org can be used to test CORS rules](https://developer.servicenow.com/app_store_learnv2_rest_zurich_inbound_images_inbound_corsrule.png)

*   _**REST API**_: The REST API the CORS rule applies to.
*   _**Domain**_: The domain for the CORS rule. Specify the domain using an IP Address or a domain pattern.
*   _**Max age**_: The number of seconds to cache the client session. After an initial CORS request, further requests from the same client within the specified time do not require a preflight message. If a value is not specified, the default value of 0 indicates that all requests require a preflight message.
*   _**HTTP Methods**_: The methods allowed.
*   _**HTTP Headers**_: A comma-separated list of HTTP headers to send in the response. Specified headers are added to the _Access-Control-Expose-Headers_ header.

There are a number of requirements for specifying the domain including:

*   Start with _http://_ or _https://_
*   Must be an IP address or domain pattern
*   Can contain only one wildcard \*

Check out the complete list of [CORS domain requirements](https://docs.servicenow.com/bundle/utah-application-development/page/integrate/inbound-rest/reference/r_CORSDomainRequirements.html) on the docs.servicenow.com site.

**IMPORTANT**: CORS Rules cannot be tested in the REST API Explorer.