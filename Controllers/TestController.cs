
using Microsoft.AspNetCore.Mvc;

// This is needed to give us navigation of our disk. 
using System.IO;

// Import the FileItem.cs so we can use this data model
using TestProject.Models;

namespace TestProject.Controllers {
    // Allows ASP.NET to format responses as JSON rather than as data model
    [ApiController]
    // base URL is /api/files
    [Route("[controller]")]
    public class TestController : ControllerBase {
        
        private readonly ILogger<TestController> _logger;

        public TestController(ILogger<TestController> logger) {
            _logger = logger;
        }

        [HttpGet("browse")]

        /*
         * this method handles a Get request
         * @return IActionResult, the result of the HTTP request
         * @param path: the path to the directory to browse
         */
        public IActionResult Get([FromQuery] string? path ="") {
            // get the path of our current directory
            var rootPath = Directory.GetCurrentDirectory();
            // Combine the paths
            var targetPath = Path.Combine(rootPath, path ?? "");

            // Check if the folder exists
            if (!Directory.Exists(targetPath)) {
                return NotFound(new { error = "Directory not found "});
            }

            var dirInfo = new DirectoryInfo(targetPath);

            var items = new List<FileItem>();

            // populate directories and files

            var directories = dirInfo.GetDirectories();

            // loop subdirectory
            foreach (var dir in directories) {
                var item = new FileItem {
                    Name = dir.Name,
                    RelativePath = Path.Combine(path ?? "", dir.Name),
                    IsDirectory = true,
                    Size = 0,
                    LastModified = dir.LastWriteTime
                };
                items.Add(item);
            }

            //loop through files

            var files = dirInfo.GetFiles();

            foreach (var file in files) {
                var item = new FileItem {
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
        public IActionResult Search([FromQuery] string query, [FromQuery] string? path = "") {
            // Check if the query is empty. Return http 400 if that happens
            if (query == string.Empty) {
                return BadRequest(new { error = "Search query is required" });
            }

            var rootPath = Directory.GetCurrentDirectory();
            var targetPath = Path.Combine(rootPath, path ?? "");

            if (!Directory.Exists(targetPath)) {
                return NotFound(new { error = "Directory not found" });
            }

            var dirInfo = new DirectoryInfo(targetPath);

            // SearchOption.AllDirectories is a built-in .NET enum that tells C# 
            // to recursively search all subfolders
            var items = dirInfo.EnumerateFileSystemInfos("*", SearchOption.AllDirectories);    

            var results = new List<FileItem>();

            foreach (var item in items) {
                long size = 0;
                if (!item.Name.Contains(query, StringComparison.OrdinalIgnoreCase)){
                    continue;
                }

                // check if item is a directory or not
                bool isDir = item is DirectoryInfo;

                if (isDir == true) {
                    size = 0;
                } else {
                    // cast to FileInfo length
                    size = ((FileInfo)item).Length;
                }

                var fileItem = new FileItem {
                    Name = item.Name,
                    RelativePath = Path.GetRelativePath(rootPath, item.FullName),
                    IsDirectory = isDir,
                    Size = size,
                    LastModified = item.LastWriteTime
                };

                results.Add(fileItem);
            }

            return Ok(results);
        }

    }
}