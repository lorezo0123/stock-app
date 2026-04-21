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

    const handleDetected = async (decodedText: string, scanner: any) => {
      if (cancelled) return;

      const cleanCode = decodedText.trim();

      try {
        await scanner.stop();
      } catch {
        // ignore
      }

      if (
        cleanCode.startsWith("http://") ||
        cleanCode.startsWith("https://") ||
        cleanCode.startsWith("www.")
      ) {
        setError("This is a website QR code, not a product barcode.");
        return;
      }

      if (!/^[A-Za-z0-9\-./]+$/.test(cleanCode)) {
        setError("Invalid barcode format.");
        return;
      }

      onDetected(cleanCode);
    };

    async function startScanner() {
      try {
        if (typeof window === "undefined") return;

        const { Html5Qrcode, Html5QrcodeSupportedFormats } = await import("html5-qrcode");

        if (cancelled) return;

        const scanner = new Html5Qrcode(elementIdRef.current, {
          formatsToSupport: [
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.CODE_39,
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.UPC_E,
          ],
          verbose: false,
        });

        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: { exact: "environment" } },
          {
            fps: 10,
            qrbox: { width: 280, height: 180 },
            aspectRatio: 1.777778,
          },
          async (decodedText: string) => {
            await handleDetected(decodedText, scanner);
          },
          () => {}
        );
      } catch (err) {
        console.error(err);

        try {
          const { Html5Qrcode, Html5QrcodeSupportedFormats } = await import("html5-qrcode");

          if (cancelled) return;

          const scanner = new Html5Qrcode(elementIdRef.current, {
            formatsToSupport: [
              Html5QrcodeSupportedFormats.CODE_128,
              Html5QrcodeSupportedFormats.CODE_39,
              Html5QrcodeSupportedFormats.EAN_13,
              Html5QrcodeSupportedFormats.EAN_8,
              Html5QrcodeSupportedFormats.UPC_A,
              Html5QrcodeSupportedFormats.UPC_E,
            ],
            verbose: false,
          });

          scannerRef.current = scanner;

          await scanner.start(
            { facingMode: "environment" },
            {
              fps: 10,
              qrbox: { width: 280, height: 180 },
              aspectRatio: 1.777778,
            },
            async (decodedText: string) => {
              await handleDetected(decodedText, scanner);
            },
            () => {}
          );
        } catch (fallbackErr) {
          console.error(fallbackErr);
          if (!cancelled) {
            setError("Scanner could not detect barcode. Please allow camera and try again.");
          }
        }
      }
    }

    startScanner();

    return () => {
      cancelled = true;
      const scanner = scannerRef.current;
      if (scanner) {
        scanner.stop().catch(() => {});
        scannerRef.current = null;
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
          <div id={elementIdRef.current} className="w-full" />
          <p className="text-xs text-slate-500">
            Hold the barcode steady and fill the box.
          </p>
        </>
      )}
    </div>
  );
}