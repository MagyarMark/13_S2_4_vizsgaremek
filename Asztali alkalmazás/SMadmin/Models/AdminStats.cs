using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace SMadmin.Models;

public class AdminStats
{
    [JsonPropertyName("users")]
    public UserStatistics Users { get; set; } = new();

    [JsonPropertyName("projects")]
    public ProjectStatistics Projects { get; set; } = new();

    [JsonPropertyName("submissions")]
    public SubmissionStatistics Submissions { get; set; } = new();

    [JsonPropertyName("messages")]
    public MessageStatistics Messages { get; set; } = new();

    [JsonPropertyName("files")]
    public FileStatistics Files { get; set; } = new();

    [JsonPropertyName("recentActivity")]
    public RecentActivity RecentActivity { get; set; } = new();
}

public class UserStatistics
{
    [JsonPropertyName("total")]
    public int Total { get; set; }

    [JsonPropertyName("active")]
    public int Active { get; set; }

    [JsonPropertyName("byRole")]
    public List<RoleCount> ByRole { get; set; } = new();
}

public class RoleCount
{
    [JsonPropertyName("szerep_tipus")]
    public string Role { get; set; } = string.Empty;

    [JsonPropertyName("count")]
    public int Count { get; set; }
}

public class ProjectStatistics
{
    [JsonPropertyName("total")]
    public int Total { get; set; }

    [JsonPropertyName("byStatus")]
    public List<StatusCount> ByStatus { get; set; } = new();
}

public class StatusCount
{
    [JsonPropertyName("statusz")]
    public string Status { get; set; } = string.Empty;

    [JsonPropertyName("count")]
    public int Count { get; set; }
}

public class SubmissionStatistics
{
    [JsonPropertyName("total")]
    public int Total { get; set; }

    [JsonPropertyName("byStatus")]
    public List<StatusCount> ByStatus { get; set; } = new();
}

public class MessageStatistics
{
    [JsonPropertyName("total")]
    public int Total { get; set; }
}

public class FileStatistics
{
    [JsonPropertyName("total")]
    public int Total { get; set; }
}

public class RecentActivity
{
    [JsonPropertyName("newUsers")]
    public int NewUsers { get; set; }

    [JsonPropertyName("newProjects")]
    public int NewProjects { get; set; }

    [JsonPropertyName("newSubmissions")]
    public int NewSubmissions { get; set; }
}
