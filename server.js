const express = require('express');
const ytDlp = require('yt-dlp');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Route untuk mengunduh video
app.post('/download', async (req, res) => {
  const { videoUrl } = req.body;

  if (!videoUrl) {
    return res.status(400).json({ message: 'Video URL is required' });
  }

  const outputFolder = path.join(__dirname, 'downloads');
  if (!fs.existsSync(outputFolder)) {
    fs.mkdirSync(outputFolder); // Membuat folder jika belum ada
  }

  const outputTemplate = path.join(outputFolder, '%(title)s.%(ext)s');

  try {
    const ydl = ytDlp({
      format: 'best',
      outtmpl: outputTemplate,
      noplaylist: true, // Menghindari mengunduh playlist
    });

    ydl.on('end', () => {
      // Mengirimkan URL file setelah selesai diunduh
      const videoTitle = ydl.info.title;
      const filePath = path.join(outputFolder, `${videoTitle}.mp4`);
      res.json({ message: 'Download complete!', filePath });
    });

    ydl.on('error', (err) => {
      res.status(500).json({ message: `Error: ${err.message}` });
    });

    // Mulai pengunduhan
    await ydl.download(videoUrl);

  } catch (error) {
    res.status(500).json({ message: `Error downloading video: ${error.message}` });
  }
});

// Menjalankan server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
