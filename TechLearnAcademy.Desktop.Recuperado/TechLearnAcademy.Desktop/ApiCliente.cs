using System;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace TechLearnAcademy.Desktop;

public sealed class ApiCliente : IDisposable
{
	private readonly HttpClient cliente;

	private readonly CookieContainer cookies = new CookieContainer();

	private readonly JsonSerializerOptions json = new JsonSerializerOptions
	{
		PropertyNameCaseInsensitive = true
	};

	public Uri Endereco { get; }

	public ApiCliente(Uri endereco)
	{
		Endereco = endereco;
		HttpClientHandler handler = new HttpClientHandler
		{
			CookieContainer = cookies,
			AllowAutoRedirect = false
		};
		cliente = new HttpClient(handler)
		{
			BaseAddress = endereco,
			Timeout = TimeSpan.FromSeconds(90L)
		};
	}

	public async Task<Usuario> EntrarAdministrador(string email, string senha)
	{
		if ((await Enviar<Usuario>("api/usuarios/login", HttpMethod.Post, new { email, senha })).Perfil == "Administrador")
		{
			Usuario usuario = await Enviar<Usuario>("api/usuarios/perfil", HttpMethod.Get);
			if (usuario.Perfil == "Administrador")
			{
				return usuario;
			}
		}
		try
		{
			await Sair();
		}
		catch (ErroApi)
		{
			LimparSessao();
		}
		throw new ErroApi(403, "Este aplicativo é exclusivo para Administradores. Use o site com o seu perfil.");
	}

	public async Task<T> Enviar<T>(string caminho, HttpMethod metodo, object? dados = null)
	{
		using HttpRequestMessage pedido = new HttpRequestMessage(metodo, caminho);
		if (dados != null)
		{
			pedido.Content = new StringContent(JsonSerializer.Serialize(dados), Encoding.UTF8, "application/json");
		}
		try
		{
			using HttpResponseMessage resposta = await cliente.SendAsync(pedido);
			string text = await resposta.Content.ReadAsStringAsync();
			if (!resposta.IsSuccessStatusCode)
			{
				string text2 = "O servidor não concluiu a operação (HTTP " + (int)resposta.StatusCode + ").";
				try
				{
					text2 = JsonSerializer.Deserialize<RespostaApi>(text, json)?.Mensagem ?? text2;
				}
				catch (JsonException)
				{
				}
				if (string.IsNullOrWhiteSpace(text2))
				{
					text2 = "O servidor não concluiu a operação.";
				}
				throw new ErroApi((int)resposta.StatusCode, text2);
			}
			T val = JsonSerializer.Deserialize<T>(text, json);
			if (val == null)
			{
				throw new ErroApi(0, "O servidor devolveu uma resposta vazia.");
			}
			return val;
		}
		catch (HttpRequestException)
		{
			throw new ErroApi(0, "Não foi possível conectar ao servidor. Verifique sua internet e a disponibilidade da API.");
		}
		catch (TaskCanceledException)
		{
			throw new ErroApi(408, "O servidor demorou para responder. Tente novamente.");
		}
		catch (JsonException)
		{
			throw new ErroApi(0, "O servidor devolveu uma resposta inesperada.");
		}
	}

	public async Task Sair()
	{
		try
		{
			await Enviar<RespostaApi>("api/usuarios/logout", HttpMethod.Post);
		}
		finally
		{
			LimparSessao();
		}
	}

	public void LimparSessao()
	{
		foreach (Cookie allCookie in cookies.GetAllCookies())
		{
			allCookie.Expired = true;
		}
	}

	public void Dispose()
	{
		LimparSessao();
		cliente.Dispose();
	}
}
