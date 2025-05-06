import { useState, useCallback } from "react";
import { createStore } from "zustand/vanilla";
import { useStore as useZustandStore } from "zustand";
import { Marketplace, Product } from "@/types";

interface EnhancerStore {
  uploadedFile: File | null;
  setUploadedFile: (file: File | null) => void;
  
  selectedMarketplace: Marketplace | null;
  setSelectedMarketplace: (marketplace: Marketplace | null) => void;
  
  productData: Product[];
  setProductData: (data: Product[]) => void;
  
  enhancedData: Product[];
  setEnhancedData: (data: Product[]) => void;
  
  resetStore: () => void;
}

const initialState = {
  uploadedFile: null,
  selectedMarketplace: null,
  productData: [],
  enhancedData: []
};

const createEnhancerStore = () => {
  return createStore<EnhancerStore>()((set) => ({
    ...initialState,
    
    setUploadedFile: (file) => set({ uploadedFile: file }),
    
    setSelectedMarketplace: (marketplace) => set({ selectedMarketplace: marketplace }),
    
    productData: [],
    setProductData: (data) => set({ productData: data }),
    
    enhancedData: [],
    setEnhancedData: (data) => set({ enhancedData: data }),
    
    resetStore: () => set(initialState)
  }));
};

// Create the store
const enhancerStore = createEnhancerStore();

// Create a hook for accessing the store from components
export const useStore = () => useZustandStore(enhancerStore);

export default enhancerStore;
