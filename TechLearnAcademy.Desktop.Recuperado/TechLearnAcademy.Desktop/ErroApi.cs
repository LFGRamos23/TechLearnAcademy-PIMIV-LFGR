using System;

namespace TechLearnAcademy.Desktop;

public class ErroApi(int status, string mensagem) : Exception(mensagem)
{
	public int Status { get; } = status;
}
