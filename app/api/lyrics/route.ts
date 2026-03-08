import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const song = searchParams.get('song');
  const artist = searchParams.get('artist');

  if (!song) {
    return NextResponse.json({ error: 'Song name required' }, { status: 400 });
  }

  try {
    // 1. 先尝试网易云音乐 API
    const searchQuery = artist ? `${song} ${artist}` : song;
    const searchRes = await fetch(`https://netease-cloud-music-api-liard-six.vercel.app/search?keywords=${encodeURIComponent(searchQuery)}`);
    
    if (searchRes.ok) {
      const searchData = await searchRes.json();
      if (searchData.result?.songs?.[0]) {
        const songId = searchData.result.songs[0].id;
        
        // 获取歌词
        const lyricsRes = await fetch(`https://netease-cloud-music-api-liard-six.vercel.app/lyric?id=${songId}`);
        if (lyricsRes.ok) {
          const lyricsData = await lyricsRes.json();
          return NextResponse.json({
            source: 'netease',
            lyrics: lyricsData.lrc?.lyric || '',
            song: searchData.result.songs[0].name,
            artist: searchData.result.songs[0].artists[0]?.name
          });
        }
      }
    }

    // 2. 网易云查不到，使用 Groq 识别
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{
          role: 'user',
          content: `请提供歌曲《${song}》${artist ? `演唱者：${artist}` : ''} 的完整歌词。格式：每行一句歌词。`
        }]
      })
    });

    if (groqRes.ok) {
      const groqData = await groqRes.json();
      return NextResponse.json({
        source: 'ai',
        lyrics: groqData.choices[0].message.content,
        song,
        artist
      });
    }

    return NextResponse.json({ error: 'No lyrics found' }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch lyrics' }, { status: 500 });
  }
}
