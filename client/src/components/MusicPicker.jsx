import React, { useState, useEffect } from 'react';
import { FaPlay, FaPause } from 'react-icons/fa';
import { Howl } from 'howler'; // npm install howler

const MusicPicker = ({ onSelectMusic }) => {
  const [musics, setMusics] = useState([]);
  const [playingId, setPlayingId] = useState(null);
  const [sound, setSound] = useState(null);

  useEffect(() => {
    // API থেকে মিউজিক ফেচ করা
    api.get('/music/trending').then(res => setMusics(res.data.data));
  }, []);

  const playPreview = (music) => {
    if (sound) sound.stop();
    const newSound = new Howl({ src: [music.url], html5: true });
    newSound.play();
    setSound(newSound);
    setPlayingId(music._id);
  };

  return (
    <div className="bg-[#16171d] p-4 rounded-t-3xl max-h-[300px] overflow-y-auto">
      <h3 className="text-white font-bold mb-4">Trending Beats</h3>
      {musics.map((music) => (
        <div key={music._id} className="flex items-center justify-between p-2 hover:bg-zinc-800 rounded-lg cursor-pointer">
          <div onClick={() => playPreview(music)}>
            <p className="text-white text-xs">{music.title}</p>
            <p className="text-zinc-500 text-[10px]">{music.artist}</p>
          </div>
          <button 
            onClick={() => onSelectMusic(music)}
            className="text-purple-500 text-xs font-bold"
          >Select</button>
        </div>
      ))}
    </div>
  );
};
export default MusicPicker;