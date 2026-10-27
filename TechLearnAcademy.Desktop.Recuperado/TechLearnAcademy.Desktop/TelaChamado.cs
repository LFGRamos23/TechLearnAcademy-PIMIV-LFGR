using System;
using System.Drawing;
using System.Globalization;
using System.Net.Http;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace TechLearnAcademy.Desktop;

public class TelaChamado : Form
{
	private readonly ApiCliente api;

	private readonly int id;

	private readonly Label titulo;

	private readonly Label detalhes;

	private readonly Label mensagem;

	private readonly RichTextBox conversa;

	private readonly TextBox resposta;

	private readonly Button atender;

	private readonly Button enviar;

	private readonly Button encerrar;

	private readonly Timer atualizacao = new Timer
	{
		Interval = 5000
	};

	private Chamado? chamado;

	private bool ocupado;

	public TelaChamado(ApiCliente api, int id)
	{
		TelaChamado telaChamado = this;
		this.api = api;
		this.id = id;
		Estilo.Preparar(this, "Atendimento do chamado", 820, 660);
		MinimumSize = new Size(750, 630);
		titulo = Estilo.Texto(this, "Carregando chamado...", 22, 18, 760, 35, negrito: true);
		titulo.Anchor = AnchorStyles.Top | AnchorStyles.Left | AnchorStyles.Right;
		detalhes = Estilo.Texto(this, "", 22, 60, 760, 65);
		detalhes.Anchor = titulo.Anchor;
		conversa = new RichTextBox
		{
			Location = new Point(22, 130),
			Size = new Size(770, 265),
			ReadOnly = true,
			BackColor = Color.White,
			AccessibleName = "Histórico da conversa",
			Anchor = (AnchorStyles.Top | AnchorStyles.Bottom | AnchorStyles.Left | AnchorStyles.Right)
		};
		Controls.Add(conversa);
		Panel panel = new Panel
		{
			Size = new Size(ClientSize.Width, 250),
			Dock = DockStyle.Bottom
		};
		Estilo.Texto(panel, "Sua mensagem", 22, 5, 700, 24, negrito: true);
		resposta = new TextBox
		{
			Location = new Point(22, 30),
			Size = new Size(770, 60),
			Multiline = true,
			MaxLength = 4000,
			ScrollBars = ScrollBars.Vertical,
			AccessibleName = "Sua mensagem",
			Anchor = (AnchorStyles.Top | AnchorStyles.Left | AnchorStyles.Right)
		};
		Estilo.HabilitarColagem(resposta);
		panel.Controls.Add(resposta);
		atender = Estilo.Botao(panel, "Atender chamado", 22, 106, 180);
		enviar = Estilo.Botao(panel, "Enviar mensagem", 212, 106, 180);
		encerrar = Estilo.Botao(panel, "Encerrar", 402, 106, 135, secundario: true);
		Button button = Estilo.Botao(panel, "Atualizar", 547, 106, 135, secundario: true);
		mensagem = Estilo.Texto(panel, "", 22, 160, 760, 75);
		mensagem.Anchor = AnchorStyles.Top | AnchorStyles.Left | AnchorStyles.Right;
		Controls.Add(panel);
		atender.Click += (object? _, EventArgs _) =>
		{
			telaChamado.Executar(async () =>
			{
				await api.Enviar<RespostaApi>("api/chamados/" + id + "/assumir", HttpMethod.Post);
			});
		};
		enviar.Click += (object? _, EventArgs _) =>
		{
			telaChamado.Executar(telaChamado.EnviarMensagem);
		};
		encerrar.Click += (object? _, EventArgs _) =>
		{
			telaChamado.Executar(telaChamado.Encerrar);
		};
		button.Click += (object? _, EventArgs _) =>
		{
			telaChamado.Executar(() => Task.CompletedTask);
		};
		Shown += (object? _, EventArgs _) =>
		{
			telaChamado.Executar(() => Task.CompletedTask);
			telaChamado.atualizacao.Start();
		};
		atualizacao.Tick += (object? _, EventArgs _) =>
		{
			if (telaChamado.ContainsFocus && !telaChamado.ocupado)
			{
				telaChamado.Executar(() => Task.CompletedTask, automatico: true);
			}
		};
		FormClosing += (object? _, FormClosingEventArgs e) =>
		{
			if (telaChamado.ocupado)
			{
				e.Cancel = true;
			}
		};
		FormClosed += (object? _, FormClosedEventArgs _) =>
		{
			telaChamado.atualizacao.Dispose();
		};
		LiberarAcoes();
	}

