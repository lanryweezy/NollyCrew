import os
import subprocess

# List of all the markdown files to be converted
markdown_files = [
    "NollyCrewHub_Business_Plan.md",
    "NollyCrew_Financial_Model.md",
    "BP.md",
    "business_plan.md",
    "pitch_deck.md",
    "NollyCrewHub_Pitch_Deck.md",
]

# The absolute path to the pandoc executable
pandoc_path = "C:\\Users\\lanry\\AppData\\Local\\Pandoc\\pandoc.exe"

# Loop through the files and convert them
for md_file in markdown_files:
    # Check if the file exists
    if os.path.exists(md_file):
        # Create the output filename
        docx_file = os.path.splitext(md_file)[0] + ".docx"

        # Construct the pandoc command
        command = [
            pandoc_path,
            md_file,
            "-o",
            docx_file,
        ]

        try:
            # Run the command
            subprocess.run(command, check=True)
            print(f"Successfully converted {md_file} to {docx_file}")
        except subprocess.CalledProcessError as e:
            print(f"Error converting {md_file}: {e}")
        except FileNotFoundError:
            print(f"Error: The pandoc executable was not found at {pandoc_path}")
            break
    else:
        print(f"Error: {md_file} not found.")

print("\nConversion process complete.")