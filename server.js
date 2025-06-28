import express from 'express';
import ytdl from 'ytdl-core';
import cors from 'cors';

const app = express();
app.use(cors());

app.get('/play', async (req, res) => {
  const q = req.query.song;
  if (!q) return res.status(400).json({ error: 'Missing ?song= parameter' });
  try {
    // Find YouTube video
    const searchRes = await fetch(`https://youtube.googleapis.com/...q=${encodeURIComponent(q)}`);
    const items = await searchRes.json();
    if (!items.items?.length) throw new Error('No video found');
    const vid = items.items[0].id.videoId;

    const info = await ytdl.getInfo(vid);
    const format = ytdl.chooseFormat(info.formats, { quality: 'highestaudio' });
    if (!format || !format.url) throw new Error('No audio url');

    res.json({
      title: info.videoDetails.title,
      url: format.url,
      duration: info.videoDetails.lengthSeconds
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));
