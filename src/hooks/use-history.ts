'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useUser } from '@/firebase';
import { useToast } from './use-toast';
import { safeUUID } from '@/lib/utils';

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
  const { isUserLoading: isAuthLoading } = useUser();
  const { toast } = useToast();
  const [localHistory, setLocalHistory] = useState<HistoryItem[]>([]);
  const [isLocalLoaded, setIsLocalLoaded] = useState(false);

  const isCloudLoading = false;
  const cloudHistory: any[] = [];

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


  const addToHistory = useCallback(async (item: Omit<HistoryItem, 'id' | 'timestamp'>) => {
    try {
      const newItem: HistoryItem = {
        ...item,
        id: safeUUID(),
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

      // Save to Local (Now exclusively)
      const updatedHistory = [newItem, ...localHistory].slice(0, 20);
      setLocalHistory(updatedHistory);
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Failed to save history', error);
    }
  }, [localHistory]);

  const clearHistory = useCallback(async () => {
    try {
      setLocalHistory([]);
      localStorage.removeItem(HISTORY_STORAGE_KEY);
      toast({ title: "History cleared" });
    } catch (error) {
      console.error('Failed to clear history', error);
    }
  }, [toast]);

  // Combine results: Cloud if logged in, otherwise local
  const history = localHistory;

  const isLoaded = isLocalLoaded && !isAuthLoading;

  return { history, isLoaded, addToHistory, clearHistory };
}
