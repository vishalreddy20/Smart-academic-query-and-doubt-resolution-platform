import React, { useEffect, useRef, useState } from 'react';

interface LoginVideoProps {
  src: string;
  poster?: string;
  className?: string;
  preloadOnMount?: boolean;
  children?: React.ReactNode; // fallback (e.g., illustration)
}

export default function LoginVideo({ src, poster, className = '', preloadOnMount = false, children }: LoginVideoProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const loadVideo = () => {
    const v = videoRef.current;
    if (!v) return;

    // add webm fallback first (browser will ignore if unsupported)
    const mp4Source = v.querySelector('source[type="video/mp4"]') as HTMLSourceElement | null;
    const webmSource = v.querySelector('source[type="video/webm"]') as HTMLSourceElement | null;

    if (webmSource && !webmSource.src) {
      webmSource.src = src.replace(/\.mp4(\?.*)?$/i, '.webm');
    }

    if (mp4Source && !mp4Source.src) {
      mp4Source.src = src;
    }

    v.load();
    // play() may fail on some browsers unless muted
    const playPromise = v.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => {
        // ignore play errors
      });
    }

    const onCanPlay = () => setIsLoaded(true);
    v.addEventListener('canplay', onCanPlay, { once: true });
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !('IntersectionObserver' in window) || (typeof (window as any).preloadLoginVideoImmediately !== 'undefined' && (window as any).preloadLoginVideoImmediately)) {
      // If no IO support or global flag set, load immediately
      try {
        loadVideo();
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Video load error', err);
        setHasError(true);
      }
      return;
    }

    if (container && preloadOnMount) {
      try {
        loadVideo();
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Video load error', err);
        setHasError(true);
      }
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          try {
            loadVideo();
          } catch (err) {
            // eslint-disable-next-line no-console
            console.error('Video load error', err);
            setHasError(true);
          }
          observer.disconnect();
        }
      });
    });

    observer.observe(container);

    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, preloadOnMount]);

  if (hasError) {
    return (
      <div className="relative w-full h-80 md:h-96 rounded-2xl shadow-2xl bg-gradient-to-br from-slate-100 to-white flex items-center justify-center">
        <div className="text-center p-6">
          <p className="text-sm text-gray-600">Video failed to load — showing illustration instead</p>
          <div className="mt-4">
            {children ?? null}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`relative w-full h-56 md:h-96 ${className} overflow-visible`} aria-hidden>
      {/* Decorative gradient frame */}
      <div className="mx-auto w-full md:w-[420px] rounded-3xl p-1 bg-gradient-to-tr from-indigo-500/20 via-blue-400/15 to-transparent shadow-2xl">
        <div className="overflow-hidden rounded-2xl bg-black/5">
          {/* video element fills the container — no poster image used */}
          <video
            ref={videoRef}
            className="w-full h-56 md:h-96 object-cover block"
            muted
            loop
            playsInline
            autoPlay
            preload="auto"
            aria-hidden
            controls={false}
            controlsList="nodownload noplaybackrate noremoteplayback"
            disablePictureInPicture
            disableRemotePlayback
            onContextMenu={(e) => e.preventDefault()}
          >
            <source type="video/webm" />
            <source type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </div>

      {/* subtle loading overlay until canplay fires */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white/70 border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      )}
    </div>
  );
}
