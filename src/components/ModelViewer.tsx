"use client";

import { useEffect, useState, type DetailedHTMLProps, type HTMLAttributes } from "react";

declare module "react" {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & Record<string, unknown>;
    }
  }
}

/**
 * 3D preview + "View on your table" AR. Scene Viewer on Android, Quick Look on
 * iOS (model-viewer converts the .glb to USDZ on the fly), WebXR where available.
 */
export function ModelViewer({ src, alt }: { src: string; alt: string }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    import("@google/model-viewer").then(() => setReady(true));
  }, []);

  return (
    <div className="on-pastel relative aspect-square w-full overflow-hidden ink bg-sora">
      <div className="seigaiha absolute inset-x-0 bottom-0 h-16 opacity-70" aria-hidden />
      {ready ? (
        <model-viewer
          src={src}
          alt={alt}
          ar=""
          ar-modes="webxr scene-viewer quick-look"
          ar-scale="auto"
          camera-controls=""
          auto-rotate=""
          auto-rotate-delay="0"
          rotation-per-second="18deg"
          shadow-intensity="1"
          shadow-softness="0.8"
          exposure="1.05"
          camera-orbit="30deg 74deg auto"
          field-of-view="32deg"
          interaction-prompt="none"
          style={{ width: "100%", height: "100%", background: "transparent" }}
        >
          <button
            slot="ar-button"
            className="press absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full border-[1.5px] border-[#2b2522] bg-[#2b2522] px-5 py-3 font-bold text-[#f6efe3] shadow-[3px_3px_0_#b8452c]"
          >
            View on your table
          </button>
        </model-viewer>
      ) : (
        <div className="grid h-full place-items-center text-sm">Loading 3D…</div>
      )}
      <span className="eyebrow absolute top-3 left-4">Drag to turn · 3D</span>
    </div>
  );
}
