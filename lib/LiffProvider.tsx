"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import liff from "@line/liff";
import { N8N_API_URL } from "./config";

export interface LiffContextType {
  liff: typeof liff | null;
  liffError: string | null;
  isReady: boolean;
  profile: {
    userId: string;
    displayName: string;
    pictureUrl?: string;
    goldBalance?: number;
    isNewUser?: boolean;
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
            .then(async (p) => {
              try {
                // Register user if not exists
                await fetch(N8N_API_URL + '/register', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ 
                    action: 'register',
                    userId: p.userId, 
                    displayName: liff.getDecodedIDToken()?.name || p.displayName 
                  })
                });
                
                // Fetch user profile (includes goldBalance)
                const res = await fetch(N8N_API_URL + '/profile', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ action: 'profile', userId: p.userId })
                });
                
                if (res.ok) {
                  const data = await res.json();
                  setProfile({
                    userId: p.userId,
                    displayName: p.displayName,
                    pictureUrl: p.pictureUrl,
                    goldBalance: data.goldBalance || 0,
                    isNewUser: data.isNewUser || false,
                  });
                } else {
                  // Fallback if API fails
                  setProfile({
                    userId: p.userId,
                    displayName: p.displayName,
                    pictureUrl: p.pictureUrl,
                    goldBalance: 0,
                  });
                }
              } catch (apiErr) {
                console.error("API Error:", apiErr);
                setProfile({
                  userId: p.userId,
                  displayName: p.displayName,
                  pictureUrl: p.pictureUrl,
                  goldBalance: 0,
                });
              }
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
