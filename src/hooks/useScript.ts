import { useEffect, useState } from "react";

export type ScriptStatus = "idle" | "loading" | "ready" | "error";

// Dynamically loads an external script once and reports its load status.
// Replaces the old react-dependent-script dependency.
export function useScript(src: string): ScriptStatus {
  const [status, setStatus] = useState<ScriptStatus>(src ? "loading" : "idle");

  useEffect(() => {
    if (!src) {
      setStatus("idle");
      return;
    }

    let script = document.querySelector<HTMLScriptElement>(
      `script[src="${src}"]`,
    );

    if (script) {
      setStatus((script.dataset.status as ScriptStatus) ?? "ready");
    } else {
      script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.dataset.status = "loading";
      document.body.appendChild(script);
    }

    const setFromEvent = (event: Event) => {
      const newStatus = event.type === "load" ? "ready" : "error";
      script?.setAttribute("data-status", newStatus);
      setStatus(newStatus);
    };

    script.addEventListener("load", setFromEvent);
    script.addEventListener("error", setFromEvent);

    return () => {
      script?.removeEventListener("load", setFromEvent);
      script?.removeEventListener("error", setFromEvent);
    };
  }, [src]);

  return status;
}
