"use client";
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <html lang="en"><body style={{ fontFamily: "system-ui", padding: "3rem", maxWidth: "40rem", margin: "auto" }}>
    <h1>PolicyPulse is temporarily unavailable</h1>
    <p>We couldn’t start the application. Please retry or return later.</p>
    <button onClick={reset}>Try again</button>
  </body></html>;
}
