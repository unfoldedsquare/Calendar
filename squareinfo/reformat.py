import re

def extract_location(summary):
    # Extract the location from the SUMMARY field (third dash-separated part)
    parts = summary.split(' - ')
    if len(parts) >= 3:
        return parts[2]
    return None

def modify_ics(file_path):
    with open(file_path, 'r') as file:
        lines = file.readlines()

    modified_lines = []
    current_summary = None

    for line in lines:
        if line.startswith('SUMMARY:'):
            current_summary = line.strip()
        if line.startswith('END:VEVENT'):
            # Extract location and add LOCATION property before END:VEVENT
            if current_summary:
                location = extract_location(current_summary.split(':')[1])
                if location:
                    modified_lines.append(f'LOCATION:{location}\n')
            current_summary = None

        modified_lines.append(line)

    with open('basic.ics', 'w') as file:
        file.writelines(modified_lines)

# Path to the original ICS file
file_path = 'basic.ics'
modify_ics(file_path)
