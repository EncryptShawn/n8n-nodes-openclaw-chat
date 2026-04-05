import sys

with open('src/nodes/OpenClaw/OpenClawChat.node.ts', 'r') as f:
    lines = f.readlines()

# Find the toolParameters collection start
start = -1
for i, line in enumerate(lines):
    if 'displayName: \'Tool Parameters\'' in line:
        start = i
        break
if start == -1:
    print("Cannot find Tool Parameters")
    sys.exit(1)

# Find the matching closing brace of the collection
# We'll look for the line with '},' that is preceded by '],' at same indent level.
# Let's just search for the pattern: lines that start with '      },' (two tabs then '},')
# and the next line starts with '    ],' (one tab then '],')
# We'll search from start onward.
for i in range(start, len(lines)):
    if lines[i].rstrip().endswith('},') and lines[i].startswith('\t\t'):
        # Check next line
        if i+1 < len(lines) and lines[i+1].rstrip().endswith('],') and lines[i+1].startswith('\t'):
            # This is the collection closing brace
            end = i  # inclusive
            break
else:
    print("Cannot find collection closing brace")
    sys.exit(1)

# Now we need to replace lines[start:end+1] with new JSON field
new_lines = [
'\t\t{\n',
'\t\t  displayName: \'Arguments\',\n',
'\t\t  name: \'arguments\',\n',
'\t\t  type: \'json\',\n',
'\t\t  default: \'{}\',\n',
'\t\t  description: \'JSON object of arguments to pass to the tool\',\n',
'\t\t  displayOptions: {\n',
'\t\t    show: {\n',
'\t\t      resource: [\'tool\'],\n',
'\t\t      operation: [\'invoke\'],\n',
'\t\t    },\n',
'\t\t  },\n',
'\t\t},\n'
]

# Replace
lines[start:end+1] = new_lines

# Now update the execute function: find the tool-specific logic
# Find the line "const toolParameters = this.getNodeParameter('toolParameters', i, {}) as Record<string, unknown>;"
for i, line in enumerate(lines):
    if 'const toolParameters = this.getNodeParameter' in line:
        tool_params_start = i
        break
else:
    print("Cannot find toolParameters line")
    sys.exit(1)

# Find the line "const response = await openClawApiRequest.call" after tool_params_start
for i in range(tool_params_start, len(lines)):
    if 'const response = await openClawApiRequest.call' in lines[i]:
        response_line = i
        break
else:
    print("Cannot find response line")
    sys.exit(1)

# Find the line "const toolName = this.getNodeParameter('toolName', i) as string;" before tool_params_start
tool_name_line = -1
for i in range(tool_params_start-1, -1, -1):
    if 'const toolName = this.getNodeParameter' in lines[i]:
        tool_name_line = i
        break

if tool_name_line == -1:
    print("Cannot find toolName line")
    sys.exit(1)

# Find the line before tool_name_line that is not empty (start of block)
block_start = tool_name_line
for i in range(tool_name_line-1, -1, -1):
    if lines[i].strip() == '':
        continue
    if lines[i].rstrip().endswith('{'):
        block_start = i+1
        break

# Replace lines[block_start:response_line] with new generic logic
new_execute = '''          const toolName = this.getNodeParameter('toolName', i) as string;
          const action = this.getNodeParameter('action', i, '') as string;
          const argumentsJson = this.getNodeParameter('arguments', i, '{}') as string;
          let args: Record<string, unknown> = {};
          try {
            args = JSON.parse(argumentsJson);
          } catch (e) {
            throw new Error(`Invalid JSON arguments: ${(e as Error).message}`);
          }'''

lines[block_start:response_line] = [new_execute + '\n']

# Write back
with open('src/nodes/OpenClaw/OpenClawChat.node.ts', 'w') as f:
    f.writelines(lines)

print("Fixed tool parameters and execute logic")
