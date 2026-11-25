// Inicia a janela Windows do protótipo MAUI.
using Microsoft.UI.Xaml;

namespace TechLearnAcademy.Mobile.WinUI;

/// <summary>
/// Inicia a aplicação MAUI na plataforma Windows.
/// </summary>
public partial class App : MauiWinUIApplication
{
	/// <summary>
	/// Prepara os componentes da janela antes de abrir a tela principal.
	/// </summary>
	public App()
	{
		this.InitializeComponent();
	}

	protected override MauiApp CreateMauiApp() => MauiProgram.CreateMauiApp();
}

