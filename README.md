# Web File Browser SPA & ASP.NET Core API

A high-performance, single-page web application (SPA) built with **ASP.NET Core Web API** (.NET 8) and **Vanilla JavaScript** for navigating, searching, uploading, and downloading files and directories on a host machine.

---

## 🌟 Key Features

- 📁 **Directory Browsing**: Interactive tree navigation of subfolders and files with breadcrumb headers.
- 🔍 **Recursive Search**: Quick keyword search across the root directory and subfolders.
- ⬆️ **File Upload**: Direct file upload to any current folder directory.
- ⬇️ **File Download**: Fast stream downloading for target files.
- 📊 **Directory Summary Statistics**: Real-time stats display for folder count, file count, and formatted total file size (KB / MB).
- 🔗 **Deep Linking & History Navigation**: URL Hash routing support (`#path=` and `#search=`) with full browser Back/Forward (`hashchange`) button integration.
- ⚙️ **Configurable Storage Path**: Configurable root directory path via `appsettings.json`.

---

## 🏗️ Architecture & Project Structure

```
TestProject/
├── Controllers/
│   └── TestController.cs    # REST API endpoints (Browse, Search, Download, Upload)
├── Models/
│   └── FileItem.cs          # Data model representing file/directory metadata
├── wwwroot/                 # Static Frontend Assets
│   ├── index.html           # SPA User Interface layout
│   └── app.js               # Frontend JavaScript logic (Fetch API, DOM, Hash routing)
├── appsettings.json         # Configuration file (Storage:RootDirectory)
├── Program.cs               # Web Application entry point & Middleware pipeline
└── TestProject.csproj       # Project build specification (.NET 8.0)
```

---

## 📡 API Endpoints

### 1. Browse Folder
- **HTTP Method**: `GET`
- **URL Path**: `/Test/browse?path={relativePath}`
- **Query Parameters**:
  - `path` (optional): Relative directory path inside root directory.
- **Response**: Array of `FileItem` objects representing subdirectories and files.

### 2. Search Files & Folders
- **HTTP Method**: `GET`
- **URL Path**: `/Test/search?query={keyword}&path={relativePath}`
- **Query Parameters**:
  - `query` (required): Case-insensitive search string.
  - `path` (optional): Directory subpath to scope search.
- **Response**: Array of matching `FileItem` objects found recursively.

### 3. Download File
- **HTTP Method**: `GET`
- **URL Path**: `/Test/download?path={relativePath}`
- **Response**: Binary octet-stream file attachment download.

### 4. Upload File
- **HTTP Method**: `POST`
- **URL Path**: `/Test/upload?path={relativePath}`
- **Form Data**:
  - `file`: Multipart form file data.
- **Response**: JSON status message confirming upload success.

---

## ⚙️ Configuration

Set the target root directory path in `appsettings.json`:

```json
{
  "Storage": {
    "RootDirectory": "/path/to/your/custom/directory"
  }
}
```

> **Note**: If `RootDirectory` is empty or the directory does not exist, the app defaults to using the application's working directory (`Directory.GetCurrentDirectory()`).

---

## 🚀 Getting Started & Running Locally

### Prerequisites
- [.NET 8.0 SDK](https://dotnet.microsoft.com/download/dotnet/8.0) or higher

### Installation & Run Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/lh86474/maplarge-test.git
   cd TestProject
   ```

2. **Run the application:**
   ```bash
   dotnet run
   ```

3. **Access the application:**
   Open your browser and navigate to:
   ```text
   http://localhost:5000  (or https://localhost:5001)
   ```

---

## 🧪 Testing Edge Cases

The project incorporates resilience for key edge cases:
- **Null / Empty Inputs**: Handles missing search queries or invalid directory paths cleanly with standard HTTP status codes (`400 Bad Request`, `404 Not Found`).
- **Special Characters**: Encodes URL query strings (`encodeURIComponent`) to handle spaces, hashes (`#`), and special characters in folder names.
- **Empty Directories**: Renders friendly fallback messages when folders contain zero files.
- **Dynamic File Sizing**: Formats size outputs dynamically between KB and MB based on total bytes.
