using Microsoft.Web.WebView2.WinForms;

namespace TechLearnAcademy.Desktop;

public class TelaPrincipal : Form
{
    private readonly TextBox endereco = new() { Dock = DockStyle.Fill };
    private readonly Button abrir = new() { Text = "Abrir plataforma", AutoSize = true };
    private readonly Label mensagem = new() { Dock = DockStyle.Top, Height = 30 };
    private readonly WebView2 navegador = new() { Dock = DockStyle.Fill };

    public TelaPrincipal()
    {
        Text = "TechLearn Academy";
        Width = 1100;
        Height = 760;
        MinimumSize = new Size(650, 480);
        StartPosition = FormStartPosition.CenterScreen;
        endereco.Text = Environment.GetEnvironmentVariable("TECHLEARN_URL") ?? "https://localhost:7291/";
        endereco.AccessibleName = "Endereço HTTPS da plataforma";
        var barra = new TableLayoutPanel { Dock = DockStyle.Top, Height = 45, ColumnCount = 2, Padding = new Padding(8) };
        barra.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 100));
        barra.ColumnStyles.Add(new ColumnStyle(SizeType.AutoSize));
        barra.Controls.Add(endereco, 0, 0);
        barra.Controls.Add(abrir, 1, 0);
        Controls.Add(navegador);
        Controls.Add(mensagem);
        Controls.Add(barra);
        abrir.Click += AbrirPlataforma;
        Shown += AbrirPlataforma;
        FormClosing += AoFechar;
    }

    private async void AbrirPlataforma(object? sender, EventArgs e)
    {
        if (!Uri.TryCreate(endereco.Text.Trim(), UriKind.Absolute, out Uri? url) ||
            url.Scheme != "https" || url.UserInfo != "")
        {
            mensagem.Text = "Informe um endereço HTTPS válido.";
            return;
        }

        abrir.Enabled = false;
        try
        {
            await navegador.EnsureCoreWebView2Async();
            // Não oferece armazenamento automático de senhas.
            navegador.CoreWebView2.Settings.IsPasswordAutosaveEnabled = false;
            navegador.CoreWebView2.Settings.IsGeneralAutofillEnabled = false;
            navegador.CoreWebView2.NewWindowRequested -= AbrirMaterial;
            navegador.CoreWebView2.NewWindowRequested += AbrirMaterial;
            navegador.Source = url;
            mensagem.Text = "Use os dados do site. Para encerrar a sessão, escolha Sair.";
        }
        catch
        {
            mensagem.Text = "Não foi possível abrir. Confira servidor, certificado HTTPS e WebView2 Runtime.";
        }
        finally { abrir.Enabled = true; }
    }

    private void AbrirMaterial(object? sender, Microsoft.Web.WebView2.Core.CoreWebView2NewWindowRequestedEventArgs e)
    {
        e.Handled = true;
        if (!Uri.TryCreate(e.Uri, UriKind.Absolute, out Uri? url) ||
            (url.Scheme != "https" && url.Scheme != "http"))
            return;
        try
        {
            System.Diagnostics.Process.Start(new System.Diagnostics.ProcessStartInfo(url.AbsoluteUri) { UseShellExecute = true });
        }
        catch { mensagem.Text = "Não foi possível abrir este material no navegador."; }
    }

    private void AoFechar(object? sender, FormClosingEventArgs e)
    {
        // Apaga o cookie local; Sair também revoga a sessão na API.
        navegador.CoreWebView2?.CookieManager.DeleteAllCookies();
    }
}

