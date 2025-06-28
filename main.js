addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

const BOT_TOKEN = '<7930139593:AAEfK99-9dRhR4F-NJw9EpC61yUs1f-aY9c>';
const API_BASE = 'https://your-koyeb-app-url'; // match Koyeb URL

async function handleRequest(req) {
  let update;
  try {
    update = await req.json()
  } catch {
    return new Response('Not JSON', { status: 400 });
  }

  const msg = update.message;
  if (!msg || !msg.text) return new Response('OK', { status: 200 });

  const chatId = msg.chat.id;
  const text = msg.text.trim();

  if (text.startsWith('/play ')) {
    const query = encodeURIComponent(text.slice(6));
    const apiRes = await fetch(`${API_BASE}/play?song=${query}`);
    if (!apiRes.headers.get('content-type')?.includes('application/json')) {
      const err = await apiRes.text();
      await sendMessage(chatId, `🎧 Backend error:\n${err.substring(0, 300)}`);
      return new Response('OK', { status: 200 });
    }
    const data = await apiRes.json();
    if (!data.url) {
      await sendMessage(chatId, `❌ Invalid backend response.`);
      return new Response('OK', { status: 200 });
    }
    // Send the music link
    await sendMessage(chatId, `🎵 Now playing: [${data.title}](${data.url})\nDuration: ${data.duration}`);
  }
  // handle /pause, /stop, /resume similarly...

  return new Response('OK', { status: 200 });
}

async function sendMessage(chatId, text) {
  const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method:'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown', disable_web_page_preview: true })
  });
  try { await res.json() } catch {} 
}
