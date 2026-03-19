using System;
using System.Text.Json.Serialization;

namespace SMadmin.Models;

public class Project
{
    [JsonPropertyName("id")]
    public int Id { get; set; }

    [JsonPropertyName("projekt_nev")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("leiras")]
    public string? Description { get; set; }

    [JsonPropertyName("letrehozo_id")]
    public int CreatorId { get; set; }

    [JsonPropertyName("statusz")]
    public string Status { get; set; } = string.Empty;

    [JsonPropertyName("hatarido")]
    public DateTime? Deadline { get; set; }

    [JsonPropertyName("letrehozas_idopont")]
    public DateTime CreatedAt { get; set; }

    [JsonPropertyName("creator_username")]
    public string? CreatorUsername { get; set; }

    [JsonPropertyName("creator_name")]
    public string? CreatorName { get; set; }
}
