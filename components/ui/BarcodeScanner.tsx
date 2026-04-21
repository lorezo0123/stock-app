"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

type BarcodeScannerProps = {
  onDetected: (code: string) => void;
  onClose: () => void;
};

export default function BarcodeScanner({
  onDetected,
  onClose,
}: BarcodeScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const scanner = new Html5Qrcode("reader");
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 120 },
        },
        async (decodedText) => {
          const clean = decodedText.trim();

          // 🔒 BLOCK URL QR
          if (clean.includes("http") || clean.includes("www")) {
            return;
          }

          try {
            await scanner.stop();
          } catch {}

          onDetected(clean);
        },
        () => {}
      )
      .catch(() => {
        setError("Camera error. Please allow permission.");
      });

    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(() => {});
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
        <div id="reader" className="w-full" />
      )}
    </div>
  );
}