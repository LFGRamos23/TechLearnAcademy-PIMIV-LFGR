using System;
using System.ComponentModel;
using System.Drawing;
using System.Runtime.InteropServices;
using System.Windows.Forms;

namespace TechLearnAcademy.Desktop;

public static class Estilo
{
	public static readonly Color Azul = Color.FromArgb(17, 46, 72);

	public static readonly Color Verde = Color.FromArgb(8, 127, 131);

	public static readonly Color Fundo = Color.FromArgb(243, 246, 250);

	public static readonly Color TextoCor = Color.FromArgb(24, 44, 67);

	public static void Preparar(Form tela, string titulo, int largura, int altura)
	{
		tela.Text = titulo + " | TechLearn Academy";
		tela.ClientSize = new Size(largura, altura);
		tela.StartPosition = FormStartPosition.CenterScreen;
		tela.Font = new Font("Arial", 10f);
		tela.BackColor = Fundo;
		tela.ForeColor = TextoCor;
		tela.AutoScaleMode = AutoScaleMode.Dpi;
	}

	public static Label Texto(Control pai, string texto, int x, int y, int largura, int altura = 28, bool negrito = false)
	{
		Label label = new Label
		{
			Text = texto,
			AutoSize = false,
			Location = new Point(x, y),
			Size = new Size(largura, altura)
		};
		if (negrito)
		{
			label.Font = new Font(pai.Font, FontStyle.Bold);
		}
		pai.Controls.Add(label);
		return label;
	}

	public static TextBox Campo(Control pai, string rotulo, int y, bool senha = false, bool mostrar = true)
	{
		Texto(pai, rotulo, 28, y, 490, 24, negrito: true).Visible = mostrar;
		TextBox textBox = new TextBox
		{
			Location = new Point(28, y + 26),
			Width = 490,
			UseSystemPasswordChar = senha,
			AccessibleName = rotulo,
			MaxLength = 0,
			TabIndex = pai.Controls.Count,
			Visible = mostrar
		};
		HabilitarColagem(textBox);
		pai.Controls.Add(textBox);
		return textBox;
	}

	public static void HabilitarColagem(TextBox campo)
	{
		campo.ShortcutsEnabled = true;
		campo.KeyDown += (object? _, KeyEventArgs e) =>
		{
			if ((e.Control && e.KeyCode == Keys.V) || (e.Shift && e.KeyCode == Keys.Insert))
			{
				e.SuppressKeyPress = true;
				Colar(campo);
			}
		};
		ContextMenuStrip menu = new ContextMenuStrip();
		ToolStripItem desfazer = menu.Items.Add("Desfazer", null, (object? _, EventArgs _) =>
		{
			campo.Undo();
		});
		ToolStripItem recortar = menu.Items.Add("Recortar", null, (object? _, EventArgs _) =>
		{
			campo.Cut();
		});
		ToolStripItem copiar = menu.Items.Add("Copiar", null, (object? _, EventArgs _) =>
		{
			campo.Copy();
		});
		ToolStripItem colar = menu.Items.Add("Colar", null, (object? _, EventArgs _) =>
		{
			Colar(campo);
		});
		menu.Items.Add("Selecionar tudo", null, (object? _, EventArgs _) =>
		{
			campo.SelectAll();
		});
		menu.Opening += (object? _, CancelEventArgs _) =>
		{
			desfazer.Enabled = !campo.ReadOnly && campo.CanUndo;
			recortar.Enabled = !campo.ReadOnly && !campo.UseSystemPasswordChar && campo.SelectionLength > 0;
			copiar.Enabled = !campo.UseSystemPasswordChar && campo.SelectionLength > 0;
			colar.Enabled = !campo.ReadOnly;
		};
		campo.ContextMenuStrip = menu;
		campo.Disposed += (object? _, EventArgs _) =>
		{
			menu.Dispose();
		};
	}

	private static void Colar(TextBox campo)
	{
		if (campo.ReadOnly || !campo.Enabled)
		{
			return;
		}
		try
		{
			string text = Clipboard.GetText();
			if (text.Length != 0)
			{
				if (campo.MaxLength > 0 && campo.TextLength - campo.SelectionLength + text.Length > campo.MaxLength)
				{
					MessageBox.Show("O texto colado ultrapassa o limite deste campo.", "Colar texto");
				}
				else
				{
					campo.SelectedText = text;
				}
			}
		}
		catch (ExternalException)
		{
			MessageBox.Show("Não foi possível colar. Copie o texto e tente novamente.", "Colar texto");
		}
	}

	public static Button Botao(Control pai, string texto, int x, int y, int largura = 160, bool secundario = false)
	{
		Button button = new Button
		{
			Text = texto,
			Location = new Point(x, y),
			Size = new Size(largura, 38),
			BackColor = (secundario ? Color.White : Verde),
			ForeColor = (secundario ? TextoCor : Color.White),
			FlatStyle = FlatStyle.Flat,
			Cursor = Cursors.Hand,
			TabIndex = pai.Controls.Count,
			Font = new Font(pai.Font, FontStyle.Bold)
		};
		button.FlatAppearance.BorderColor = (secundario ? Color.FromArgb(186, 202, 214) : Verde);
		pai.Controls.Add(button);
		return button;
	}

	public static DataGridView Tabela(Control pai, params string[] colunas)
	{
		DataGridView dataGridView = new DataGridView
		{
			Dock = DockStyle.Fill,
			ReadOnly = true,
			MultiSelect = false,
			AllowUserToAddRows = false,
			AllowUserToDeleteRows = false,
			AllowUserToResizeRows = false,
			RowHeadersVisible = false,
			SelectionMode = DataGridViewSelectionMode.FullRowSelect,
			AutoSizeColumnsMode = DataGridViewAutoSizeColumnsMode.Fill,
			BackgroundColor = Color.White,
			BorderStyle = BorderStyle.FixedSingle,
			EnableHeadersVisualStyles = false,
			AccessibleName = "Lista de registros",
			AutoGenerateColumns = false
		};
		dataGridView.ColumnHeadersDefaultCellStyle.BackColor = Color.FromArgb(237, 243, 247);
		dataGridView.ColumnHeadersDefaultCellStyle.ForeColor = TextoCor;
		dataGridView.ColumnHeadersDefaultCellStyle.SelectionBackColor = Color.FromArgb(237, 243, 247);
		dataGridView.ColumnHeadersDefaultCellStyle.SelectionForeColor = TextoCor;
		dataGridView.ColumnHeadersDefaultCellStyle.Font = new Font(pai.Font, FontStyle.Bold);
		dataGridView.ColumnHeadersHeight = 38;
		dataGridView.ColumnHeadersHeightSizeMode = DataGridViewColumnHeadersHeightSizeMode.DisableResizing;
		dataGridView.DefaultCellStyle.SelectionBackColor = Color.FromArgb(208, 237, 232);
		dataGridView.DefaultCellStyle.SelectionForeColor = TextoCor;
		dataGridView.DefaultCellStyle.Padding = new Padding(5);
		dataGridView.RowTemplate.Height = 36;
		foreach (string text in colunas)
		{
			dataGridView.Columns.Add(text, text);
		}
		pai.Controls.Add(dataGridView);
		return dataGridView;
	}

	public static void Aviso(Label label, string texto, bool erro = false)
	{
		label.Text = texto;
		label.ForeColor = (erro ? Color.FromArgb(158, 37, 37) : TextoCor);
		label.AccessibleName = texto;
	}
}
