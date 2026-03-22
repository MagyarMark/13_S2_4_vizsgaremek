using System.Text.Json.Serialization;

namespace SMadmin.Models;

public class Pagination
{
    [JsonPropertyName("page")]
    public int Page { get; set; }

    [JsonPropertyName("limit")]
    public int Limit { get; set; }

    [JsonPropertyName("total")]
    public int Total { get; set; }

    [JsonPropertyName("totalPages")]
    public int TotalPages { get; set; }
}

public class ApiResponse<T>
{
    [JsonPropertyName("success")]
    public bool Success { get; set; }

    [JsonPropertyName("message")]
    public string? Message { get; set; }

    [JsonPropertyName("data")]
    public T? Data { get; set; }

    [JsonPropertyName("errors")]
    public object? Errors { get; set; }
}

public class PaginatedData<T>
{
    [JsonPropertyName("users")]
    public T[]? Users { get; set; }

    [JsonPropertyName("projects")]
    public T[]? Projects { get; set; }

    [JsonPropertyName("submissions")]
    public T[]? Submissions { get; set; }

    [JsonPropertyName("pagination")]
    public Pagination Pagination { get; set; } = new();
}

public class LoginResponse
{
    [JsonPropertyName("success")]
    public bool Success { get; set; }

    [JsonPropertyName("message")]
    public string? Message { get; set; }

    [JsonPropertyName("data")]
    public LoginData? Data { get; set; }
}

public class LoginData
{
    [JsonPropertyName("accessToken")]
    public string? AccessToken { get; set; }

    [JsonPropertyName("refreshToken")]
    public string? RefreshToken { get; set; }

    [JsonPropertyName("user")]
    public User? User { get; set; }
}
