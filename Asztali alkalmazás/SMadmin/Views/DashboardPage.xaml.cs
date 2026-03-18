using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using SMadmin;
using Windows.ApplicationModel.Contacts;
using SMadmin.Models;
using SMadmin.Services;

namespace SMadmin.Views;

public sealed partial class DashboardPage : Page
{
    private readonly AdminApiService _apiService;

    public DashboardPage()
    {
        this.InitializeComponent();
        _apiService = App.GetService<AdminApiService>();
    }

    protected override async void OnNavigatedTo(Microsoft.UI.Xaml.Navigation.NavigationEventArgs e)
    {
        base.OnNavigatedTo(e);
        await LoadStatsAsync();
    }

    private async System.Threading.Tasks.Task LoadStatsAsync()
    {
        SetLoading(true);

        try
        {
            var response = await _apiService.GetStatsAsync();
            if (response.Success && response.Data != null)
            {
                ShowStats(response.Data);
            }
            else
            {
                ShowError(response.Message ?? "Failed to load statistics");
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

    private void ShowStats(AdminStats stats)
    {
        ErrorBar.IsOpen = false;
        ContentPanel.Visibility = Visibility.Visible;

        UsersTotal.Text = stats.Users?.Total.ToString() ?? "0";
        UsersActive.Text = stats.Users?.Active.ToString() ?? "0";
        UsersNew.Text = stats.RecentActivity?.NewUsers.ToString() ?? "0";

        ProjectsTotal.Text = stats.Projects?.Total.ToString() ?? "0";
        ProjectsNew.Text = stats.RecentActivity?.NewProjects.ToString() ?? "0";

        SubmissionsTotal.Text = stats.Submissions?.Total.ToString() ?? "0";
        SubmissionsNew.Text = stats.RecentActivity?.NewSubmissions.ToString() ?? "0";

        MessagesTotal.Text = stats.Messages?.Total.ToString() ?? "0";
        FilesTotal.Text = stats.Files?.Total.ToString() ?? "0";
    }

    private void SetLoading(bool loading)
    {
        LoadingRing.IsActive = loading;
        LoadingRing.Visibility = loading ? Visibility.Visible : Visibility.Collapsed;
        if (loading) ContentPanel.Visibility = Visibility.Collapsed;
    }

    private void ShowError(string message)
    {
        ContentPanel.Visibility = Visibility.Visible;
        ErrorBar.Message = message;
        ErrorBar.IsOpen = true;
    }
}
