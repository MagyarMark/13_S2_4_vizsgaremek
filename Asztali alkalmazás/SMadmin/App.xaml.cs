using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using SMadmin;
using SMadmin.Services;
using SMadmin.Views;

namespace SMadmin;

public partial class App : Application
{
    private static Window? _loginWindow;
    private static Window? _mainWindow;

    // egyetlen közös api service példány az egész alkalmazáshoz
    private static readonly AdminApiService _apiService = new();

    public App()
    {
        InitializeComponent();
    }

    // visszaadja a kért service példányát, jelenleg csak az adminapiservice-t támogatja
    public static T GetService<T>() where T : class
    {
        if (typeof(T) == typeof(AdminApiService))
            return (_apiService as T)!;

        throw new System.InvalidOperationException($"Service {typeof(T).Name} is not registered.");
    }

    // alkalmazás indításakor megjeleníti a bejelentkezési ablakot
    protected override void OnLaunched(LaunchActivatedEventArgs args)
    {
        _loginWindow = new Window { Title = "Smart Manager - Login" };
        var rootFrame = new Frame();
        rootFrame.Navigate(typeof(LoginPage));
        _loginWindow.Content = rootFrame;
        _loginWindow.Activate();
    }

    // sikeres bejelentkezés után megnyitja a főablakot és bezárja a login ablakot
    public static void ShowMainWindow()
    {
        _mainWindow = new MainWindow();
        _mainWindow.Activate();
        _loginWindow?.Close();
        _loginWindow = null;
    }
}
