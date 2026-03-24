using System;
using System.Text.Json.Serialization;

namespace SMadmin.Models;

public class User
{
    [JsonPropertyName("id")]
    public int Id { get; set; }

    [JsonPropertyName("felhasznalonev")]
    public string Username { get; set; } = string.Empty;

    [JsonPropertyName("email")]
    public string Email { get; set; } = string.Empty;

    [JsonPropertyName("teljes_nev")]
    public string FullName { get; set; } = string.Empty;

    [JsonPropertyName("szerep_tipus")]
    public string Role { get; set; } = string.Empty;

    [JsonPropertyName("aktiv")]
    public bool Active { get; set; }

    [JsonIgnore]
    public int ActiveIndex
    {
        get => Active ? 1 : 0;
        set => Active = value == 1;
    }

    [JsonPropertyName("elerheto")]
    public bool Available { get; set; }

    [JsonPropertyName("letrehozas_idopont")]
    public DateTime CreatedAt { get; set; }

    [JsonIgnore]
    public bool IsNotCurrentUser { get; set; } = true;

    [JsonPropertyName("utolso_bejelentkezes")]
    public DateTime? LastLogin { get; set; }
}

public class UserDetails
{
    [JsonPropertyName("user")]
    public User User { get; set; } = new();

    [JsonPropertyName("stats")]
    public UserStats Stats { get; set; } = new();
}

public class UserStats
{
    [JsonPropertyName("projectsCreated")]
    public int ProjectsCreated { get; set; }

    [JsonPropertyName("submissions")]
    public int Submissions { get; set; }
}
