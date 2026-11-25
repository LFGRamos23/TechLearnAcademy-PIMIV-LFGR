// Inicia a janela principal do protótipo MAUI.
namespace TechLearnAcademy.Mobile;

public partial class App : Application
{
    public App() { InitializeComponent(); }

    protected override Window CreateWindow(IActivationState? activationState)
    {
        return new Window(new MainPage());
    }
}

