using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using SMadmin;
using System.Collections.Generic;
using Windows.Services.Maps;
using SMadmin.Models;
using SMadmin.Services;

namespace SMadmin.Views;

public sealed partial class UsersPage : Page
{
    private readonly AdminApiService _apiService;
    private int _currentPage = 1;
    private int _totalPages = 1;
    private int _totalUsers = 0;

    public UsersPage()
    {
        this.InitializeComponent();
        _apiService = App.GetService<AdminApiService>();
        this.Loaded += async (s, e) => await LoadUsersAsync();
    }

    private string? GetRoleFilter()
    {
        return (RoleFilterBox.SelectedItem as ComboBoxItem)?.Tag as string;
    }

    private async System.Threading.Tasks.Task LoadUsersAsync()
    {
        SetLoading(true);

        try
        {
            var response = await _apiService.GetUsersAsync(
                page: _currentPage,
                search: SearchBox.Text.Trim(),
                role: GetRoleFilter()
            );

            if (response.Success && response.Data != null)
            {
                var currentUserId = _apiService.CurrentUser?.Id;
                var users = new List<User>(response.Data.Users ?? []);

                foreach (var u in users)
                {
                    u.IsNotCurrentUser = currentUserId == null || u.Id != currentUserId;
                }

                UsersListView.ItemsSource = users;
                _totalPages = response.Data.Pagination.TotalPages;
                _totalUsers = response.Data.Pagination.Total;
                UpdatePagination();
                ErrorBar.IsOpen = false;
            }
            else
            {
                ShowError(response.Message ?? "Failed to load users");
            }
        }
        catch (System.Exception ex)
        {
            ShowError($"Error: {ex.Message}");
        }
        finally
        {
            SetLoading(false);
        }
    }

    private async void SearchButton_Click(object sender, RoutedEventArgs e)
    {
        _currentPage = 1;
        await LoadUsersAsync();
    }

    private async void DeleteUser_Click(object sender, RoutedEventArgs e)
    {
        if (sender is Button btn && btn.Tag is int userId)
        {
            SetLoading(true);
            try
            {
                var response = await _apiService.DeleteUserAsync(userId);
                if (response.Success)
                    await LoadUsersAsync();
                else
                    ShowError(response.Message ?? "Failed to delete user");
            }
            catch (System.Exception ex)
            {
                ShowError($"Error: {ex.Message}");
            }
            finally
            {
                SetLoading(false);
            }
        }
    }

    private async void SaveRole_Click(object sender, RoutedEventArgs e)
    {
        if (sender is Button btn && btn.Tag is User user)
        {
            SetLoading(true);
            try
            {
                var response = await _apiService.UpdateUserRoleAsync(user.Id, user.Role);
                if (!response.Success)
                {
                    ShowError(response.Message ?? "Sikertelen szerepkör módosítás");
                    await LoadUsersAsync();
                }
            }
            catch (System.Exception ex)
            {
                ShowError($"Error: {ex.Message}");
                await LoadUsersAsync();
            }
            finally
            {
                SetLoading(false);
            }
        }
    }

    private async void SaveActive_Click(object sender, RoutedEventArgs e)
    {
        if (sender is Button btn && btn.Tag is User user)
        {
            SetLoading(true);
            try
            {
                var response = await _apiService.UpdateUserAsync(user.Id, new { aktiv = user.Active });
                if (!response.Success)
                {
                    ShowError(response.Message ?? "Sikertelen státusz módosítás");
                    await LoadUsersAsync();
                }
            }
            catch (System.Exception ex)
            {
                ShowError($"Error: {ex.Message}");
                await LoadUsersAsync();
            }
            finally
            {
                SetLoading(false);
            }
        }
    }

    private async void PrevPage_Click(object sender, RoutedEventArgs e)
    {
        if (_currentPage > 1) { _currentPage--; await LoadUsersAsync(); }
    }

    private async void NextPage_Click(object sender, RoutedEventArgs e)
    {
        if (_currentPage < _totalPages) { _currentPage++; await LoadUsersAsync(); }
    }

    private void UpdatePagination()
    {
        PageInfo.Text = $"Oldal: {_currentPage} / {_totalPages}";
        TotalInfo.Text = $"Összes: {_totalUsers}";
        PrevButton.IsEnabled = _currentPage > 1;
        NextButton.IsEnabled = _currentPage < _totalPages;
    }

    private void SetLoading(bool loading)
    {
        LoadingRing.IsActive = loading;
        LoadingRing.Visibility = loading ? Visibility.Visible : Visibility.Collapsed;
        UsersListView.Visibility = loading ? Visibility.Collapsed : Visibility.Visible;
    }

    private void ShowError(string message)
    {
        ErrorBar.Message = message;
        ErrorBar.IsOpen = true;
    }
}
