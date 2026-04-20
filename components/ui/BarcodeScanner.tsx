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
  const scannerRef = useRef<any>(null);
  const elementIdRef = useRef(`reader-${Math.random().toString(36).slice(2)}`);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function startScanner() {
      try {
        if (typeof window === "undefined") return;

        const { Html5Qrcode } = await import("html5-qrcode");

        if (cancelled) return;

        const scanner = new Html5Qrcode(elementIdRef.current);
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 120 },
          },
          async (decodedText: string) => {
            if (cancelled) return;

            try {
              await scanner.stop();
            } catch {
              // ignore stop errors
            }

            onDetected(decodedText);
          },
          () => {
            // ignore scan errors while scanning
          }
        );
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setError("Camera error. Please allow permission.");
        }
      }
    }

    startScanner();

    return () => {
      cancelled = true;

      const scanner = scannerRef.current;
      if (scanner) {
        scanner
          .stop()
          .catch(() => {})
          .finally(() => {
            scannerRef.current = null;
          });
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
        <div id={elementIdRef.current} className="w-full" />
      )}
    </div>
  );
}