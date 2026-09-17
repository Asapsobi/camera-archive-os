import { useEffect } from "react";
import { products } from "../data/products";
import { useLauncher } from "./useLauncher";

const KNOWN = new Set(["", "0017", "classified", "old-index"]);

export function useSecretHash() {
  const launch = useLauncher();

  useEffect(() => {
    function handle() {
      const hash = window.location.hash.replace(/^#\/?/, "").toLowerCase();
      if (!hash) return;

      if (hash === "0017") {
        const p = products.find((x) => x.serial?.toLowerCase().endsWith("0017"));
        if (p) launch("product", { productId: p.id });
        return;
      }
      if (hash === "classified") {
        const p = products.find((x) => x.status === "CLASSIFIED");
        if (p) launch("product", { productId: p.id });
        return;
      }
      if (hash === "old-index") {
        launch("recyclebin");
        return;
      }
      if (!KNOWN.has(hash)) {
        launch("error404");
      }
    }

    handle();
    window.addEventListener("hashchange", handle);
    return () => window.removeEventListener("hashchange", handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
