import React, { useState, useEffect, useRef } from 'react';

export interface DinasItem {
  id: number;
  nama: string;
  singkatan: string;
  nomor_telepon?: string;
}

interface SearchableDinasSelectProps {
  dinasList: DinasItem[];
  value: string;
  onChange: (dinasId: string, selectedDinas?: DinasItem) => void;
  placeholder?: string;
  error?: boolean;
}

export default function SearchableDinasSelect({
  dinasList,
  value,
  onChange,
  placeholder = '-- Pilih Dinas Tujuan --',
  error = false,
}: SearchableDinasSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearch('');
    }
  }, [isOpen]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Escape key listener
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const selectedDinas = dinasList.find(d => d.id.toString() === value);

  const filteredDinas = dinasList.filter(d =>
    d.nama.toLowerCase().includes(search.toLowerCase()) ||
    d.singkatan.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (idStr: string, dinasObj?: DinasItem) => {
    onChange(idStr, dinasObj);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative', width: '100%' }}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          padding: '10px 14px',
          minHeight: '42px',
          borderRadius: '8px',
          border: error ? '1.5px solid #EF4444' : '1px solid #CBD5E1',
          background: '#FFFFFF',
          fontSize: '13.5px',
          fontFamily: 'inherit',
          color: selectedDinas ? '#0F172A' : '#94A3B8',
          textAlign: 'left',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          outline: 'none',
          boxShadow: isOpen ? '0 0 0 3px rgba(0, 40, 179, 0.15)' : 'none',
          borderColor: isOpen ? '#0028B3' : (error ? '#EF4444' : '#CBD5E1'),
          transition: 'all 0.2s ease',
        }}
      >
        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: selectedDinas ? '600' : 'normal' }}>
          {selectedDinas ? `${selectedDinas.nama} (${selectedDinas.singkatan})` : placeholder}
        </span>
        <svg
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="none"
          stroke="#64748B"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
            flexShrink: 0,
            marginLeft: '8px'
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            zIndex: 999,
            background: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 10px 25px -5px rgba(0, 17, 120, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
            overflow: 'hidden',
            animation: 'fadeIn 0.15s ease-out',
          }}
        >
          {/* Search Box */}
          <div
            style={{
              padding: '10px 12px',
              borderBottom: '1px solid #F1F5F9',
              background: '#F8FAFC',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama atau singkatan dinas..."
              style={{
                width: '100%',
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: '13px',
                color: '#0F172A',
                fontFamily: 'inherit',
              }}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                style={{
                  border: 'none',
                  background: 'none',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  fontSize: '14px',
                  padding: '2px 4px',
                }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Options List */}
          <div style={{ maxHeight: '220px', overflowY: 'auto', padding: '4px 0' }}>
            {/* Default empty option */}
            <div
              onClick={() => handleSelect('', undefined)}
              style={{
                padding: '9px 14px',
                fontSize: '13px',
                color: value === '' ? '#0028B3' : '#64748B',
                background: value === '' ? '#EFF6FF' : 'transparent',
                fontWeight: value === '' ? '700' : 'normal',
                cursor: 'pointer',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => {
                if (value !== '') e.currentTarget.style.background = '#F8FAFC';
              }}
              onMouseLeave={(e) => {
                if (value !== '') e.currentTarget.style.background = 'transparent';
              }}
            >
              {placeholder}
            </div>

            {filteredDinas.length === 0 ? (
              <div style={{ padding: '16px', textAlign: 'center', fontSize: '12.5px', color: '#94A3B8' }}>
                Dinas tidak ditemukan
              </div>
            ) : (
              filteredDinas.map((d) => {
                const isSelected = value === d.id.toString();
                return (
                  <div
                    key={d.id}
                    onClick={() => handleSelect(d.id.toString(), d)}
                    style={{
                      padding: '9px 14px',
                      fontSize: '13px',
                      color: isSelected ? '#0028B3' : '#0F172A',
                      background: isSelected ? '#EFF6FF' : 'transparent',
                      fontWeight: isSelected ? '700' : '500',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '8px',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.background = '#F8FAFC';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>{d.nama}</span>
                      <span style={{ fontSize: '11px', color: isSelected ? '#0028B3' : '#64748B', background: isSelected ? '#DBEAFE' : '#F1F5F9', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>
                        {d.singkatan}
                      </span>
                    </div>
                    {isSelected && (
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#0028B3" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
