import os
import webbrowser

def generate_gallery_html(folder_path):
    # Ensure folder exists
    if not os.path.exists(folder_path):
        print("❌ Folder not found:", folder_path)
        return

    # Output file path (inside same folder)
    output_file = os.path.join(folder_path, "output.html")

    # Collect all image files
    photos = [f for f in os.listdir(folder_path)
              if f.lower().endswith((".jpg", ".jpeg", ".png", ".gif", ".webp"))]

    if not photos:
        print("⚠️ No images found in", folder_path)
        return

    # Start HTML
    html_content = """<!-- Gallery -->
<div class="gallery">\n"""

    # Add each photo
    for photo in photos:
        html_content += f"""  <img src="nsw/{photo}" 
       alt="{photo}"
       data-title="{os.path.splitext(photo)[0]}"
       data-desc="Image file: {photo}"
       data-download="nsw/{photo}">\n\n"""

    html_content += "</div>\n\n"

    # Add modal
    html_content += """<!-- Modal -->
<div class="modal" id="modal">
  <span class="close" id="close">&times;</span>
  <div class="modal-content">
    <img id="modal-img" src="" alt="">
    <div class="modal-info">
      <h2 id="modal-title"></h2>
      <p id="modal-desc"></p>
      <button class="btn" id="modal-download">Download</button>
    </div>
  </div>  
</div>
"""

    # Save to file
    with open(output_file, "w", encoding="utf-8") as f:
        f.write(html_content)

    print(f"✅ Output file created: {output_file}")

    # Auto open in browser
    webbrowser.open("file:///" + output_file)


if __name__ == "__main__":
    folder = r"C:\Users\Daksh\OneDrive\Neo_version_1.0\nsw"  # full path with r""
    generate_gallery_html(folder)
