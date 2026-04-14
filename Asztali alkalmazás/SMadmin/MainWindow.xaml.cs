using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices.WindowsRuntime;
using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using Microsoft.UI.Xaml.Controls.Primitives;
using Microsoft.UI.Xaml.Data;
using Microsoft.UI.Xaml.Input;
using Microsoft.UI.Xaml.Media;
using Microsoft.UI.Xaml.Navigation;
using Windows.Foundation;
using Windows.Foundation.Collections;
using SMadmin.Views;

namespace SMadmin
{
    /// <summary>
    /// An empty window that can be used on its own or navigated to within a Frame.
    /// </summary>
    public sealed partial class MainWindow : Window
    {
        public MainWindow()
        {
            InitializeComponent();
            Title = "Smart Manager - Admin Felület";
            ExtendsContentIntoTitleBar = true;
            SetTitleBar(AppTitleBar);
        }

        // a bal oldali navigációs menü elem kiválasztásakor a megfelelõ oldalra navigál
        private void NavigationView_SelectionChanged(NavigationView sender, NavigationViewSelectionChangedEventArgs args)
        {
            if (args.SelectedItemContainer != null)
            {
                var selectedTag = args.SelectedItemContainer.Tag?.ToString();

                switch (selectedTag)
                {
                    case "Dashboard":
                        ContentFrame.Navigate(typeof(DashboardPage));
                        break;
                    case "Users":
                        ContentFrame.Navigate(typeof(UsersPage));
                        break;
                    case "Projects":
                        ContentFrame.Navigate(typeof(ProjectsPage));
                        break;
                    case "Submissions":
                        ContentFrame.Navigate(typeof(SubmissionsPage));
                        break;
                }
            }
        }

        // az ablak betöltésekor automatikusan a dashboard oldalra navigál
        private void NavigationView_Loaded(object sender, RoutedEventArgs e)
        {
            ContentFrame.Navigate(typeof(DashboardPage));
        }
    }
}
