'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as Popover from '@radix-ui/react-popover';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import { CheckIcon, ChevronDownIcon, SearchIcon, Loader2Icon } from 'lucide-react';
import { queryLocation } from '@/services/api/location';
import { LocationSuggestion } from '@/types/location';
import { Input } from './input';
import { useI18nContext } from '../locale-context';

interface AutoCompleteProps {
  label?: string;
  placeholder?: string;
  onLocationSelect: (location: LocationSuggestion | null) => void;
  initialValue?: string | null;
  disabled?: boolean;
  required?: boolean;
}

const AutoCompleteLocation: React.FC<AutoCompleteProps> = ({
  label,
  placeholder = "Search your location...",
  onLocationSelect,
  initialValue,
  disabled = false,
  required = false,
}) => {
  const [inputValue, setInputValue] = useState<string>(initialValue || '');
  const [filteredLocations, setFilteredLocations] = useState<LocationSuggestion[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<LocationSuggestion | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { locale, t } = useI18nContext();

  const debounce = <F extends (...args: any[]) => any>(func: F, waitFor: number) => {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    const debounced = (...args: Parameters<F>): Promise<ReturnType<F>> =>
      new Promise(resolve => {
        if (timeout) {
          clearTimeout(timeout);
        }
        timeout = setTimeout(() => resolve(func(...args)), waitFor);
      });
    return debounced;
  };

  // Fetch locations from your backend API
  const fetchLocationsAPI = async (query: string): Promise<LocationSuggestion[]> => {
    if (!query.trim()) {
      return []; // Return empty if query is empty, or fetch initial suggestions
    }
    setIsLoading(true);
    setError(null);
    try {
      // Replace with your actual API endpoint for location suggestions
      // Ensure your apiClient is configured to hit your backend
      const suggestions = await queryLocation("", query);
      return suggestions;
    } catch (err: any) {
      console.error("Failed to fetch location suggestions:", err);
      setError(err.message || "Could not fetch locations.");
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Memoize the debounced fetch function
  const debouncedFetchLocations = useCallback(debounce(fetchLocationsAPI, 600), [queryLocation]);

  useEffect(() => {
    if (initialValue) {
      setInputValue(initialValue);
      setSelectedLocation(null);
    } else {
      // If initialValue is explicitly null or undefined, clear the input
      setInputValue('');
      setSelectedLocation(null);
    }
  }, [initialValue]);


  useEffect(() => {
    // Don't fetch if the input value exactly matches the name of a selected location
    // This prevents refetching when a user clicks an item from the list.
    if (inputValue === selectedLocation?.name) {
      // If input is cleared after selection, maybe show initial list or nothing
      if (!inputValue) setFilteredLocations([]);
      return;
    }

    if (isOpen && inputValue.length > 0) { // Only fetch if popover is open and query has some length
      debouncedFetchLocations(inputValue).then(suggestions => {
        setFilteredLocations(suggestions as unknown as LocationSuggestion[]);
      });
    } else if (!inputValue && isOpen) {
      // Optionally fetch some default/recent locations when input is empty and popover is open
      // For now, just clear suggestions or show a "type to search" message
      setFilteredLocations([]);
    }
  }, [inputValue, isOpen, selectedLocation, debouncedFetchLocations]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setInputValue(value);
    if (selectedLocation && selectedLocation.name !== value) {
      setSelectedLocation(null); // Clear full selection if user types over it
      onLocationSelect(null);   // Notify parent
    }
    if (!isOpen && value) setIsOpen(true); // Open popover on type if there's value
    // if (!value) { // If input is cleared
    //   setFilteredLocations([]);
    //   setSelectedLocation(null);
    //   onLocationSelect(null);
    // }
  };

  const handleLocationSelect = (location: LocationSuggestion) => {
    setInputValue(location.name);
    setSelectedLocation(location);
    onLocationSelect(location);
    setIsOpen(false);
    setFilteredLocations([]);
  };

  return (
    <div className="w-full">
      {label && (
        <label htmlFor="location-autocomplete" className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
        <Popover.Anchor asChild>
          <div className="relative">
            <div className="absolute start-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none">
              {isLoading ? <Loader2Icon className="animate-spin" /> : <SearchIcon className="h-5 w-5" />}
            </div>
            <Input
              id="location-autocomplete"
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onClick={() => setIsOpen(true)}
              placeholder={placeholder}
              className="ps-10 pe-8 py"
              role="presentation"
              aria-controls="location-suggestions-list"
              autoComplete="off"
              required={required}
            />
            <Popover.Trigger asChild>
              <button
                type="button"
                className="absolute inset-y-0 end-0 flex items-center pe-2 text-gray-500 hover:text-gray-700 focus:outline-none disabled:opacity-50"
                onClick={() => setIsOpen(prev => !prev)} // Toggles popover
                disabled={disabled}
                aria-label={isOpen ? "Close suggestions" : "Open suggestions"}
              >
                <ChevronDownIcon className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>
            </Popover.Trigger>
          </div>
        </Popover.Anchor>

        <Popover.Portal>
          <Popover.Content
            className="z-50 w-[--radix-popover-trigger-width] mt-1 bg-white border border-gray-200 rounded-md shadow-lg"
            sideOffset={5}
            align="start"
            onOpenAutoFocus={(e) => e.preventDefault()} // Keep focus on input
            onCloseAutoFocus={(e) => {
              e.preventDefault();
              inputRef.current?.focus();
            }}
          >
            <ScrollArea.Root className="max-h-60 overflow-hidden">
              <ScrollArea.Viewport id="location-suggestions-list" className="p-1" role="listbox" dir={locale === "he" ? "rtl" : "ltr"}>
                {isLoading && filteredLocations.length === 0 && ( // Show loading only if no results yet
                  <div className="px-3 py-2 text-sm text-gray-500 text-center">{t("locationFilter.loadingSuggestions")}</div>
                )}
                {error && (
                  <div className="px-3 py-2 text-sm text-red-600">{error}</div>
                )}
                {!isLoading && !error && filteredLocations.length > 0 && (
                  filteredLocations.map((location) => (
                    <div
                      key={location.id}
                      role="option"
                      aria-selected={selectedLocation?.id === location.id}
                      className={`px-3 py-2 text-sm text-gray-700 rounded-md cursor-pointer hover:bg-blue-500 hover:text-white focus:bg-blue-500 focus:text-white focus:outline-none
                        ${selectedLocation?.id === location.id ? 'bg-blue-500 text-white' : ''}`}
                      onClick={() => handleLocationSelect(location)}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleLocationSelect(location); } }}
                      tabIndex={0}
                    >
                      <div className="flex items-center justify-between">
                        <span>{location.name}</span>
                        {selectedLocation?.id === location.id && <CheckIcon className="h-4 w-4" />}
                      </div>
                    </div>
                  ))
                )}
                {!isLoading && !error && filteredLocations.length === 0 && inputValue && (
                  <div className="px-3 py-2 text-sm text-gray-500">{t("locationFilter.notFound")} {`"${inputValue}"`}.</div>
                )}
                {!isLoading && !error && filteredLocations.length === 0 && !inputValue && (
                  <div className="px-3 py-2 text-sm text-gray-500">{t("locationFilter.typeToSearch")}</div>
                )}
              </ScrollArea.Viewport>
              <ScrollArea.Scrollbar orientation="vertical" className="flex select-none touch-none p-0.5 bg-gray-100 transition-colors duration-200 ease-out hover:bg-gray-200 data-[orientation=vertical]:w-2.5">
                <ScrollArea.Thumb className="flex-1 bg-gray-400 rounded-[10px] relative before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-full before:h-full before:min-w-[44px] before:min-h-[44px]" />
              </ScrollArea.Scrollbar>
            </ScrollArea.Root>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
};

export default AutoCompleteLocation;