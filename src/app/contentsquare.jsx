"use client";

import { useEffect } from "react";
import { injectContentsquareScript } from "@contentsquare/tag-sdk";

export function Contentsquare() {
  useEffect(() => {
    const tagId = process.env.NEXT_PUBLIC_CONTENTSQUARE_TAG_ID || "40b32afe97cc1";
    if (tagId) {
      injectContentsquareScript({ clientId: tagId });
    }
  }, []);

  return null;
}
