"use client";

import { useEffect } from "react";
import { useNavContext } from "@/context/NavContext";

/**
 * NavSlot allows any page to "teleport" content into the global Navigation component's children slot.
 * Usage: <NavSlot> <button>Page Action</button> </NavSlot>
 */
export default function NavSlot({ children }) {
  const { setNavContent } = useNavContext();

  useEffect(() => {
    setNavContent(children);
    return () => setNavContent(null);
  }, [children, setNavContent]);

  return null;
}