	private void LiberarAcoes(bool manterDigitacao = false)
	{
		atender.Enabled = !ocupado && (chamado?.PodeAtender ?? false);
		enviar.Enabled = !ocupado && (chamado?.PodeResponder ?? false);
		if (!manterDigitacao)
		{
			resposta.Enabled = !ocupado && (chamado?.PodeResponder ?? false);
		}
		encerrar.Enabled = !ocupado && (chamado?.PodeEncerrar ?? false);
	}

	private async void Executar(Func<Task> tarefa, bool automatico = false)
	{
		if (ocupado)
		{
			return;
		}
		ocupado = true;
		LiberarAcoes(automatico);
		bool sessaoVencida = false;
		try
		{
			await tarefa();
			chamado = await api.Enviar<Chamado>("api/chamados/" + id, HttpMethod.Get);
			titulo.Text = "#" + id + " · " + chamado.Assunto;
			detalhes.Text = "Solicitante: " + chamado.Solicitante + "\nResponsável: " + (chamado.Responsavel ?? "Aguardando atendimento") + " · " + chamado.Status;
			string text = "Descrição do chamado\n" + chamado.Descricao + "\n\n";
			foreach (MensagemChamado mensagen in chamado.Mensagens)
			{
				DateTime dateTime = ((mensagen.Data.Kind == DateTimeKind.Unspecified) ? DateTime.SpecifyKind(mensagen.Data, DateTimeKind.Utc) : mensagen.Data);
				text = text + mensagen.Nome + " · " + mensagen.Perfil + " · " + dateTime.ToLocalTime().ToString("g", CultureInfo.GetCultureInfo("pt-BR")) + "\n" + mensagen.Texto + "\n\n";
			}
			if (chamado.Mensagens.Count == 0)
			{
				text += "Ainda não há respostas.\n";
			}
			if (conversa.Text != text)
			{
				conversa.Text = text;
				conversa.SelectionStart = conversa.TextLength;
				conversa.ScrollToCaret();
			}
			if (!automatico || mensagem.ForeColor != Color.FromArgb(158, 37, 37))
			{
				Label label = mensagem;
				string texto;
				if (chamado.Status == "Encerrado")
				{
					texto = "Chamado encerrado. A conversa permanece no histórico.";
				}
				else
				{
					texto = (chamado.PodeAtender ? "Clique em Atender chamado para assumir esta conversa." : "Conversa atualizada pela API.");
				}
				Estilo.Aviso(label, texto);
			}
		}
		catch (Exception ex)
		{
			Estilo.Aviso(mensagem, ex.Message, erro: true);
			sessaoVencida = ex is ErroApi erroApi && erroApi.Status == 401;
		}
		finally
		{
			ocupado = false;
			LiberarAcoes();
		}
		if (sessaoVencida)
		{
			atualizacao.Stop();
			DialogResult = DialogResult.Abort;
		}
	}

	private async Task EnviarMensagem()
	{
		string text = resposta.Text.Trim();
		if (text.Length == 0)
		{
			throw new InvalidOperationException("Escreva uma mensagem antes de enviar.");
		}
		await api.Enviar<RespostaApi>("api/chamados/" + id + "/mensagens", HttpMethod.Post, new
		{
			texto = text
		});
		resposta.Clear();
	}

	private async Task Encerrar()
	{
		if (MessageBox.Show("Encerrar este atendimento? A conversa será mantida no histórico.", "Encerrar chamado", MessageBoxButtons.YesNo, MessageBoxIcon.Question, MessageBoxDefaultButton.Button2) == DialogResult.Yes)
		{
			await api.Enviar<RespostaApi>("api/chamados/" + id + "/encerrar", HttpMethod.Post);
		}
	}
}
