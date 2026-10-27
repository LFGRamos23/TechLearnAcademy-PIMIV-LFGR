using System;
using System.IO;

namespace TechLearnAcademy.Desktop;

public static class Configuracao
{
	public const string EnderecoAzure = "https://techlearn-proj-pim-hyayf7cehyd3edfq.westus3-01.azurewebsites.net/";

	public static Uri LerEndereco()
	{
		string path = Path.Combine(AppContext.BaseDirectory, "servidor.txt");
		return ValidarEndereco(File.Exists(path) ? File.ReadAllText(path).Trim() : "https://techlearn-proj-pim-hyayf7cehyd3edfq.westus3-01.azurewebsites.net/");
	}

	public static Uri ValidarEndereco(string endereco)
	{
		if (!Uri.TryCreate(endereco, UriKind.Absolute, out Uri result) || result.Scheme != "https" || result.UserInfo != "" || result.Query != "" || result.Fragment != "" || result.AbsolutePath != "/")
		{
			throw new InvalidOperationException("Informe em servidor.txt somente a raiz HTTPS da API, sem usuário, senha ou caminho.");
		}
		return result;
	}
}
