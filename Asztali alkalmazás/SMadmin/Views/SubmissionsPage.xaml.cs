using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using SMadmin;
using System.Collections.Generic;
using Windows.Services.Maps;
using SMadmin.Models;
using SMadmin.Services;

namespace SMadmin.Views;

public sealed partial class SubmissionsPage : Page
{
    private readonly AdminApiService _apiService;
    private int _currentPage = 1;
    private int _totalPages = 1;
    private int _totalSubmissions = 0;
    private bool _isInitialized = false;

    public SubmissionsPage()
    {
        this.InitializeComponent();
        _apiService = App.GetService<AdminApiService>();
        _isInitialized = true;
        this.Loaded += async (s, e) => await LoadSubmissionsAsync();
    }

    private string? GetStatusFilter()
    {
        return (StatusFilterBox.SelectedItem as ComboBoxItem)?.Tag as string;
    }

    private async System.Threading.Tasks.Task LoadSubmissionsAsync()
    {
        SetLoading(true);

        try
        {
            var response = await _apiService.GetSubmissionsAsync(
                page: _currentPage,
                status: GetStatusFilter()
            );

            if (response.Success && response.Data != null)
            {
                var submissions = new List<Submission>(response.Data.Submissions ?? []);
                SubmissionsListView.ItemsSource = submissions;
                _totalPages = response.Data.Pagination.TotalPages;
                _totalSubmissions = response.Data.Pagination.Total;
                UpdatePagination();
                ErrorBar.IsOpen = false;
            }
            else
            {
                ShowError(response.Message ?? "Failed to load submissions");
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

    private async void StatusFilter_Changed(object sender, SelectionChangedEventArgs e)
    {
        if (!_isInitialized) return;
        _currentPage = 1;
        await LoadSubmissionsAsync();
    }

    private async void PrevPage_Click(object sender, RoutedEventArgs e)
    {
        if (_currentPage > 1) { _currentPage--; await LoadSubmissionsAsync(); }
    }

    private async void NextPage_Click(object sender, RoutedEventArgs e)
    {
        if (_currentPage < _totalPages) { _currentPage++; await LoadSubmissionsAsync(); }
    }

    private void UpdatePagination()
    {
        PageInfo.Text = $"Oldal: {_currentPage} / {_totalPages}";
        TotalInfo.Text = $"Összes: {_totalSubmissions}";
        PrevButton.IsEnabled = _currentPage > 1;
        NextButton.IsEnabled = _currentPage < _totalPages;
    }

    private void SetLoading(bool loading)
    {
        LoadingRing.IsActive = loading;
        LoadingRing.Visibility = loading ? Visibility.Visible : Visibility.Collapsed;
        SubmissionsListView.Visibility = loading ? Visibility.Collapsed : Visibility.Visible;
    }

    private void ShowError(string message)
    {
        ErrorBar.Message = message;
        ErrorBar.IsOpen = true;
    }
}
