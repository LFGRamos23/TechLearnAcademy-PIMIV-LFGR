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
