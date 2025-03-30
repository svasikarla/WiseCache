# 🚀 Guide: Implementing the "Add Link" Functionality

This guide helps you build the "Add Link" feature in your productivity app. It allows users to submit a URL, extract and summarize the content using AI, categorize it, and display it in a dashboard.

---

## ✅ 1. Frontend: Add the "Add Link" Button and Input

### HTML

```html
<!-- Add Link Button -->
<button id="addLinkBtn">+ Add Link</button>

<!-- Input Section -->
<div id="linkInputSection" style="display: none;">
  <input type="text" id="urlInput" placeholder="Paste your link here" />
  <button onclick="submitLink()">Save</button>
</div>

<script>
  document.getElementById("addLinkBtn").onclick = function () {
    document.getElementById("linkInputSection").style.display = "block";
  };

  function submitLink() {
    const url = document.getElementById("urlInput").value;
    fetch("/add_link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: url })
    })
    .then(res => res.json())
    .then(data => {
      alert("Link saved and processed!");
      location.reload();
    });
  }
</script>
```

---

## ✅ 2. Backend (Flask): `/add_link` Endpoint

### `app.py`

```python
from flask import Flask, request, jsonify, render_template
from utils import extract_content, summarize_content, categorize_content, save_to_db

app = Flask(__name__)

@app.route("/add_link", methods=["POST"])
def add_link():
    data = request.get_json()
    url = data.get("url")

    if not url:
        return jsonify({"error": "URL missing"}), 400

    content_data = extract_content(url)
    summary = summarize_content(content_data["text"])
    categories = categorize_content(content_data["text"])

    saved = save_to_db(
        url=url,
        title=content_data["title"],
        summary=summary,
        categories=categories
    )

    return jsonify({"message": "Link processed and saved", "entry": saved})
```

---

## ✅ 3. Content Extraction Utility

### `utils.py`

```python
from newspaper import Article

def extract_content(url):
    article = Article(url)
    article.download()
    article.parse()
    return {
        "title": article.title,
        "text": article.text
    }
```

---

## ✅ 4. AI Summarization (OpenAI Example)

```python
import openai

def summarize_content(text):
    prompt = f"Summarize this content in 3-5 bullet points:\n\n{text[:3000]}"
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=150
    )
    return response.choices[0].message["content"].strip()
```

---

## ✅ 5. Categorization (OpenAI)

```python
def categorize_content(text):
    prompt = f"Categorize this content into one or more of the following: Technology, Finance, Health, Education, Science, Lifestyle.\n\n{text[:1000]}"
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=50
    )
    return response.choices[0].message["content"].strip().split(", ")
```

---

## ✅ 6. Save to Database (Simple JSON File)

```python
import uuid
import json

def save_to_db(url, title, summary, categories):
    entry = {
        "id": str(uuid.uuid4()),
        "url": url,
        "title": title,
        "summary": summary,
        "categories": categories
    }
    with open("data.json", "a") as f:
        f.write(json.dumps(entry) + "\n")
    return entry
```

---

## ✅ 7. Display Dashboard

### `app.py`

```python
@app.route("/")
def dashboard():
    entries = []
    with open("data.json") as f:
        for line in f:
            entries.append(json.loads(line))
    return render_template("dashboard.html", entries=entries)
```

---

### `templates/dashboard.html`

```html
{% for entry in entries %}
  <div class="card">
    <h3>{{ entry.title }}</h3>
    <p><b>URL:</b> <a href="{{ entry.url }}" target="_blank">{{ entry.url }}</a></p>
    <p><b>Categories:</b> {{ entry.categories | join(", ") }}</p>
    <p><b>Summary:</b></p>
    <p>{{ entry.summary }}</p>
  </div>
{% endfor %}
```

---

## 🧪 Optional Next Steps

- Add authentication and user-based filtering
- Store data in supabase db 
- Implement the email-based submission flow
- Add pagination, search, and tags filter
- Export summaries or links
