"use client";

import { useEffect, useRef, useState } from "react";

type BarcodeScannerProps = {
  onDetected: (code: string) => void;
  onClose: () => void;
};

export default function BarcodeScanner({
  onDetected,
  onClose,
}: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let stopped = false;

    async function startScanner() {
      try {
        if (typeof window === "undefined") return;

        const BarcodeDetectorClass = (window as any).BarcodeDetector;

        if (!BarcodeDetectorClass) {
          setError("This browser does not support this barcode scanner. Please use Chrome on Android.");
          return;
        }

        const detector = new BarcodeDetectorClass({
          formats: ["ean_13", "ean_8", "upc_a", "upc_e", "code_128", "code_39"],
        });

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "environment" },
          },
          audio: false,
        });

        if (stopped) {
          stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
          return;
        }

        streamRef.current = stream;

        const video = videoRef.current;
        if (!video) return;

        video.srcObject = stream;
        await video.play();

        const scan = async () => {
          if (stopped || !videoRef.current) return;

          try {
            const barcodes = await detector.detect(videoRef.current);

            if (barcodes.length > 0) {
              const rawValue = (barcodes[0].rawValue || "").trim();

              if (rawValue) {
                if (animationRef.current) {
                  cancelAnimationFrame(animationRef.current);
                }

                if (streamRef.current) {
                  streamRef.current.getTracks().forEach((track) => track.stop());
                  streamRef.current = null;
                }

                onDetected(rawValue);
                return;
              }
            }
          } catch {
            // ignore frame read errors
          }

          animationRef.current = requestAnimationFrame(scan);
        };

        animationRef.current = requestAnimationFrame(scan);
      } catch (err) {
        console.error(err);
        setError("Camera error. Please allow permission and try again.");
      }
    }

    startScanner();

    return () => {
      stopped = true;

      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [onDetected]);

  return (
    <div className="space-y-2 rounded-md border bg-white p-3">
      <div className="flex items-center justify-between">
        <p className="font-semibold">Scan Barcode</p>
        <button
          type="button"
          onClick={onClose}
          className="rounded border px-3 py-1 text-sm hover:bg-slate-100"
        >
          Close
        </button>
      </div>

      {error ? (
        <p className="text-sm text-red-500">{error}</p>
      ) : (
        <>
          <video
            ref={videoRef}
            className="w-full rounded-md bg-black"
            playsInline
            muted
            autoPlay
          />
          <p className="text-xs text-slate-500">
            Scan product barcode only.
          </p>
        </>
      )}
    </div>
  );
}