// pages/_app.tsx
import type { AppProps } from "next/app";
import { useEffect } from "react";
import "../styles/globals.css"; // keep if you have tailwind/global styles

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      // register after page load so it doesn’t block TTI
      const onLoad = () => navigator.serviceWorker.register("/sw.js").catch(() => {});
      window.addEventListener("load", onLoad);
      return () => window.removeEventListener("load", onLoad);
    }
  }, []);

  return <Component {...pageProps} />;
}
