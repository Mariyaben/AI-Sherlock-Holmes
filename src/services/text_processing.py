def extract_text_from_txt(file_path):
    """Extracts and returns text from a .txt file."""
    try:
        with open(file_path, "r", encoding="utf-8") as file:
            return file.read()
    except Exception as e:
        raise RuntimeError(f"Error reading text file: {e}")