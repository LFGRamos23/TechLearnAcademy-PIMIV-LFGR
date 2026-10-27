using System;
using System.Windows.Forms;

namespace TechLearnAcademy.Desktop;

internal static class Program
{
	[STAThread]
	private static void Main()
	{
		ApplicationConfiguration.Initialize();
		try
		{
			using ApiCliente api = new ApiCliente(Configuracao.LerEndereco());
			while (true)
			{
				using TelaLogin telaLogin = new TelaLogin(api);
				if (telaLogin.ShowDialog() != DialogResult.OK)
				{
					break;
				}
				using TelaPrincipal telaPrincipal = new TelaPrincipal(api, telaLogin.Usuario);
				telaPrincipal.ShowDialog();
				if (!telaPrincipal.VoltarAoLogin)
				{
					break;
				}
			}
		}
		catch (Exception ex)
		{
			MessageBox.Show(ex.Message, "TechLearn Academy", MessageBoxButtons.OK, MessageBoxIcon.Hand);
		}
	}
}
