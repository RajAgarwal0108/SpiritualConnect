import sys

target_file = '/Users/rajagarwal/Developer/SpiritualConnect/docs/2221031_sem8_trainingreport.md'
ref_file = '/Users/rajagarwal/Developer/SpiritualConnect/replacement.md'

with open(target_file, 'r') as f:
    target_lines = f.readlines()

with open(ref_file, 'r') as f:
    ref_lines = f.readlines()

# Extract Chapter 4 from ref
chap4_content = []
in_chap4 = False
for line in ref_lines:
    if line.startswith('**Chapter 4:'):
        in_chap4 = True
        chap4_content.append('**4**\n\n**SYSTEM DESIGN**\n\n')
        continue
    if line.startswith('**Chapter 5:'):
        break
    if in_chap4:
        chap4_content.append(line)

# Clean out the trailing page break and HR from ref if they exist
while chap4_content and ('page-break-after' in chap4_content[-1] or '---' in chap4_content[-1] or chap4_content[-1].strip() == ''):
    chap4_content.pop()

chap4_content.append('\n\n')

# Find where to replace in target
start_idx = -1
end_idx = -1

for i, line in enumerate(target_lines):
    if line.strip() == '**4**':
        start_idx = i
    if line.strip() == '**5**' and start_idx != -1:
        end_idx = i
        break

if start_idx != -1 and end_idx != -1:
    new_target = target_lines[:start_idx] + chap4_content + target_lines[end_idx:]
    with open(target_file, 'w') as f:
        f.writelines(new_target)
    print(f"Successfully replaced Chapter 4. Start: {start_idx}, End: {end_idx}")
else:
    print(f"Could not find indices. Start: {start_idx}, End: {end_idx}")

