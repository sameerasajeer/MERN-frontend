import React, { useRef, useState, useEffect } from 'react';
import { X, Video, Square, CheckCircle } from 'lucide-react';

const VideoRecorder = ({ onRecordingComplete, onClose }) => {
    const videoRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const [isRecording, setIsRecording] = useState(false);
    const [stream, setStream] = useState(null);
    const chunksRef = useRef([]);

    useEffect(() => {
        startCamera();
        return () => {
            stopCamera();
        };
    }, []);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (err) {
            console.error("Error accessing camera:", err);
            alert("Could not access camera/microphone. Please check permissions.");
            onClose();
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
    };

    const startRecording = () => {
        if (!stream) return;

        chunksRef.current = [];
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
                chunksRef.current.push(e.data);
            }
        };

        mediaRecorder.onstop = () => {
            const blob = new Blob(chunksRef.current, { type: 'video/webm' });
            const file = new File([blob], "recorded-video.webm", { type: 'video/webm' });
            onRecordingComplete(file);
            onClose();
        };

        mediaRecorder.start();
        setIsRecording(true);
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="bg-gray-900 p-4 rounded-xl shadow-2xl max-w-lg w-full">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-white font-semibold">Record Video Note</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                <div className="relative bg-black rounded-lg overflow-hidden aspect-video mb-6">
                    <video
                        ref={videoRef}
                        autoPlay
                        muted
                        className="w-full h-full object-cover"
                    />
                    {isRecording && (
                        <div className="absolute top-4 right-4 flex items-center space-x-2">
                            <span className="animate-pulse h-3 w-3 bg-red-500 rounded-full"></span>
                            <span className="text-white text-xs font-bold shadow-black drop-shadow-md">REC</span>
                        </div>
                    )}
                </div>

                <div className="flex justify-center">
                    {!isRecording ? (
                        <button
                            onClick={startRecording}
                            className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full font-medium transition-all transform hover:scale-105"
                        >
                            <Video size={20} />
                            <span>Start Recording</span>
                        </button>
                    ) : (
                        <button
                            onClick={stopRecording}
                            className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-full font-medium transition-all"
                        >
                            <Square size={20} fill="currentColor" />
                            <span>Stop & Save</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VideoRecorder;
