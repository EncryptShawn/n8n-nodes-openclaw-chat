import sys
import re

with open('src/nodes/OpenClaw/OpenClawChat.node.ts', 'r') as f:
    content = f.read()

# Replace the toolParameters collection with a simple JSON field
# Pattern: from "displayName: 'Tool Parameters'," to the next "}," after "],"
# We'll use a regex with limited lookahead.
# Since the structure is predictable, we can find the collection block.
# Let's do a simple approach: find the start index, then find matching braces.
# But we can rely on the fact that the collection ends with "      }," before "    ],"
# Let's search for "displayName: 'Tool Parameters'," and then find the matching closing brace.
# We'll use a stack counter.
start_idx = content.find("displayName: 'Tool Parameters',")
if start_idx == -1:
    print("Cannot find Tool Parameters")
    sys.exit(1)

# Find the opening brace of the collection (the '{' after 'displayName...')
# Actually the collection starts with '{' on the line after 'displayName'? Let's search for '{' after start_idx.
brace_start = content.find('{', start_idx)
stack = 0
i = brace_start
while i < len(content):
    if content[i] == '{':
        stack += 1
    elif content[i] == '}':
        stack -= 1
        if stack == 0:
            # Found the closing brace of the collection
            # Need to include the comma after the brace if present
            end_idx = i
            if content[i+1] == ',':
                end_idx = i+1
            break
    i += 1
else:
    print("Could not find matching closing brace")
    sys.exit(1)

# Replacement text (with two tabs indent)
new_collection = '''      {
        displayName: 'Arguments',
        name: 'arguments',
        type: 'json',
        default: '{}',
        description: 'JSON object of arguments to pass to the tool',
        displayOptions: {
          show: {
            resource: ['tool'],
            operation: ['invoke'],
          },
        },
      },'''

content = content[:start_idx] + new_collection + content[end_idx+1:]

# Now update the execute function: replace the tool-specific logic with generic JSON parsing
# Find the line "const toolParameters = this.getNodeParameter('toolParameters', i, {}) as Record<string, unknown>;"
tool_params_start = content.find("const toolParameters = this.getNodeParameter('toolParameters', i, {}) as Record<string, unknown>;")
if tool_params_start == -1:
    print("Cannot find toolParameters line")
    sys.exit(1)

# Find the start of the if-else chain: look for "if (toolName === 'exec') {"
# Actually we need to replace from that line to just before "const response = await openClawApiRequest.call"
# Let's find the line "const response = await openClawApiRequest.call" after tool_params_start.
response_line = content.find("const response = await openClawApiRequest.call", tool_params_start)
if response_line == -1:
    print("Cannot find response line")
    sys.exit(1)

# Find the line before response_line that is not empty; we'll replace from tool_params_start to response_line-1
# But we need to keep the toolName and action lines before toolParameters? Actually they are before.
# Let's find the line "const toolName = this.getNodeParameter('toolName', i) as string;" before tool_params_start
tool_name_line = content.rfind("const toolName =", 0, tool_params_start)
if tool_name_line == -1:
    print("Cannot find toolName line")
    sys.exit(1)

# We'll replace from tool_name_line to response_line-1 with new generic logic.
# Let's capture the exact lines to replace.
# Find the newline before tool_name_line
start_replace = content.rfind('\n', 0, tool_name_line) + 1

# New generic logic
new_logic = '''          const toolName = this.getNodeParameter('toolName', i) as string;
          const action = this.getNodeParameter('action', i, '') as string;
          const argumentsJson = this.getNodeParameter('arguments', i, '{}') as string;
          let args: Record<string, unknown> = {};
          try {
            args = JSON.parse(argumentsJson);
          } catch (e) {
            throw new Error(`Invalid JSON arguments: ${(e as Error).message}`);
          }'''

content = content[:start_replace] + new_logic + content[response_line:]

# Write back
with open('src/nodes/OpenClaw/OpenClawChat.node.ts', 'w') as f:
    f.write(content)

print("Fixed tool parameters and execute logic")
