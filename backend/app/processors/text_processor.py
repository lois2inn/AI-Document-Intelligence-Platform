import re
import unicodedata

def clean_document_text(raw_text: str | None) -> str:
    if not raw_text:
        return ""

    text = unicodedata.normalize("NFKC", raw_text)
    
    text = text.replace("\x00", "")
    text = text.replace("\u00a0", " ")

    text = text.replace("\r\n", "\n")
    text = text.replace("\r", "\n")

    text = re.sub(r"[ \t]+", " ", text)

    text = re.sub(r" *\n *", "\n", text)

    text = re.sub(r"\n{3,}", "\n\n", text)

    return text.strip()