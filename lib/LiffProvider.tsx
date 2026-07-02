"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import liff from "@line/liff";

export interface LiffContextType {
  liff: typeof liff | null;
  liffError: string | null;
  isReady: boolean;
  profile: {
    userId: string;
    displayName: string;
    pictureUrl?: string;
  } | null;
}

const LiffContext = createContext<LiffContextType>({
  liff: null,
  liffError: null,
  isReady: false,
  profile: null,
});

export const useLiff = () => useContext(LiffContext);

export function LiffProvider({
  children,
  liffId,
}: {
  children: React.ReactNode;
  liffId: string;
}) {
  const [liffObject, setLiffObject] = useState<typeof liff | null>(null);
  const [liffError, setLiffError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [profile, setProfile] = useState<LiffContextType["profile"]>(null);

  useEffect(() => {
    liff
      .init({ liffId })
      .then(() => {
        setLiffObject(liff);
        if (liff.isLoggedIn()) {
          liff
            .getProfile()
            .then((p) => {
              setProfile({
                userId: p.userId,
                displayName: p.displayName,
                pictureUrl: p.pictureUrl,
              });
              setIsReady(true);
            })
            .catch((err) => {
              setLiffError(err.toString());
              setIsReady(true);
            });
        } else {
          liff.login();
        }
      })
      .catch((err: Error) => {
        setLiffError(err.toString());
        setIsReady(true);
      });
  }, [liffId]);

  return (
    <LiffContext.Provider
      value={{ liff: liffObject, liffError, isReady, profile }}
    >
      {children}
    </LiffContext.Provider>
  );
}
