'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit, doc, setDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { useToast } from './use-toast';

export type HistoryItem = {
  id: string;
  tool: string;
  timestamp: string;
  data: {
    originalImage?: string;
    enhancedImage?: string;
    compressedImage?: string;
    convertedImage?: string;
    originalSize?: number;
    compressedSize?: number;
    inputText?: string;
    humanizedText?: string;
    qrCodeText?: string;
    qrCodeImage?: string;
    originalFormat?: string;
    targetFormat?: string;
    videoFileName?: string;
    videoFileSize?: number;
    extractedAudio?: string;
    fileType?: string;
    // New fields
    playlistName?: string;
    songs?: any[];
    passwordLength?: number;
    details?: string;
  };
};

const HISTORY_STORAGE_KEY = 'tool-daddy-history';
// Set a reasonable size limit for what can be stored in history (e.g., 2MB)
const MAX_ITEM_SIZE_BYTES = 2 * 1024 * 1024;


import { useSettings } from '@/components/settings-provider';

export function useHistory() {
  const { user, isUserLoading: isAuthLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const { settings } = useSettings();
  const [localHistory, setLocalHistory] = useState<HistoryItem[]>([]);
  const [isLocalLoaded, setIsLocalLoaded] = useState(false);

  // Firestore path
  const historyCollectionPath = useMemo(() => {
    if (!user || user.isAnonymous || !firestore) return null;
    return collection(firestore, 'users', user.uid, 'history');
  }, [firestore, user]);

  // Firestore query
  const historyQuery = useMemoFirebase(() => {
    if (!historyCollectionPath) return null;
    return query(historyCollectionPath, orderBy('timestamp', 'desc'), limit(20));
  }, [historyCollectionPath]);

  // Real-time Cloud History
  const { data: cloudHistory, isLoading: isCloudLoading } = useCollection<HistoryItem>(historyQuery);

  // Load from LocalStorage (initial load)
  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (storedHistory) {
        setLocalHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error('Failed to load history from localStorage', error);
    } finally {
      setIsLocalLoaded(true);
    }
  }, []);

  // Sync Local to Cloud on login
  useEffect(() => {
    // Only sync if dataPersistence is enabled
    if (user && !user.isAnonymous && isLocalLoaded && localHistory.length > 0 && historyCollectionPath && settings.dataPersistence) {
      const mergeHistory = async () => {
        try {
          const batch = writeBatch(firestore);
          localHistory.forEach((item) => {
            const docRef = doc(historyCollectionPath, item.id);
            batch.set(docRef, item);
          });
          await batch.commit();
          // Clear local after successful merge
          setLocalHistory([]);
          localStorage.removeItem(HISTORY_STORAGE_KEY);
          toast({ title: "History synced!", description: "Your guest history has been moved to your account." });
        } catch (e) {
          console.error("Failed to merge history to cloud", e);
        }
      };
      mergeHistory();
    }
  }, [user, isLocalLoaded, firestore, historyCollectionPath, toast, settings.dataPersistence]); // Dependency array careful here

  const addToHistory = useCallback(async (item: Omit<HistoryItem, 'id' | 'timestamp'>) => {
    try {
      const newItem: HistoryItem = {
        ...item,
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
      };

      // Sanitize item
      if (newItem.data.originalImage && newItem.data.originalImage.length > MAX_ITEM_SIZE_BYTES) delete newItem.data.originalImage;
      if (newItem.data.enhancedImage && newItem.data.enhancedImage.length > MAX_ITEM_SIZE_BYTES) delete newItem.data.enhancedImage;
      if (newItem.data.compressedImage && newItem.data.compressedImage.length > MAX_ITEM_SIZE_BYTES) delete newItem.data.compressedImage;
      if (newItem.data.convertedImage && newItem.data.convertedImage.length > MAX_ITEM_SIZE_BYTES) delete newItem.data.convertedImage;

      if (newItem.tool.toLowerCase().includes('video')) {
        delete newItem.data.extractedAudio;
      }

      // Save to Cloud if logged in AND persistence is enabled
      if (user && !user.isAnonymous && historyCollectionPath && settings.dataPersistence) {
        const docRef = doc(historyCollectionPath, newItem.id);
        await setDoc(docRef, newItem);
      } else {
        // Save to Local (Guest mode OR Persistence disabled)
        const updatedHistory = [newItem, ...localHistory].slice(0, 20);
        setLocalHistory(updatedHistory);
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory));
      }
    } catch (error) {
      console.error('Failed to save history', error);
    }
  }, [user, historyCollectionPath, localHistory, settings.dataPersistence]);

  const clearHistory = useCallback(async () => {
    try {
      if (user && !user.isAnonymous && historyCollectionPath && cloudHistory) {
        const batch = writeBatch(firestore);
        cloudHistory.forEach(item => {
          batch.delete(doc(historyCollectionPath, item.id));
        });
        await batch.commit();
      } else {
        setLocalHistory([]);
        localStorage.removeItem(HISTORY_STORAGE_KEY);
      }
      toast({ title: "History cleared" });
    } catch (error) {
      console.error('Failed to clear history', error);
    }
  }, [user, firestore, historyCollectionPath, cloudHistory, toast]);

  // Combine results: Cloud if logged in, otherwise local
  const history = useMemo(() => {
    if (user && !user.isAnonymous) return cloudHistory || [];
    return localHistory;
  }, [user, cloudHistory, localHistory]);

  const isLoaded = isLocalLoaded && !isAuthLoading && (!user || user.isAnonymous || !isCloudLoading);

  return { history, isLoaded, addToHistory, clearHistory };
}
