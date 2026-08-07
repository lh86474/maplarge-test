
using Microsoft.AspNetCore.Mvc;

// This is needed to give us navigation of our disk. 
using System.IO;

// Import the FileItem.cs so we can use this data model
using TestProject.Models;

namespace TestProject.Controllers
{
    // Allows ASP.NET to format responses as JSON rather than as data model
    [ApiController]
    // sets the base url for the controller
    [Route("[controller]")]
    public class TestController : ControllerBase
    {

        // record system events, errors, or warnings to the console
        private readonly ILogger<TestController> _logger;
        // store root folder path
        private readonly string _rootPath;

        public TestController(ILogger<TestController> logger, IConfiguration config)
        {
            _logger = logger;

            var configuredDirectory = config["Storage:RootDirectory"];

            _rootPath = !string.IsNullOrWhiteSpace(configuredDirectory) && Directory.Exists(configuredDirectory)
                ? configuredDirectory
                : Directory.GetCurrentDirectory();
        }

        [HttpGet("browse")]

        /*
         * this method handles a Get request
         * @return IActionResult, the result of the HTTP request
         * @param path: the path to the directory to browse
         */
        public IActionResult Get([FromQuery] string? path = "")
        {
            // Combine the paths
            var targetPath = Path.Combine(_rootPath, path ?? "");

            // Check if the folder exists
            if (!Directory.Exists(targetPath))
            {
                return NotFound(new { error = "Directory not found " });
            }

            var dirInfo = new DirectoryInfo(targetPath);

            var items = new List<FileItem>();

            // populate directories and files

            var subDirectories = dirInfo.GetDirectories();

            // loop subdirectory
            foreach (var subDirectory in subDirectories)
            {
                var item = new FileItem
                {
                    Name = subDirectory.Name,
                    RelativePath = Path.Combine(path ?? "", subDirectory.Name),
                    IsDirectory = true,
                    Size = 0,
                    LastModified = subDirectory.LastWriteTime
                };
                items.Add(item);
            }

            //loop through files

            var files = dirInfo.GetFiles();

            foreach (var file in files)
            {
                var item = new FileItem
                {
                    Name = file.Name,
                    RelativePath = Path.Combine(path ?? "", file.Name),
                    IsDirectory = false,
                    Size = file.Length,
                    LastModified = file.LastWriteTime
                };

                items.Add(item);
            }

            return Ok(items);
        }

        [HttpGet("search")]

        /*
         *  This method handles the Search endpoint.
         * @return IActionResult, result of the HTTP search request.
         * @param path: the path to the directory to search
         * @param query: the query to search for
         */
        public IActionResult Search([FromQuery] string query, [FromQuery] string? path = "")
        {
            // Check if the query is empty. Return http 400 if that happens
            if (query == string.Empty)
            {
                return BadRequest(new { error = "Search query is required" });
            }

            var targetPath = Path.Combine(_rootPath, path ?? "");

            if (!Directory.Exists(targetPath))
            {
                return NotFound(new { error = "Directory not found" });
            }

            var dirInfo = new DirectoryInfo(targetPath);

            // SearchOption.AllDirectories is a built-in .NET enum that tells C# 
            // to recursively search all subfolders
            var items = dirInfo.EnumerateFileSystemInfos("*", SearchOption.AllDirectories);

            var results = new List<FileItem>();

            foreach (var item in items)
            {
                long size = 0;
                if (!item.Name.Contains(query, StringComparison.OrdinalIgnoreCase))
                {
                    continue;
                }

                // check if item is a directory or not
                bool isDir = item is DirectoryInfo;

                if (isDir == true)
                {
                    size = 0;
                }
                else
                {
                    // cast to FileInfo length
                    size = ((FileInfo)item).Length;
                }

                var fileItem = new FileItem
                {
                    Name = item.Name,
                    RelativePath = Path.GetRelativePath(_rootPath, item.FullName),
                    IsDirectory = isDir,
                    Size = size,
                    LastModified = item.LastWriteTime
                };

                results.Add(fileItem);
            }

            return Ok(results);
        }

        [HttpGet("download")]

        /*
         * Downloads a file
         * @return IActionResult, the result of the download request.
         * @param path: the path to the file to download
         */
        public IActionResult Download([FromQuery] string path)
        {
            var targetPath = Path.Combine(_rootPath, path ?? "");

            // check if the file exists
            if (!System.IO.File.Exists(targetPath))
            {
                return NotFound(new { error = "download target file not found" });
            }

            // send file
            return PhysicalFile(targetPath, "application/octet-stream",
            Path.GetFileName(targetPath));
        }

        [HttpPost("upload")]

        /*
         * Uploads a file
         * @return IActionResult, the result of the upload request.
         * @param path: the path to the file to upload
         */
        public async Task<IActionResult> Upload(IFormFile file, [FromQuery] string? path = "")
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new { error = "No file selected" });
            }

            var targetDir = Path.Combine(_rootPath, path ?? "");

            var destinationPath = Path.Combine(targetDir, file.FileName);

            // write the file to disk

            using (var stream = new FileStream(destinationPath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            return Ok(new { message = "File uploaded successfully" });
        }
    }
}