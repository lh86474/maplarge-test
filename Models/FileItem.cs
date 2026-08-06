namespace TestProject.Models {
       public class FileItem {
                public string Name { get; set; }
                public string RelativePath { get; set; }
                public bool IsDirectory { get; set; }
                public long Size { get; set; }
                public DateTime LastModified { get; set; }
       }
}
