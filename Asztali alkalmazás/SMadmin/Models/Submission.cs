using System;
using System.Text.Json.Serialization;

namespace SMadmin.Models;

public class Submission
{
    [JsonPropertyName("id")]
    public int Id { get; set; }

    [JsonPropertyName("feladat_id")]
    public int TaskId { get; set; }

    [JsonPropertyName("felhasznalo_id")]
    public int StudentId { get; set; }

    [JsonPropertyName("tanar_id")]
    public int? TeacherId { get; set; }

    [JsonPropertyName("pontszam")]
    public decimal? Score { get; set; }

    [JsonPropertyName("jegy")]
    public int? Grade { get; set; }

    [JsonPropertyName("statusz")]
    public string Status { get; set; } = string.Empty;

    [JsonPropertyName("visszajelzes")]
    public string? Feedback { get; set; }

    [JsonPropertyName("bekuldes_idopont")]
    public DateTime SubmittedAt { get; set; }

    [JsonPropertyName("ertekeles_idopont")]
    public DateTime? EvaluatedAt { get; set; }

    [JsonPropertyName("student_username")]
    public string? StudentUsername { get; set; }

    [JsonPropertyName("student_name")]
    public string? StudentName { get; set; }

    [JsonPropertyName("teacher_username")]
    public string? TeacherUsername { get; set; }

    [JsonPropertyName("teacher_name")]
    public string? TeacherName { get; set; }

    [JsonPropertyName("task_name")]
    public string? TaskName { get; set; }
}
