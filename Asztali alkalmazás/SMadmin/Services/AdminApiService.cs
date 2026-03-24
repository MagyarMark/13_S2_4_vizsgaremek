using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Threading.Tasks;
using SMadmin.Models;

namespace SMadmin.Services;

public class AdminApiService
{
    private readonly HttpClient _httpClient;
    private string? _authToken;
    private const string BaseUrl = "http://localhost:3000";

    public User? CurrentUser { get; private set; }

    public AdminApiService()
    {
        _httpClient = new HttpClient
        {
            BaseAddress = new Uri(BaseUrl)
        };
    }

    public void SetAuthToken(string token, User? user = null)
    {
        _authToken = token;
        _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        if (user != null)
        {
            CurrentUser = user;
        }
    }

    public async Task<LoginResponse> LoginAsync(string username, string password)
    {
        try
        {
            var loginData = new { felhasznalonev = username, jelszo = password };
            var response = await _httpClient.PostAsJsonAsync("/api/auth/login", loginData);
            var result = await response.Content.ReadFromJsonAsync<LoginResponse>();
            return result ?? new LoginResponse { Success = false, Message = "Empty response" };
        }
        catch (HttpRequestException ex)
        {
            return new LoginResponse { Success = false, Message = $"Hálózati hiba: {ex.Message}" };
        }
    }

    public async Task<ApiResponse<PaginatedData<User>>> GetUsersAsync(int page = 1, int limit = 50, string? role = null, bool? active = null, string? search = null)
    {
        try
        {
            var queryParams = new List<string> { $"page={page}", $"limit={limit}" };
            if (!string.IsNullOrEmpty(role)) queryParams.Add($"role={role}");
            if (active.HasValue) queryParams.Add($"active={active.Value.ToString().ToLower()}");
            if (!string.IsNullOrEmpty(search)) queryParams.Add($"search={Uri.EscapeDataString(search)}");

            var response = await _httpClient.GetFromJsonAsync<ApiResponse<PaginatedData<User>>>($"/api/admin/users?{string.Join("&", queryParams)}");
            return response ?? new ApiResponse<PaginatedData<User>> { Success = false };
        }
        catch (HttpRequestException ex)
        {
            return new ApiResponse<PaginatedData<User>> { Success = false, Message = $"Network error: {ex.Message}" };
        }
    }

    public async Task<ApiResponse<UserDetails>> GetUserDetailsAsync(int userId)
    {
        try
        {
            var response = await _httpClient.GetFromJsonAsync<ApiResponse<UserDetails>>($"/api/admin/user/{userId}");
            return response ?? new ApiResponse<UserDetails> { Success = false };
        }
        catch (HttpRequestException ex)
        {
            return new ApiResponse<UserDetails> { Success = false, Message = $"Network error: {ex.Message}" };
        }
    }

    public async Task<ApiResponse<object>> UpdateUserAsync(int userId, object updateData)
    {
        try
        {
            var response = await _httpClient.PutAsJsonAsync($"/api/admin/userUpdate/{userId}", updateData);
            var result = await response.Content.ReadFromJsonAsync<ApiResponse<object>>();
            return result ?? new ApiResponse<object> { Success = false };
        }
        catch (HttpRequestException ex)
        {
            return new ApiResponse<object> { Success = false, Message = $"Network error: {ex.Message}" };
        }
    }

    public async Task<ApiResponse<object>> DeleteUserAsync(int userId)
    {
        try
        {
            var response = await _httpClient.DeleteAsync($"/api/admin/userDelete/{userId}");
            var result = await response.Content.ReadFromJsonAsync<ApiResponse<object>>();
            return result ?? new ApiResponse<object> { Success = false };
        }
        catch (HttpRequestException ex)
        {
            return new ApiResponse<object> { Success = false, Message = $"Network error: {ex.Message}" };
        }
    }

    public async Task<ApiResponse<object>> UpdateUserRoleAsync(int userId, string role)
    {
        try
        {
            var response = await _httpClient.PutAsJsonAsync($"/api/admin/user/{userId}/role", new { szerep_tipus = role });
            var result = await response.Content.ReadFromJsonAsync<ApiResponse<object>>();
            return result ?? new ApiResponse<object> { Success = false };
        }
        catch (HttpRequestException ex)
        {
            return new ApiResponse<object> { Success = false, Message = $"Network error: {ex.Message}" };
        }
    }

    public async Task<ApiResponse<PaginatedData<Project>>> GetProjectsAsync(int page = 1, int limit = 50, string? status = null, string? search = null)
    {
        try
        {
            var queryParams = new List<string> { $"page={page}", $"limit={limit}" };
            if (!string.IsNullOrEmpty(status)) queryParams.Add($"status={status}");
            if (!string.IsNullOrEmpty(search)) queryParams.Add($"search={Uri.EscapeDataString(search)}");

            var response = await _httpClient.GetFromJsonAsync<ApiResponse<PaginatedData<Project>>>($"/api/admin/projects?{string.Join("&", queryParams)}");
            return response ?? new ApiResponse<PaginatedData<Project>> { Success = false };
        }
        catch (HttpRequestException ex)
        {
            return new ApiResponse<PaginatedData<Project>> { Success = false, Message = $"Network error: {ex.Message}" };
        }
    }

    public async Task<ApiResponse<object>> DeleteProjectAsync(int projectId)
    {
        try
        {
            var response = await _httpClient.DeleteAsync($"/api/admin/projectDelete/{projectId}");
            var result = await response.Content.ReadFromJsonAsync<ApiResponse<object>>();
            return result ?? new ApiResponse<object> { Success = false };
        }
        catch (HttpRequestException ex)
        {
            return new ApiResponse<object> { Success = false, Message = $"Network error: {ex.Message}" };
        }
    }

    public async Task<ApiResponse<PaginatedData<Submission>>> GetSubmissionsAsync(int page = 1, int limit = 50, string? status = null, int? studentId = null, int? teacherId = null, int? taskId = null)
    {
        try
        {
            var queryParams = new List<string> { $"page={page}", $"limit={limit}" };
            if (!string.IsNullOrEmpty(status)) queryParams.Add($"status={status}");
            if (studentId.HasValue) queryParams.Add($"student_id={studentId.Value}");
            if (teacherId.HasValue) queryParams.Add($"teacher_id={teacherId.Value}");
            if (taskId.HasValue) queryParams.Add($"task_id={taskId.Value}");

            var response = await _httpClient.GetFromJsonAsync<ApiResponse<PaginatedData<Submission>>>($"/api/admin/submissions?{string.Join("&", queryParams)}");
            return response ?? new ApiResponse<PaginatedData<Submission>> { Success = false };
        }
        catch (HttpRequestException ex)
        {
            return new ApiResponse<PaginatedData<Submission>> { Success = false, Message = $"Network error: {ex.Message}" };
        }
    }

    public async Task<ApiResponse<AdminStats>> GetStatsAsync()
    {
        try
        {
            var response = await _httpClient.GetFromJsonAsync<ApiResponse<AdminStats>>("/api/admin/stats/overview");
            return response ?? new ApiResponse<AdminStats> { Success = false };
        }
        catch (HttpRequestException ex)
        {
            return new ApiResponse<AdminStats> { Success = false, Message = $"Network error: {ex.Message}" };
        }
    }
}
