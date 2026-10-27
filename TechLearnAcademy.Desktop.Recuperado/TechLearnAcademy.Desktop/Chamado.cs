using System.Collections.Generic;

namespace TechLearnAcademy.Desktop;

public class Chamado
{
	public int Id { get; set; }

	public int SolicitanteId { get; set; }

	public int? ResponsavelId { get; set; }

	public string Assunto { get; set; } = "";

	public string Descricao { get; set; } = "";

	public string Solicitante { get; set; } = "";

	public string? Responsavel { get; set; }

	public string Status { get; set; } = "";

	public bool PodeAtender { get; set; }

	public bool PodeResponder { get; set; }

	public bool PodeEncerrar { get; set; }

	public List<MensagemChamado> Mensagens { get; set; } = new List<MensagemChamado>();
}
