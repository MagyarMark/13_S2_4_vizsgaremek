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

    // visszaadja a kiválasztott szerepkör szűrőt a legördülő listából
    private string? GetRoleFilter()
    {
        return (RoleFilterBox.SelectedItem as ComboBoxItem)?.Tag as string;
    }

    // lekéri a felhasználókat az api-tól az aktuális szűrők és oldal alapján
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

                // megjelöli a saját fiókot, hogy ne lehessen véletlenül törölni
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

    // keresés gombra kattintáskor visszaállítja az első oldalra és újratölti a listát
    private async void SearchButton_Click(object sender, RoutedEventArgs e)
    {
        _currentPage = 1;
        await LoadUsersAsync();
    }

    // törli a kiválasztott felhasználót az api-n keresztül
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

    // elmenti a felhasználó módosított szerepkörét az api-n keresztül
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

    // elmenti a felhasználó aktív/inaktív státuszát az api-n keresztül
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

    // visszalép az előző oldalra és újratölti a listát
    private async void PrevPage_Click(object sender, RoutedEventArgs e)
    {
        if (_currentPage > 1) { _currentPage--; await LoadUsersAsync(); }
    }

    // lép a következő oldalra és újratölti a listát
    private async void NextPage_Click(object sender, RoutedEventArgs e)
    {
        if (_currentPage < _totalPages) { _currentPage++; await LoadUsersAsync(); }
    }

    // frissíti az oldalszámozás feliratait és a navigációs gombok állapotát
    private void UpdatePagination()
    {
        PageInfo.Text = $"Oldal: {_currentPage} / {_totalPages}";
        TotalInfo.Text = $"Összes: {_totalUsers}";
        PrevButton.IsEnabled = _currentPage > 1;
        NextButton.IsEnabled = _currentPage < _totalPages;
    }

    // töltési állapotot kapcsol, elrejti vagy mutatja a listát
    private void SetLoading(bool loading)
    {
        LoadingRing.IsActive = loading;
        LoadingRing.Visibility = loading ? Visibility.Visible : Visibility.Collapsed;
        UsersListView.Visibility = loading ? Visibility.Collapsed : Visibility.Visible;
    }

    // hibaüzenetet jelenít meg az infobar segítségével
    private void ShowError(string message)
    {
        ErrorBar.Message = message;
        ErrorBar.IsOpen = true;
    }
}
