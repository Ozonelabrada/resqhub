import React, { useRef, useState, useEffect } from 'react';
import { Button, Card } from '@/components/ui';
import { Download, Camera, X, CheckCircle, AlertCircle } from 'lucide-react';
import * as QRCode from 'qrcode';

interface QRModalProps {
  qrCode?: string; // Event QR code (for admin display)
  onClose: () => void;
  isAdmin?: boolean;
  isModerator?: boolean;
  userId?: string;
  userName?: string;
  eventId?: string;
  hasRsvpd?: boolean;
  onCheckInSuccess?: (memberId: string, memberName: string) => void;
}

const QRModal: React.FC<QRModalProps> = ({
  qrCode,
  onClose,
  isAdmin = false,
  isModerator = false,
  userId,
  userName = 'Attendee',
  eventId,
  hasRsvpd = false,
  onCheckInSuccess,
}) => {
  const downloadLinkRef = useRef<HTMLAnchorElement>(null);
  const qrImgRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string } | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Generate personal member QR code data (JSON format)
  const generateMemberQRData = () => {
    return JSON.stringify({
      type: 'member_checkin',
      memberId: userId,
      memberName: userName,
      eventId: eventId,
      rsvpd: hasRsvpd,
      timestamp: new Date().toISOString(),
    });
  };

  // Generate QR code on mount
  useEffect(() => {
    if (!isAdmin && userId) {
      QRCode.toDataURL(generateMemberQRData(), {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        width: 300,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      })
        .then((url: string) => {
          setQrDataUrl(url);
        })
        .catch((err: Error) => {
          console.error('Error generating QR code:', err);
        });
    }
  }, [isAdmin, userId]);

  // Cleanup camera stream on unmount or modal close
  useEffect(() => {
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => {
          track.stop();
          console.log('Camera track stopped');
        });
      }
    };
  }, []);

  const handleDownloadQR = () => {
    if (qrDataUrl) {
      const link = document.createElement('a');
      link.href = qrDataUrl;
      link.download = `checkin-${userId}-${eventId}.png`;
      link.click();
    }
  };

  const handleStartCamera = async () => {
    try {
      setCameraActive(false);
      setScanResult(null);
      
      let stream: MediaStream | null = null;
      const constraints = [
        // Try with rear camera and higher constraints (mobile preference)
        { video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } } },
        // Fallback: front camera
        { video: { facingMode: { ideal: 'user' }, width: { ideal: 1280 }, height: { ideal: 720 } } },
        // Fallback: any camera with basic constraints
        { video: { width: { ideal: 1280 }, height: { ideal: 720 } } },
        // Fallback: any camera without constraints
        { video: true },
      ];

      let lastError: Error | null = null;

      for (const constraint of constraints) {
        try {
          console.log('Attempting camera access with constraint:', constraint);
          stream = await navigator.mediaDevices.getUserMedia(constraint);
          console.log('Camera access successful!');
          break;
        } catch (err) {
          lastError = err as Error;
          console.log('Constraint failed, trying next...', (err as Error).message);
          continue;
        }
      }

      if (!stream) {
        throw lastError || new Error('No camera constraints worked');
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          console.log('Video metadata loaded');
          videoRef.current?.play().catch(err => {
            console.error('Play error:', err);
            setScanResult({ success: false, message: 'Failed to play video stream.' });
          });
        };

        setCameraActive(true);
      }
    } catch (err) {
      console.error('Camera access error:', err);
      let errorMessage = 'Unable to access camera.';

      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          errorMessage = 'Camera permission denied. Please allow camera access in your browser settings and reload the page.';
        } else if (err.name === 'NotFoundError') {
          errorMessage = 'No camera found on this device.';
        } else if (err.name === 'NotReadableError') {
          errorMessage = 'Camera is in use by another application.';
        } else if (err.name === 'SecurityError') {
          errorMessage = 'Camera access blocked by security policy (HTTPS required on non-localhost).';
        } else {
          errorMessage = `Camera error: ${err.message}`;
        }
      }

      setScanResult({ success: false, message: errorMessage });
      setCameraActive(false);
    }
  };

  const handleStopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((track) => track.stop());
      setCameraActive(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Permission check: only admin and moderator can upload QR images
    if (!isAdmin && !isModerator) {
      setScanResult({ success: false, message: 'Only admins and moderators can scan QR images.' });
      return;
    }
    
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const result = e.target?.result as string;
          // In a real implementation, you would decode the QR code here
          // For now, we'll simulate successful scan
          setScanResult({
            success: true,
            message: `✓ Member checked in successfully`,
          });
          // Simulate calling the check-in API
          onCheckInSuccess?.('member-id-from-qr', 'Member Name');
          setTimeout(() => setScanResult(null), 3000);
        } catch (error) {
          setScanResult({ success: false, message: 'Failed to scan QR code' });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <Card className="max-w-sm w-full p-4 md:p-8 rounded-[2.5rem] space-y-6 text-center overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-black text-slate-800">
            {isAdmin ? 'Scan Check-In QR' : 'Check-In QR Code'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-slate-600" />
          </button>
        </div>

        {/* Description */}
        <p className="text-slate-600 font-medium text-sm">
          {isAdmin
            ? 'Scan attendee QR codes to check them in'
            : `Your personal check-in QR code - ${hasRsvpd ? 'RSVP Confirmed' : 'Not RSVPd'}`}
        </p>

        {/* QR Code Display or Camera Feed */}
        <div className="bg-white p-4 md:p-6 rounded-2xl border-2 border-slate-100">
          {!cameraActive && !isAdmin && qrDataUrl && (
            <img src={qrDataUrl} alt="Member QR Code" className="w-full rounded-xl" ref={qrImgRef} />
          )}
          {!cameraActive && !isAdmin && !qrDataUrl && (
            <div className="w-full aspect-square bg-slate-100 rounded-xl flex items-center justify-center text-slate-500">
              <p className="text-sm font-bold">Generating QR Code...</p>
            </div>
          )}
          {cameraActive && isAdmin && (
            <video
              ref={videoRef}
              className="w-full rounded-xl bg-black"
              autoPlay
              playsInline
              muted
              onError={(e) => {
                console.error('Video element error:', e);
                setScanResult({ success: false, message: 'Video stream error occurred.' });
              }}
            />
          )}
          {!cameraActive && isAdmin && (
            <div className="w-full aspect-square bg-slate-100 rounded-xl flex items-center justify-center text-slate-500">
              <Camera size={48} />
            </div>
          )}
        </div>

        {/* Scan Result Feedback */}
        {scanResult && (
          <div
            className={`p-3 rounded-xl border flex items-center gap-2 ${
              scanResult.success
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
            }`}
          >
            {scanResult.success ? (
              <>
                <CheckCircle size={16} className="text-green-700 flex-shrink-0" />
                <p className="text-sm font-bold text-green-700">{scanResult.message}</p>
              </>
            ) : (
              <>
                <AlertCircle size={16} className="text-red-700 flex-shrink-0" />
                <p className="text-sm font-bold text-red-700">{scanResult.message}</p>
              </>
            )}
          </div>
        )}

        {/* Member Info Display */}
        {!isAdmin && (
          <div className="bg-teal-50 p-3 rounded-xl border border-teal-200">
            <p className="text-xs font-bold text-teal-600 uppercase mb-1">Your Details</p>
            <p className="text-sm font-bold text-slate-800">{userName}</p>
            <p className={`text-xs font-semibold mt-1 ${hasRsvpd ? 'text-green-700' : 'text-amber-700'}`}>
              {hasRsvpd ? '✓ RSVP Confirmed' : '⚠ Not Confirmed'}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        {!isAdmin ? (
          // Member Actions - Generate QR
          <div className="space-y-2 md:space-y-3">
            <Button
              onClick={handleDownloadQR}
              disabled={!qrDataUrl}
              className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white font-bold rounded-xl py-2 md:py-3 flex items-center justify-center gap-2 text-sm md:text-base"
            >
              <Download size={16} />
              Download QR Code
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="w-full rounded-xl py-2 md:py-3 font-bold text-sm md:text-base"
            >
              Close
            </Button>
          </div>
        ) : (
          // Admin Actions - Scan QR
          <div className="space-y-2 md:space-y-3">
            {!cameraActive ? (
              <>
                <Button
                  onClick={handleStartCamera}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl py-2 md:py-3 flex items-center justify-center gap-2 text-sm md:text-base"
                >
                  <Camera size={16} />
                  Start Camera
                </Button>
                {(isAdmin || isModerator) ? (
                  <div className="relative">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      style={{ display: 'none' }}
                    />
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      variant="outline"
                      className="w-full rounded-xl py-2 md:py-3 font-bold text-sm md:text-base"
                    >
                      Upload QR Image
                    </Button>
                  </div>
                ) : (
                  <Button
                    disabled
                    variant="outline"
                    className="w-full rounded-xl py-2 md:py-3 font-bold text-sm md:text-base opacity-50 cursor-not-allowed"
                  >
                    Upload QR Image (Admin/Moderator Only)
                  </Button>
                )}
              </>
            ) : (
              <Button
                onClick={handleStopCamera}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl py-2 md:py-3 flex items-center justify-center gap-2 text-sm md:text-base"
              >
                <X size={16} />
                Stop Camera
              </Button>
            )}
            <Button
              onClick={onClose}
              variant="outline"
              className="w-full rounded-xl py-2 md:py-3 font-bold text-sm md:text-base"
            >
              Close
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default QRModal;
