import React, { useState, useEffect } from 'react';
import { Search, Lock, Key, CheckCircle } from 'lucide-react';

export default function WebEngine() {
  const [token, setToken] = useState('');
  const [vault, setVault] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(30);

  const searchToken = async () => {
    setLoading(true);
    const res = await fetch(`/api/vault/query?token=${token}`);
    const data = await res.json();
    setVault(data);
    setLoading(false);
  };

  const startVerification = () => {
    setLoading(true);
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setLoading(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-8">The Briefcase Engine</h1>
      
      <div className="flex gap-2 mb-12">
        <input 
          className="bg-slate-800 p-3 rounded border border-slate-700 uppercase" 
          placeholder="ENTER TOKEN (e.g. XF79R2)" 
          onChange={(e) => setToken(e.target.value)}
        />
        <button onClick={searchToken} className="bg-blue-600 p-3 rounded flex items-center gap-2">
          <Search size={20} /> Search
        </button>
      </div>

      {vault && (
        <div className="max-w-md w-full bg-slate-800 p-6 rounded-xl border border-blue-500/30">
          <div className="flex justify-between mb-4">
            <span className="text-slate-400">Status:</span>
            <span className="font-mono text-blue-400">{vault.payment_status}</span>
          </div>
          
          {vault.payment_status === 'pending' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-700 rounded">
                <p className="text-sm mb-2">Funding Required</p>
                <p className="text-xl font-bold">${vault.amount || '0.00'} + 5% Fee</p>
                <button 
                  onClick={startVerification}
                  className="w-full mt-4 bg-green-600 p-2 rounded font-bold"
                >
                  Verify Payment
                </button>
              </div>
            </div>
          )}

          {loading && (
            <div className="text-center p-6 animate-pulse">
              <p className="text-yellow-400 font-mono mb-2">DECRYPTION MATRIX INITIALIZING...</p>
              <p className="text-4xl font-bold">{Math.random().toString(36).substring(2, 15).toUpperCase()}</p>
              <p className="mt-4">Verification in {timer}s</p>
            </div>
          )}

          {vault.payment_status === 'funded' && (
            <div className="text-center p-6 border-2 border-green-500 rounded">
              <CheckCircle className="mx-auto mb-2 text-green-500" size={48} />
              <h2 className="text-2xl font-bold mb-4">Access Keys Unlocked</h2>
              <div className="bg-black p-4 font-mono break-all text-green-400 rounded">
                {vault.access_keys}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}