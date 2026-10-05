"use client";

import { useState, useEffect, useCallback } from "react";
import {
  executeRecaptcha as runRecaptcha,
  loadRecaptchaScript,
  getRecaptchaSiteKey,
} from "@/lib/recaptcha-client";

export function useRecaptchaV3() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const siteKey = getRecaptchaSiteKey();
    if (!siteKey) return;

    let isMounted = true;
    loadRecaptchaScript()
      .then((loaded) => {
        if (isMounted && loaded) {
          setIsReady(true);
        }
      })
      .catch(() => {
        if (isMounted) {
          setIsReady(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const executeRecaptcha = useCallback(
    async (action: string): Promise<string | null> => {
      return runRecaptcha(action);
    },
    [],
  );

  return {
    executeRecaptcha,
    isReady,
  };
}
