const TOOLS = [
  {
    name: "snow_query_records",
    description: "Query records from any ServiceNow table",
    inputSchema: {
      type: "object",
      properties: {
        table: { type: "string", description: "Table name e.g. incident, sys_user, sc_cat_item" },
        query: { type: "string", description: "Encoded query string e.g. active=true^category=software" },
        fields: { type: "string", description: "Comma-separated fields to return. Omit for default fields." },
        limit: { type: "number", description: "Max records to return (default 10)" },
      },
      required: ["table"],
    },
  },
  {
    name: "snow_get_record",
    description: "Get a single ServiceNow record by sys_id",
    inputSchema: {
      type: "object",
      properties: {
        table: { type: "string" },
        sys_id: { type: "string" },
        fields: { type: "string", description: "Comma-separated fields to return. Omit for default fields." },
      },
      required: ["table", "sys_id"],
    },
  },
  {
    name: "snow_create_record",
    description: "Create a new record in a ServiceNow table",
    inputSchema: {
      type: "object",
      properties: {
        table: { type: "string" },
        fields: { type: "object", description: "Key-value pairs of fields to set" },
      },
      required: ["table", "fields"],
    },
  },
  {
    name: "snow_update_record",
    description: "Update an existing ServiceNow record by sys_id",
    inputSchema: {
      type: "object",
      properties: {
        table: { type: "string" },
        sys_id: { type: "string" },
        fields: { type: "object", description: "Key-value pairs of fields to update" },
      },
      required: ["table", "sys_id", "fields"],
    },
  },
  {
    name: "snow_delete_record",
    description: "Delete a ServiceNow record by sys_id",
    inputSchema: {
      type: "object",
      properties: {
        table: { type: "string" },
        sys_id: { type: "string" },
      },
      required: ["table", "sys_id"],
    },
  },
  {
    name: "snow_get_schema",
    description: "Get field definitions for a ServiceNow table from sys_dictionary",
    inputSchema: {
      type: "object",
      properties: {
        table: { type: "string" },
      },
      required: ["table"],
    },
  },
];

function createHandler(snowFn) {
  return async function handleTool(name, args) {
    try {
      let result;

      if (name === "snow_query_records") {
        const params = new URLSearchParams();
        if (args.query) params.set("sysparm_query", args.query);
        if (args.fields) params.set("sysparm_fields", args.fields);
        params.set("sysparm_limit", String(args.limit ?? 10));
        params.set("sysparm_display_value", "false");
        result = await snowFn("GET", `/table/${args.table}?${params}`);

      } else if (name === "snow_get_record") {
        const params = new URLSearchParams();
        if (args.fields) params.set("sysparm_fields", args.fields);
        params.set("sysparm_display_value", "false");
        result = await snowFn("GET", `/table/${args.table}/${args.sys_id}?${params}`);

      } else if (name === "snow_create_record") {
        result = await snowFn("POST", `/table/${args.table}`, args.fields);

      } else if (name === "snow_update_record") {
        result = await snowFn("PATCH", `/table/${args.table}/${args.sys_id}`, args.fields);

      } else if (name === "snow_delete_record") {
        result = await snowFn("DELETE", `/table/${args.table}/${args.sys_id}`);

      } else if (name === "snow_get_schema") {
        const params = new URLSearchParams({
          sysparm_query: `name=${args.table}^internal_type!=collection`,
          sysparm_fields: "element,internal_type,column_label,mandatory,max_length,reference",
          sysparm_limit: "200",
        });
        result = await snowFn("GET", `/table/sys_dictionary?${params}`);

      } else {
        throw new Error(`Unknown tool: ${name}`);
      }

      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    } catch (err) {
      return { content: [{ type: "text", text: `Error: ${err.message}` }], isError: true };
    }
  };
}

module.exports = { TOOLS, createHandler };
