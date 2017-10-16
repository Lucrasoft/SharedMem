using System;
using System.ComponentModel;
using System.Drawing;
using System.Windows.Forms;
using SharedMemLib;


namespace SharedMemGUI
{
    public partial class Form1 : Form
    {
        private Simulator sim;
        private int w;
        private int h;
        private GameState drawState;

        private const int Dimensions = 8;

        public Form1()
        {
            InitializeComponent();
        }
   
        private void pictureBox1_Paint(object sender, PaintEventArgs e)
        {
           if (drawState == null) return;

            //draw gameState
            //GameState state = drawState;

            w = pictureBox1.Width / drawState.Dimension;
            h = pictureBox1.Height / drawState.Dimension;
            var m = w / 3;

            var g = e.Graphics;

            for (int col = 0; col < drawState.Dimension; col++)
            {
                for (var row = 0; row < drawState.Dimension; row++)
                {
                    var cell = drawState.GetCell(row, col);
                    if (cell.Owner == 0)
                    {
                        g.FillRectangle(Brushes.Silver, col * w, row * h, w, h);
                    }
                    if (cell.Owner == 1)
                    {
                        g.FillRectangle(Brushes.Red, col * w, row * h, w, h);
                        var red = new SolidBrush(Color.FromArgb(cell.Value, 0, 0));
                        g.FillRectangle(red, col * w + m, row * h + m, w - 2 * m, h - 2 * m);
                    }
                    if (cell.Owner == 2)
                    {
                        g.FillRectangle(Brushes.Blue, col * w, row * h, w, h);
                        var blue = new SolidBrush(Color.FromArgb(0, 0, cell.Value));
                        g.FillRectangle(blue, col * w + m, row * h + m, w - 2 * m, h - 2 * m);
                    }
                    g.DrawString(cell.Value.ToString(), DefaultFont, Brushes.White, col * w + w/2, row * h + h/2);

                }
            }

            if (listBox1.SelectedItem != null)
            {
                var action = (ThreadAction)listBox1.SelectedItem;

                //mark source
                var col = action.SourceIndex % drawState.Dimension;
                var row = action.SourceIndex / drawState.Dimension;
                g.DrawRectangle(Pens.Black, col * w, row * h, w, h);

                //mark dest
                col = action.DestIndex % drawState.Dimension;
                row = action.DestIndex/ drawState.Dimension;
                g.DrawRectangle(Pens.Black, col * w, row * h, w, h);
            }
        }

        private void Form1_Load(object sender, EventArgs e)
        {
        }
        
        private void timer1_Tick(object sender, EventArgs e)
        {
        }
    
        private void toolStripButton1_Click(object sender, EventArgs e)
        {
            if (openFileDialog1.ShowDialog() == DialogResult.OK)
            {
                toolStripTextBox1.Text = openFileDialog1.FileName;
            }
        }

        private void toolStripButton3_Click(object sender, EventArgs e)
        {
            openFileDialog1.FileName = toolStripTextBox3.Text;
            if (openFileDialog1.ShowDialog() == DialogResult.OK)
            {
                toolStripTextBox3.Text = openFileDialog1.FileName;
            }
        }

        private void btnNewGame_Click_1(object sender, EventArgs e)
        {
            var ce1 = new ConsoleEngine(1, Dimensions, toolStripTextBox1.Text, toolStripTextBox2.Text, toolStripTextBox6.Text);
            var ce2 = new ConsoleEngine(2, Dimensions, toolStripTextBox3.Text, toolStripTextBox4.Text, toolStripTextBox5.Text);

            trackBar1.Value = 0;
            trackBar1.Maximum = int.MaxValue;

            sim = new Simulator(ce1, ce2, Dimensions);
            sim.PlayGame();

            //setup Trackbar for history view
            trackBar1.Value = 0;
            trackBar1.Maximum = sim.State.Round-1;

            pictureBox1.Refresh();
            
            MessageBox.Show($"Done! {sim.State.Winner} wins the game!");
        }

        private void btnOneMove_Click_1(object sender, EventArgs e)
        {
            sim.DoRound();
            pictureBox1.Refresh();
        }

        private void trackBar1_Scroll(object sender, EventArgs e)
        {
            toolStripStatusLabel1.Text = string.Format("{0} of {1}", trackBar1.Value, trackBar1.Maximum);
            if (sim!=null)
            {
                if (trackBar1.Value<sim.Statehistory.Count)
                {
                    drawState = sim.Statehistory[trackBar1.Value];
                    pictureBox1.Refresh();
                    UpdateList();
                }
            }
        }

        private void UpdateList()
        {
            listBox1.Items.Clear();
            if (sim != null)
            {
                if (trackBar1.Value < sim.Actionhistory.Count)
                {
                    var curAction = sim.Actionhistory[trackBar1.Value];
                    foreach (var action in curAction)
                    {
                        listBox1.Items.Add(action);
                    }
                }

            }
        }


        private void pictureBox1_Click_1(object sender, EventArgs e)
        {

        }

        private void Form1_Resize(object sender, EventArgs e)
        {
            pictureBox1.Refresh();
        }

        private void listBox1_SelectedIndexChanged(object sender, EventArgs e)
        {
            pictureBox1.Refresh();
        }

        private void openFileDialog1_FileOk(object sender, CancelEventArgs e)
        {
        }

        private void Form1_FormClosed(object sender, FormClosedEventArgs e)
        {
            Properties.Settings.Default.Params1 = toolStripTextBox2.Text;
            Properties.Settings.Default.Params2 = toolStripTextBox4.Text;

            Properties.Settings.Default.Save();
        }
    }
}
