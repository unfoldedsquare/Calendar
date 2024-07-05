def remove_square_from_location(file_path):
    with open(file_path, 'r') as file:
        lines = file.readlines()

    modified_lines = []

    for line in lines:
        if line.startswith('LOCATION:'):
            # Remove the text "[The Square]" from the LOCATION line
            modified_line = line.replace('[The Square]', '').strip()
            modified_lines.append(modified_line + '\n')
        else:
            modified_lines.append(line)

    with open('calendar.ics', 'w') as file:
        file.writelines(modified_lines)

# Path to the original ICS file
file_path = 'C:\Users\Work\Desktop\squareinfo\calendar.ics'
remove_square_from_location(file_path)
