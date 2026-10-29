using System;
using System.Linq;
using System.Net.Mail;
using System.Text;
using System.Text.RegularExpressions;

namespace TechLearnAcademy.Desktop;

public static class Validacao
{
	public static void Nome(string nome)
	{
		if (nome.Length < 2 || nome.Length > 100)
		{
			throw new InvalidOperationException("O nome deve ter de 2 a 100 caracteres.");
		}
	}

	public static void Email(string email)
	{
		if (email.Length > 254 || !MailAddress.TryCreate(email, out MailAddress result) || result.Address != email || !Regex.IsMatch(email, "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$"))
		{
			throw new InvalidOperationException("Informe um e-mail válido de até 254 caracteres.");
		}
	}

	public static string Telefone(string telefone)
	{
		string numeros = Regex.Replace(telefone, @"[\s()\-]", "");
		if (!Regex.IsMatch(numeros, @"^[0-9]{10,11}$"))
		{
			throw new InvalidOperationException("Informe um telefone com DDD e 10 ou 11 números.");
		}
		return numeros;
	}

	public static void Sexo(string sexo, string descricao)
	{
		if (sexo != "Masculino" && sexo != "Feminino" && sexo != "Outro")
		{
			throw new InvalidOperationException("Escolha Masculino, Feminino ou Outro.");
		}
		if (sexo == "Outro" && (descricao.Trim().Length < 2 || descricao.Trim().Length > 60))
		{
			throw new InvalidOperationException("Descreva a opção Outro com 2 a 60 caracteres.");
		}
	}

	public static void Senha(string senha, string confirmacao)
	{
		Rune[] array = senha.EnumerateRunes().ToArray();
		if (array.Length < 8)
		{
			throw new InvalidOperationException("A senha deve ter pelo menos 8 caracteres.");
		}
		if (array.Any(Rune.IsWhiteSpace))
		{
			throw new InvalidOperationException("A senha não pode conter espaços.");
		}
		if (!array.Any(Rune.IsUpper))
		{
			throw new InvalidOperationException("Inclua uma letra maiúscula.");
		}
		if (!array.Any(Rune.IsNumber))
		{
			throw new InvalidOperationException("Inclua um número.");
		}
		if (!array.Any((Rune c) => !Rune.IsLetter(c) && !Rune.IsNumber(c)))
		{
			throw new InvalidOperationException("Inclua um caractere especial.");
		}
		if (senha != confirmacao)
		{
			throw new InvalidOperationException("As senhas devem ser exatamente iguais.");
		}
	}
}
