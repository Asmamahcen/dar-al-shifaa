"use client";

import { useEffect } from "react";
import { useAppStore } from "@/lib/store";

export function StoreInitializer() {
  const fetchInitialData = useAppStore((state) => state.fetchInitialData);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  return null;
}
