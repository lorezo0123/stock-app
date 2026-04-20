"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

export default function BarcodeScanner({
  onDetected,
  onClose,
}: {
  onDetected: (code: string) => void;
  onClose: () => void;
}) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const scanner = new Html5Qrcode("reader");
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        (decodedText) => {
          onDetected(decodedText);
        }
      )
      .catch(() => {
        setError("Camera error. Please allow permission.");
      });

    return () => {
      scanner.stop().catch(() => {});
    };
  }, []);

  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <p className="font-semibold">Scan Barcode</p>
        <button onClick={onClose}>Close</button>
      </div>

      {error ? (
        <p className="text-red-500 text-sm">{error}</p>
      ) : (
        <div id="reader" className="w-full" />
      )}
    </div>
  );
}