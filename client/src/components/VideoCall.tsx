import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Maximize2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VideoCallProps {
  targetUserId: string;
  onClose: () => void;
  isIncoming?: boolean;
  incomingOffer?: any;
  socket: WebSocket | null;
}

export default function VideoCall({ targetUserId, onClose, isIncoming, incomingOffer, socket }: VideoCallProps) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callStatus, setCallStatus] = useState<'initializing' | 'calling' | 'connected' | 'ended'>('initializing');
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const { toast } = useToast();

  const configuration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ]
  };

  useEffect(() => {
    const initCall = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(stream);
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;

        peerConnection.current = new RTCPeerConnection(configuration);

        stream.getTracks().forEach(track => {
          peerConnection.current?.addTrack(track, stream);
        });

        peerConnection.current.ontrack = (event) => {
          setRemoteStream(event.streams[0]);
          if (remoteVideoRef.current) remoteVideoRef.current.srcObject = event.streams[0];
          setCallStatus('connected');
        };

        peerConnection.current.onicecandidate = (event) => {
          if (event.candidate && socket) {
            socket.send(JSON.stringify({
              type: 'webrtc_ice_candidate',
              payload: {
                targetUserId,
                candidate: event.candidate
              }
            }));
          }
        };

        if (isIncoming && incomingOffer) {
          await peerConnection.current.setRemoteDescription(new RTCSessionDescription(incomingOffer));
          const answer = await peerConnection.current.createAnswer();
          await peerConnection.current.setLocalDescription(answer);
          socket?.send(JSON.stringify({
            type: 'webrtc_answer',
            payload: { targetUserId, answer }
          }));
        } else {
          setCallStatus('calling');
          const offer = await peerConnection.current.createOffer();
          await peerConnection.current.setLocalDescription(offer);
          socket?.send(JSON.stringify({
            type: 'webrtc_offer',
            payload: { targetUserId, offer }
          }));
        }
      } catch (err) {
        console.error('Video call init error:', err);
        toast({ title: "Call Error", description: "Failed to access camera or microphone", variant: "destructive" });
        onClose();
      }
    };

    initCall();

    return () => {
      localStream?.getTracks().forEach(track => track.stop());
      peerConnection.current?.close();
    };
  }, []);

  // Handle incoming signaling messages via prop updates or parent callback
  // For simplicity in this CLI context, we assume the parent passes messages down
  // In a real app, you'd use a custom hook or global state

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => track.enabled = isMuted);
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => track.enabled = isVideoOff);
      setIsVideoOff(!isVideoOff);
    }
  };

  const endCall = () => {
    setCallStatus('ended');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <Card className="w-full max-w-4xl bg-zinc-900 border-zinc-800 overflow-hidden relative aspect-video">
        <CardContent className="p-0 h-full relative">
          {/* Remote Video (Main) */}
          <div className="w-full h-full bg-zinc-950 flex items-center justify-center">
            {remoteStream ? (
              <video 
                ref={remoteVideoRef} 
                autoPlay 
                playsInline 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center gap-4 text-zinc-500">
                <div className="w-20 h-20 rounded-full bg-zinc-800 animate-pulse flex items-center justify-center">
                  <Video className="w-10 h-10" />
                </div>
                <p className="text-sm font-medium">
                  {callStatus === 'calling' ? 'Calling...' : 'Connecting...'}
                </p>
              </div>
            )}
          </div>

          {/* Local Video (PIP) */}
          <div className="absolute top-4 right-4 w-1/4 aspect-video bg-zinc-800 rounded-lg border border-zinc-700 overflow-hidden shadow-2xl z-10">
            <video 
              ref={localVideoRef} 
              autoPlay 
              muted 
              playsInline 
              className="w-full h-full object-cover"
            />
            {isVideoOff && (
              <div className="absolute inset-0 bg-zinc-800 flex items-center justify-center">
                <VideoOff className="w-6 h-6 text-zinc-600" />
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 z-20">
            <Button 
              variant={isMuted ? "destructive" : "secondary"} 
              size="icon" 
              className="rounded-full w-12 h-12"
              onClick={toggleMute}
              aria-label={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <MicOff /> : <Mic />}
            </Button>
            
            <Button 
              variant={isVideoOff ? "destructive" : "secondary"} 
              size="icon" 
              className="rounded-full w-12 h-12"
              onClick={toggleVideo}
              aria-label={isVideoOff ? "Turn on video" : "Turn off video"}
            >
              {isVideoOff ? <VideoOff /> : <Video />}
            </Button>

            <Button 
              variant="destructive" 
              size="icon" 
              className="rounded-full w-14 h-14"
              onClick={endCall}
              aria-label="End call"
            >
              <PhoneOff className="fill-current" />
            </Button>

            <Button 
              variant="secondary" 
              size="icon" 
              className="rounded-full w-12 h-12"
              aria-label="Maximize video"
            >
              <Maximize2 />
            </Button>
          </div>

          {/* User Info overlay */}
          <div className="absolute top-6 left-6 z-20 text-white drop-shadow-md">
            <h3 className="font-bold text-lg">Virtual Audition</h3>
            <p className="text-xs text-zinc-300 opacity-80 uppercase tracking-widest">Live Session</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
