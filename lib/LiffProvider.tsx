"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import liff from "@line/liff";
import { N8N_API_URL, N8N_USAGE_URL } from "./config";

export interface UsageState {
  isFree?: boolean;
  freeRemaining?: number;
  overviewPrice?: number;
  questionPrice?: number;
  interactivePrice?: number;
  sevenDaysPrice?: number;
  [key: string]: any;
}

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
  usageState: UsageState | null;
}

const LiffContext = createContext<LiffContextType>({
  liff: null,
  liffError: null,
  isReady: false,
  profile: null,
  usageState: null,
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
  const [usageState, setUsageState] = useState<UsageState | null>(null);

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
                // Run all fetches concurrently to speed up startup
                const [registerRes, profileRes, usageRes] = await Promise.allSettled([
                  // 1. Register
                  fetch(N8N_API_URL + '/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                      action: 'register',
                      userId: p.userId, 
                      displayName: liff.getDecodedIDToken()?.name || p.displayName 
                    })
                  }),
                  // 2. Profile
                  fetch(N8N_API_URL + '/profile', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'profile', userId: p.userId })
                  }),
                  // 3. Usage
                  fetch(N8N_USAGE_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: p.userId, mode: 'check' })
                  })
                ]);

                // Handle Profile
                let userProfile = { userId: p.userId, displayName: p.displayName, pictureUrl: p.pictureUrl, goldBalance: 0, isNewUser: false };
                if (profileRes.status === 'fulfilled' && profileRes.value.ok) {
                  const data = await profileRes.value.json();
                  userProfile.goldBalance = data.goldBalance || 0;
                  userProfile.isNewUser = data.isNewUser || false;
                }
                setProfile(userProfile);

                // Handle Usage
                let currentUsage: UsageState = {
                  isFree: true, freeRemaining: 5,
                  overviewPrice: 15, questionPrice: 2,
                  interactivePrice: 4, sevenDaysPrice: 5
                };
                if (usageRes.status === 'fulfilled' && usageRes.value.ok) {
                  const data = await usageRes.value.json();
                  currentUsage = { ...currentUsage, ...data };
                }
                setUsageState(currentUsage);
              } catch (apiErr) {
                console.error("API Error:", apiErr);
                setProfile({
                  userId: p.userId,
                  displayName: p.displayName,
                  pictureUrl: p.pictureUrl,
                  goldBalance: 0,
                });
                setUsageState({
                  isFree: true, freeRemaining: 5,
                  overviewPrice: 15, questionPrice: 2,
                  interactivePrice: 4, sevenDaysPrice: 5
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
      value={{ liff: liffObject, liffError, isReady, profile, usageState }}
    >
      {children}
    </LiffContext.Provider>
  );
}
