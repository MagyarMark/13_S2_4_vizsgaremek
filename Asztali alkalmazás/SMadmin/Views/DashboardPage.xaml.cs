using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using SMadmin.Models;
using SMadmin.Services;
using System;
using System.Collections.ObjectModel;
using System.Linq;
using System.Threading.Tasks;

namespace SMadmin.Views;

public sealed partial class DashboardPage : Page
{
    private readonly AdminApiService _apiService;

    // jóváhagyásra váró tanárok listája, adatkötéshez
    public ObservableCollection<User> PendingTeachers { get; set; } = new();

    public DashboardPage()
    {
        this.InitializeComponent();
        _apiService = App.GetService<AdminApiService>();
    }

    // oldal megjelenésekor betölti a függő tanárokat és a statisztikákat
    protected override async void OnNavigatedTo(Microsoft.UI.Xaml.Navigation.NavigationEventArgs e)
    {
        base.OnNavigatedTo(e);
        await LoadPendingTeachersAsync();
        await LoadStatsAsync();
    }

    // lekéri az inaktív tanárokat az api-tól és feltölti a listát
    private async Task LoadPendingTeachersAsync()
    {
        try
        {
            var response = await _apiService.GetUsersAsync(page: 1, limit: 100, role: "tanar", active: false);
            
            if (response.Success && response.Data?.Users != null)
            {
                PendingTeachers.Clear();
                var pendingUsers = response.Data.Users.OrderByDescending(u => u.CreatedAt);
                
                foreach (var user in pendingUsers)
                {
                    PendingTeachers.Add(user);
                }

                // csak akkor látható a szekció, ha van jóváhagyásra váró tanár
                PendingTeachersSection.Visibility = PendingTeachers.Count > 0 ? Visibility.Visible : Visibility.Collapsed;
            }
        }
        catch (Exception ex)
        {
            ShowError($"Hiba a tanári regisztrációk betöltésekor: {ex.Message}");
        }
    }

    // elfogadja a tanár regisztrációját, aktiválja a felhasználót az adatbázisban
    private async void ApproveTeacher_Click(object sender, RoutedEventArgs e)
    {
        if (sender is Button button && button.Tag is int userId)
        {
            button.IsEnabled = false;

            try
            {
                var updateData = new { aktiv = true };
                var response = await _apiService.UpdateUserAsync(userId, updateData);

                if (response.Success)
                {
                    var user = PendingTeachers.FirstOrDefault(u => u.Id == userId);
                    if (user != null)
                    {
                        PendingTeachers.Remove(user);
                        
                        if (PendingTeachers.Count == 0)
                        {
                            PendingTeachersSection.Visibility = Visibility.Collapsed;
                        }

                        var dialog = new ContentDialog
                        {
                            Title = "Sikeres jóváhagyás",
                            Content = $"{user.FullName} regisztrációja sikeresen jóváhagyva.",
                            CloseButtonText = "OK",
                            XamlRoot = this.XamlRoot
                        };
                        await dialog.ShowAsync();
                        
                        await LoadStatsAsync();
                    }
                }
                else
                {
                    var errorDialog = new ContentDialog
                    {
                        Title = "Hiba",
                        Content = $"A jóváhagyás sikertelen: {response.Message}",
                        CloseButtonText = "OK",
                        XamlRoot = this.XamlRoot
                    };
                    await errorDialog.ShowAsync();
                    button.IsEnabled = true;
                }
            }
            catch (Exception ex)
            {
                var errorDialog = new ContentDialog
                {
                    Title = "Hiba",
                    Content = $"Hiba történt: {ex.Message}",
                    CloseButtonText = "OK",
                    XamlRoot = this.XamlRoot
                };
                await errorDialog.ShowAsync();
                button.IsEnabled = true;
            }
        }
    }

    // megerősítés után elutasítja és deaktiválja a tanár regisztrációját
    private async void DeclineTeacher_Click(object sender, RoutedEventArgs e)
    {
        if (sender is Button button && button.Tag is int userId)
        {
            var user = PendingTeachers.FirstOrDefault(u => u.Id == userId);
            if (user == null) return;

            var confirmDialog = new ContentDialog
            {
                Title = "Megerősítés szükséges",
                Content = $"Biztosan el szeretnéd utasítani {user.FullName} regisztrációját?\n\nEz deaktiválja a felhasználót.",
                PrimaryButtonText = "Igen, elutasítom",
                CloseButtonText = "Mégse",
                DefaultButton = ContentDialogButton.Close,
                XamlRoot = this.XamlRoot
            };

            var result = await confirmDialog.ShowAsync();
            if (result != ContentDialogResult.Primary) return;

            button.IsEnabled = false;

            try
            {
                var updateData = new { aktiv = false };
                var response = await _apiService.UpdateUserAsync(userId, updateData);

                if (response.Success)
                {
                    PendingTeachers.Remove(user);
                    
                    if (PendingTeachers.Count == 0)
                    {
                        PendingTeachersSection.Visibility = Visibility.Collapsed;
                    }

                    var successDialog = new ContentDialog
                    {
                        Title = "Sikeres elutasítás",
                        Content = $"{user.FullName} regisztrációja elutasítva és deaktiválva.",
                        CloseButtonText = "OK",
                        XamlRoot = this.XamlRoot
                    };
                    await successDialog.ShowAsync();
                }
                else
                {
                    var errorDialog = new ContentDialog
                    {
                        Title = "Hiba",
                        Content = $"Az elutasítás sikertelen: {response.Message}",
                        CloseButtonText = "OK",
                        XamlRoot = this.XamlRoot
                    };
                    await errorDialog.ShowAsync();
                    button.IsEnabled = true;
                }
            }
            catch (Exception ex)
            {
                var errorDialog = new ContentDialog
                {
                    Title = "Hiba",
                    Content = $"Hiba történt: {ex.Message}",
                    CloseButtonText = "OK",
                    XamlRoot = this.XamlRoot
                };
                await errorDialog.ShowAsync();
                button.IsEnabled = true;
            }
        }
    }

    // lekéri az általános statisztikákat az api-tól és megjeleníti őket
    private async Task LoadStatsAsync()
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
        catch (Exception ex)
        {
            ShowError($"Error: {ex.Message}");
        }
        finally
        {
            SetLoading(false);
        }
    }

    // feltölti a statisztikai mezőket a kapott adatokkal
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

    // töltési állapotot kapcsol, elrejti vagy mutatja a tartalmat
    private void SetLoading(bool loading)
    {
        LoadingRing.IsActive = loading;
        LoadingRing.Visibility = loading ? Visibility.Visible : Visibility.Collapsed;
        if (loading) ContentPanel.Visibility = Visibility.Collapsed;
    }

    // hibaüzenetet jelenít meg az infobar segítségével
    private void ShowError(string message)
    {
        ContentPanel.Visibility = Visibility.Visible;
        ErrorBar.Message = message;
        ErrorBar.IsOpen = true;
    }
}
