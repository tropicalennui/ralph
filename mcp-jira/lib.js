const TOOLS = [
  {
    name: "jira_get_issue",
    description: "Get details of a Jira issue by key (e.g. AEI-1)",
    inputSchema: {
      type: "object",
      properties: { key: { type: "string", description: "Issue key e.g. AEI-1" } },
      required: ["key"],
    },
  },
  {
    name: "jira_search_issues",
    description: "Search Jira issues using JQL",
    inputSchema: {
      type: "object",
      properties: {
        jql: { type: "string", description: "JQL query string" },
        maxResults: { type: "number", description: "Max results to return (default 20)" },
      },
      required: ["jql"],
    },
  },
  {
    name: "jira_create_issue",
    description: "Create a new Jira issue",
    inputSchema: {
      type: "object",
      properties: {
        project: { type: "string", description: "Project key e.g. AEI" },
        summary: { type: "string" },
        description: { type: "string" },
        issueType: { type: "string", description: "Issue type name e.g. Task, Story, Bug (default: Task)" },
      },
      required: ["project", "summary"],
    },
  },
  {
    name: "jira_update_issue",
    description: "Update the summary or description of an issue",
    inputSchema: {
      type: "object",
      properties: {
        key: { type: "string" },
        summary: { type: "string" },
        description: { type: "string" },
      },
      required: ["key"],
    },
  },
  {
    name: "jira_transition_issue",
    description: "Move an issue to a new status (e.g. In Progress, Done)",
    inputSchema: {
      type: "object",
      properties: {
        key: { type: "string" },
        status: { type: "string", description: "Target status name e.g. Done, In Progress, In Review" },
      },
      required: ["key", "status"],
    },
  },
  {
    name: "jira_assign_issue",
    description: "Assign an issue to a user by account ID",
    inputSchema: {
      type: "object",
      properties: {
        key: { type: "string" },
        accountId: { type: "string", description: "Jira account ID of the assignee" },
      },
      required: ["key", "accountId"],
    },
  },
  {
    name: "jira_add_comment",
    description: "Add a comment to an issue",
    inputSchema: {
      type: "object",
      properties: {
        key: { type: "string" },
        comment: { type: "string" },
      },
      required: ["key", "comment"],
    },
  },
];

function createHandler(jiraFn) {
  return async function handleTool(name, args) {
    try {
      let result;

      if (name === "jira_get_issue") {
        result = await jiraFn("GET", `/issue/${args.key}?fields=summary,status,assignee,description,issuetype,priority`);
        result = {
          key: result.key,
          summary: result.fields.summary,
          status: result.fields.status.name,
          assignee: result.fields.assignee?.displayName ?? "Unassigned",
          type: result.fields.issuetype.name,
        };

      } else if (name === "jira_search_issues") {
        const data = await jiraFn("POST", "/search", {
          jql: args.jql,
          maxResults: args.maxResults ?? 20,
          fields: ["summary", "status", "assignee", "issuetype"],
        });
        result = data.issues.map((i) => ({
          key: i.key,
          summary: i.fields.summary,
          status: i.fields.status.name,
          assignee: i.fields.assignee?.displayName ?? "Unassigned",
          type: i.fields.issuetype.name,
        }));

      } else if (name === "jira_create_issue") {
        const body = {
          fields: {
            project: { key: args.project },
            summary: args.summary,
            issuetype: { name: args.issueType ?? "Task" },
          },
        };
        if (args.description) {
          body.fields.description = {
            type: "doc",
            version: 1,
            content: [{ type: "paragraph", content: [{ type: "text", text: args.description }] }],
          };
        }
        result = await jiraFn("POST", "/issue", body);

      } else if (name === "jira_update_issue") {
        const fields = {};
        if (args.summary) fields.summary = args.summary;
        if (args.description) {
          fields.description = {
            type: "doc",
            version: 1,
            content: [{ type: "paragraph", content: [{ type: "text", text: args.description }] }],
          };
        }
        result = await jiraFn("PUT", `/issue/${args.key}`, { fields });

      } else if (name === "jira_transition_issue") {
        const { transitions } = await jiraFn("GET", `/issue/${args.key}/transitions`);
        const match = transitions.find((t) => t.name.toLowerCase() === args.status.toLowerCase());
        if (!match) {
          const available = transitions.map((t) => t.name).join(", ");
          throw new Error(`Status "${args.status}" not found. Available: ${available}`);
        }
        result = await jiraFn("POST", `/issue/${args.key}/transitions`, { transition: { id: match.id } });

      } else if (name === "jira_assign_issue") {
        result = await jiraFn("PUT", `/issue/${args.key}/assignee`, { accountId: args.accountId });

      } else if (name === "jira_add_comment") {
        result = await jiraFn("POST", `/issue/${args.key}/comment`, {
          body: {
            type: "doc",
            version: 1,
            content: [{ type: "paragraph", content: [{ type: "text", text: args.comment }] }],
          },
        });

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
