namespace RefreshBookstore.Models
{
    public class Book
    {
        public string? Title { get; set; }
        public string? Author { get; set; }
        public string? Publisher { get; set; }
        public DateTime PublicationDate { get; set; }
        public string? Isbn { get; set; }
        public string? Description { get; set; }
        public decimal Price { get; set; }
        public int Stock { get; set; }
        public string? ImagePath { get; set; }
        public string? Category { get; set; }
    }
}
