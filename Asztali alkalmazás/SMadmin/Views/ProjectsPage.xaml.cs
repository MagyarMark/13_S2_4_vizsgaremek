using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using SMadmin;
using System.Collections.Generic;
using Windows.Services.Maps;
using SMadmin.Models;
using SMadmin.Services;

namespace SMadmin.Views;

public sealed partial class ProjectsPage : Page
{
    private readonly AdminApiService _apiService;
    private int _currentPage = 1;
    private int _totalPages = 1;
    private int _totalProjects = 0;

    public ProjectsPage()
    {
        this.InitializeComponent();
        _apiService = App.GetService<AdminApiService>();
        this.Loaded += async (s, e) => await LoadProjectsAsync();
    }

    private string? GetStatusFilter()
    {
        return (StatusFilterBox.SelectedItem as ComboBoxItem)?.Tag as string;
    }

    private async System.Threading.Tasks.Task LoadProjectsAsync()
    {
        SetLoading(true);

        try
        {
            var response = await _apiService.GetProjectsAsync(
                page: _currentPage,
                search: SearchBox.Text.Trim(),
                status: GetStatusFilter()
            );

            if (response.Success && response.Data != null)
            {
                var projects = new List<Project>(response.Data.Projects ?? []);
                ProjectsListView.ItemsSource = projects;
                _totalPages = response.Data.Pagination.TotalPages;
                _totalProjects = response.Data.Pagination.Total;
                UpdatePagination();
                ErrorBar.IsOpen = false;
            }
            else
            {
                ShowError(response.Message ?? "Failed to load projects");
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
        await LoadProjectsAsync();
    }

    private async void DeleteProject_Click(object sender, RoutedEventArgs e)
    {
        if (sender is Button btn && btn.Tag is int projectId)
        {
            SetLoading(true);
            try
            {
                var response = await _apiService.DeleteProjectAsync(projectId);
                if (response.Success)
                    await LoadProjectsAsync();
                else
                    ShowError(response.Message ?? "Failed to delete project");
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

    private async void PrevPage_Click(object sender, RoutedEventArgs e)
    {
        if (_currentPage > 1) { _currentPage--; await LoadProjectsAsync(); }
    }

    private async void NextPage_Click(object sender, RoutedEventArgs e)
    {
        if (_currentPage < _totalPages) { _currentPage++; await LoadProjectsAsync(); }
    }

    private void UpdatePagination()
    {
        PageInfo.Text = $"Oldal: {_currentPage} / {_totalPages}";
        TotalInfo.Text = $"Összes: {_totalProjects}";
        PrevButton.IsEnabled = _currentPage > 1;
        NextButton.IsEnabled = _currentPage < _totalPages;
    }

    private void SetLoading(bool loading)
    {
        LoadingRing.IsActive = loading;
        LoadingRing.Visibility = loading ? Visibility.Visible : Visibility.Collapsed;
        ProjectsListView.Visibility = loading ? Visibility.Collapsed : Visibility.Visible;
    }

    private void ShowError(string message)
    {
        ErrorBar.Message = message;
        ErrorBar.IsOpen = true;
    }
}
