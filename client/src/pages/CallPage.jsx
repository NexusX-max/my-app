import React, { useEffect, useRef, useState, useContext, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaMicrophone,
  FaMicrophoneSlash,
  FaVideo,
  FaVideoSlash,
  FaPhoneSlash,
  FaWifi,
  FaExclamationTriangle
} from 'react-icons/fa';

import Peer from 'simple-peer';
import axios from 'axios';

import { AuthContext } from '../context/AuthContext';

const iceServers = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },

  {
    urls: 'turn:free.expressturn.com:3478',
    username: '000000002092873381',
    credential: '41a1p2kRNdmvElbOfj71IniQi7Q='
  }
];

const CALL_TIMEOUT = 30000;

const CallPage = () => {
  const { roomId } = useParams();

  const [searchParams] = useSearchParams();

  const location = useLocation();

  const navigate = useNavigate();

  const { user, socket } = useContext(AuthContext);

  const callType = searchParams.get('type') || 'video';

  const incomingSignal = location.state?.incomingSignal;

  const callerId = location.state?.callerId;

  const [stream, setStream] = useState(null);

  const [callAccepted, setCallAccepted] = useState(false);

  const [callStatus, setCallStatus] = useState('idle');

  const [remoteUser, setRemoteUser] = useState(null);

  const [isMicOn, setIsMicOn] = useState(true);

  const [isVideoOn, setIsVideoOn] = useState(callType === 'video');

  const [callDuration, setCallDuration] = useState(0);

  const [networkState, setNetworkState] = useState('good');

  const [showControls, setShowControls] = useState(true);

  const localVideoRef = useRef(null);

  const remoteVideoRef = useRef(null);

  const connectionRef = useRef(null);

  const timeoutRef = useRef(null);

  const controlsTimeoutRef = useRef(null);

  const targetId =
    callerId || roomId?.split('-').find((id) => id !== user?._id);

  /* =========================================================
      FORMAT TIME
  ========================================================= */

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);

    const secs = seconds % 60;

    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  /* =========================================================
      AUTO HIDE CONTROLS
  ========================================================= */

  const resetControlsTimer = () => {
    setShowControls(true);

    clearTimeout(controlsTimeoutRef.current);

    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 4000);
  };

  /* =========================================================
      CALL TIMER
  ========================================================= */

  useEffect(() => {
    let interval;

    if (callAccepted) {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [callAccepted]);

  /* =========================================================
      FETCH REMOTE USER
  ========================================================= */

  useEffect(() => {
    const fetchRemoteUser = async () => {
      try {
        if (!targetId) return;

        const response = await axios.get(`/api/users/${targetId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });

        setRemoteUser(response.data);
      } catch (err) {
        console.log('Remote user fetch error', err);
      }
    };

    if (user) fetchRemoteUser();
  }, [targetId, user]);

  /* =========================================================
      CLEANUP
  ========================================================= */

  const cleanupAndExit = useCallback(() => {
    clearTimeout(timeoutRef.current);

    clearTimeout(controlsTimeoutRef.current);

    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    if (connectionRef.current) {
      connectionRef.current.destroy();
    }

    navigate('/messages', { replace: true });
  }, [navigate, stream]);

  /* =========================================================
      END CALL
  ========================================================= */

  const endCall = useCallback(() => {
    if (socket && targetId) {
      socket.emit('endCall', { to: targetId });
    }

    cleanupAndExit();
  }, [socket, targetId, cleanupAndExit]);

  /* =========================================================
      CREATE PEER
  ========================================================= */

  const createPeer = (initiator, currentStream) => {
    const peer = new Peer({
      initiator,
      trickle: false,

      stream: currentStream,

      config: {
        iceServers
      }
    });

    peer.on('connect', () => {
      setCallAccepted(true);

      setCallStatus('connected');

      clearTimeout(timeoutRef.current);
    });

    peer.on('stream', async (remoteStream) => {
      try {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;

          remoteVideoRef.current.muted = false;

          await remoteVideoRef.current.play();
        }
      } catch (err) {
        console.log('Playback error:', err);
      }
    });

    peer.on('error', (err) => {
      console.log('Peer error:', err);

      setCallStatus('failed');
    });

    peer.on('close', () => {
      cleanupAndExit();
    });

    const interval = setInterval(async () => {
      try {
        if (!peer._pc) return;

        const stats = await peer._pc.getStats();

        stats.forEach((report) => {
          if (report.type === 'candidate-pair') {
            if (report.currentRoundTripTime) {
              const ping = report.currentRoundTripTime * 1000;

              if (ping < 150) {
                setNetworkState('excellent');
              } else if (ping < 300) {
                setNetworkState('good');
              } else {
                setNetworkState('poor');
              }
            }
          }
        });
      } catch (err) {}
    }, 4000);

    peer.on('close', () => clearInterval(interval));

    return peer;
  };

  /* =========================================================
      CALL USER
  ========================================================= */

  const callUser = (currentStream) => {
    const peer = createPeer(true, currentStream);

    peer.on('signal', (data) => {
      socket.emit('callUser', {
        userToCall: targetId,

        signalData: data,

        from: user._id,

        name: user.fullName || 'Onyx User',

        type: callType,

        roomId
      });
    });

    connectionRef.current = peer;
  };

  /* =========================================================
      ANSWER CALL
  ========================================================= */

  const answerCall = (currentStream, signal) => {
    const peer = createPeer(false, currentStream);

    peer.on('signal', (data) => {
      socket.emit('answerCall', {
        signal: data,

        to: targetId
      });
    });

    peer.signal(signal);

    connectionRef.current = peer;
  };

  /* =========================================================
      INIT MEDIA
  ========================================================= */

  useEffect(() => {
    if (!socket || !user) return;

    let mounted = true;

    const initMedia = async () => {
      try {
        setCallStatus('requesting_media');

        const currentStream =
          await navigator.mediaDevices.getUserMedia({
            video:
              callType === 'video'
                ? {
                    width: { ideal: 1280 },

                    height: { ideal: 720 },

                    frameRate: { ideal: 30 },

                    facingMode: 'user'
                  }
                : false,

            audio: {
              echoCancellation: true,

              noiseSuppression: true,

              autoGainControl: true
            }
          });

        if (!mounted) return;

        setStream(currentStream);

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = currentStream;
        }

        timeoutRef.current = setTimeout(() => {
          if (!callAccepted) {
            setCallStatus('timeout');

            endCall();
          }
        }, CALL_TIMEOUT);

        if (incomingSignal) {
          setCallStatus('connecting');

          answerCall(currentStream, incomingSignal);
        } else {
          setCallStatus('ringing');

          callUser(currentStream);
        }
      } catch (err) {
        console.log('Media error:', err);

        navigate('/messages');
      }
    };

    initMedia();

    const handleCallAccepted = (signal) => {
      if (connectionRef.current) {
        connectionRef.current.signal(signal);
      }

      setCallAccepted(true);

      setCallStatus('connected');
    };

    const handleCallEnded = () => {
      cleanupAndExit();
    };

    const handleUserBusy = () => {
      setCallStatus('busy');

      setTimeout(() => {
        cleanupAndExit();
      }, 1500);
    };

    socket.on('callAccepted', handleCallAccepted);

    socket.on('callEnded', handleCallEnded);

    socket.on('userBusy', handleUserBusy);

    return () => {
      mounted = false;

      socket.off('callAccepted', handleCallAccepted);

      socket.off('callEnded', handleCallEnded);

      socket.off('userBusy', handleUserBusy);

      if (connectionRef.current) {
        connectionRef.current.destroy();
      }
    };
  }, []);

  /* =========================================================
      TOGGLE MIC
  ========================================================= */

  const toggleMic = () => {
    if (!stream) return;

    const audioTrack = stream.getAudioTracks()[0];

    if (!audioTrack) return;

    audioTrack.enabled = !audioTrack.enabled;

    setIsMicOn(audioTrack.enabled);
  };

  /* =========================================================
      TOGGLE VIDEO
  ========================================================= */

  const toggleVideo = () => {
    if (!stream || callType !== 'video') return;

    const videoTrack = stream.getVideoTracks()[0];

    if (!videoTrack) return;

    videoTrack.enabled = !videoTrack.enabled;

    setIsVideoOn(videoTrack.enabled);
  };

  /* =========================================================
      UI
  ========================================================= */

  return (
    <div
      onMouseMove={resetControlsTimer}
      onClick={resetControlsTimer}
      className="h-screen w-screen overflow-hidden bg-black relative flex items-center justify-center"
    >
      {/* REMOTE VIDEO */}

      <div className="absolute inset-0 bg-[#020617]">
        {callAccepted ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-8">
            <motion.div
              animate={{
                scale: [1, 1.03, 1]
              }}
              transition={{
                duration: 2,
                repeat: Infinity
              }}
              className="relative"
            >
              <div className="absolute inset-0 rounded-full bg-cyan-500 blur-3xl opacity-20" />

              <img
                src={
                  remoteUser?.profilePic ||
                  `https://ui-avatars.com/api/?name=${
                    remoteUser?.fullName || 'Onyx'
                  }`
                }
                alt="avatar"
                className="w-44 h-44 rounded-full object-cover border border-cyan-500/30 relative z-10"
              />
            </motion.div>

            <div className="text-center">
              <h2 className="text-white text-3xl font-bold">
                {remoteUser?.fullName || 'Connecting...'}
              </h2>

              <p className="text-cyan-400 mt-3 tracking-[0.4em] uppercase text-xs">
                {callStatus === 'ringing'
                  ? 'Calling...'
                  : callStatus === 'connecting'
                  ? 'Connecting...'
                  : callStatus === 'busy'
                  ? 'User Busy'
                  : 'Waiting...'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* NETWORK */}

      <div className="absolute top-8 left-8 z-50 flex items-center gap-3 bg-black/40 backdrop-blur-xl px-4 py-2 rounded-full border border-white/10">
        {networkState === 'poor' ? (
          <FaExclamationTriangle className="text-red-500" />
        ) : (
          <FaWifi className="text-green-400" />
        )}

        <span className="text-white text-sm uppercase tracking-wider">
          {networkState}
        </span>
      </div>

      {/* TIMER */}

      {callAccepted && (
        <div className="absolute top-8 z-50 bg-black/40 backdrop-blur-xl px-6 py-2 rounded-full border border-cyan-500/20">
          <p className="text-cyan-400 font-mono font-bold tracking-widest">
            {formatTime(callDuration)}
          </p>
        </div>
      )}

      {/* LOCAL VIDEO */}

      <motion.div
        drag
        dragMomentum={false}
        className="absolute top-8 right-6 w-36 md:w-48 aspect-[3/4] rounded-[2rem] overflow-hidden bg-zinc-900 z-50 border border-white/10 shadow-2xl"
      >
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover scale-x-[-1] transition-all duration-300 ${
            !isVideoOn ? 'opacity-0' : 'opacity-100'
          }`}
        />

        {!isVideoOn && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
            <FaVideoSlash className="text-zinc-600" size={28} />
          </div>
        )}
      </motion.div>

      {/* CONTROLS */}

      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 80 }}
            className="absolute bottom-14 z-50 flex items-center gap-7"
          >
            {/* MIC */}

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={toggleMic}
              className={`p-5 rounded-3xl transition-all ${
                !isMicOn
                  ? 'bg-red-500'
                  : 'bg-zinc-800/80 hover:bg-zinc-700'
              }`}
            >
              {isMicOn ? (
                <FaMicrophone className="text-white" size={20} />
              ) : (
                <FaMicrophoneSlash className="text-white" size={20} />
              )}
            </motion.button>

            {/* END */}

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={endCall}
              className="p-8 rounded-[2.5rem] bg-red-600 hover:bg-red-500 shadow-2xl"
            >
              <FaPhoneSlash className="text-white" size={32} />
            </motion.button>

            {/* VIDEO */}

            {callType === 'video' && (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={toggleVideo}
                className={`p-5 rounded-3xl transition-all ${
                  !isVideoOn
                    ? 'bg-red-500'
                    : 'bg-zinc-800/80 hover:bg-zinc-700'
                }`}
              >
                {isVideoOn ? (
                  <FaVideo className="text-white" size={20} />
                ) : (
                  <FaVideoSlash className="text-white" size={20} />
                )}
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CallPage;