import re

# Read both logs
logs = []
for log_file in ["narration-audio-regen.log", "final-correct-audio-generation.log"]:
    try:
        with open(log_file, 'r', encoding='utf-8') as f:
            logs.append(f.read())
    except:
        pass

all_text = "\n".join(logs)

# Extract resource data
pattern = r'🎙️  Resource (\d+)\s+.*?Script: resource-\1\.txt\s+Spanish: ([\w\-]+)\s+English: ([\w\-]+)'
matches = re.findall(pattern, all_text, re.DOTALL)

# Create structured output
resources = {}
for resource_id, spanish_voice, english_voice in matches:
    resources[int(resource_id)] = {
        'spanish': spanish_voice,
        'english': english_voice
    }

# Sort and print
for res_id in sorted(resources.keys()):
    print(f"Resource {res_id}: SP: {resources[res_id]['spanish']} | EN: {resources[res_id]['english']}")

print(f"\nTotal resources with voice assignments: {len(resources)}")
