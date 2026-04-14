using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using Microsoft.UI.Xaml.Input;
using SMadmin;
using SMadmin.Services;

namespace SMadmin.Views;

public sealed partial class LoginPage : Page
{
    private readonly AdminApiService _apiService;
    private bool _isLoading;

    public LoginPage()
    {
        this.InitializeComponent();
        _apiService = App.GetService<AdminApiService>();
    }

    // bejelentkezés gombra kattintáskor elindítja a bejelentkezési folyamatot
    private async void LoginButton_Click(object sender, RoutedEventArgs e)
    {
        await DoLoginAsync();
    }

    // enter billentyű lenyomásakor is elindítja a bejelentkezést
    private async void PasswordBox_KeyDown(object sender, KeyRoutedEventArgs e)
    {
        if (e.Key == Windows.System.VirtualKey.Enter)
            await DoLoginAsync();
    }

    // elvégzi a tényleges bejelentkezést az api segítségével, siker esetén megnyitja a főablakot
    private async System.Threading.Tasks.Task DoLoginAsync()
    {
        if (_isLoading) return;

        var username = UsernameBox.Text.Trim();
        var password = PasswordBox.Password;

        if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(password))
        {
            ShowError("Kérem adja meg a felhasználónevet és jelszót");
            return;
        }

        SetLoading(true);

        try
        {
            var result = await _apiService.LoginAsync(username, password);

            if (result.Success && !string.IsNullOrEmpty(result.Data?.AccessToken))
            {
                _apiService.SetAuthToken(result.Data.AccessToken, result.Data.User);
                App.ShowMainWindow();
            }
            else
            {
                ShowError(result.Message ?? "Sikertelen bejelentkezés");
            }
        }
        catch (System.Exception ex)
        {
            ShowError($"Hiba: {ex.Message}");
        }
        finally
        {
            SetLoading(false);
        }
    }

    // betöltési állapotot állít be, tiltja a gombot és mutatja a töltőanimációt
    private void SetLoading(bool loading)
    {
        _isLoading = loading;
        LoadingRing.IsActive = loading;
        LoadingRing.Visibility = loading ? Visibility.Visible : Visibility.Collapsed;
        LoginText.Visibility = loading ? Visibility.Collapsed : Visibility.Visible;
        LoginButton.IsEnabled = !loading;
    }

    // hibaüzenetet jelenít meg az infobar segítségével
    private void ShowError(string message)
    {
        ErrorBar.Message = message;
        ErrorBar.IsOpen = !string.IsNullOrEmpty(message);
    }
}
