   namespace HRTool.App.Models
   {
public class Document
    {
        public string DOC_ID { get; set; } = string.Empty; 

        public string EMP_ID { get; set; } = string.Empty; 
        public string DOC_TYPE { get; set; } = string.Empty; 
        public string UPLOADED_BY_ID { get; set; } = string.Empty; 

        public Employee? Employee { get; set; }
        public User? Uploader { get; set; }
    }
   }