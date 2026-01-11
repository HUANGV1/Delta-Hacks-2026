import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store';
import apiService from '../services/api';
import { TrophyIcon, SearchIcon, FootprintsIcon } from '../components/Icons';
import type { PetStage } from '../types';

interface LeaderboardEntry {
    username: string;
    pet_name: string;
    pet_stage: PetStage;
    net_worth: number;
    pet_type: string;
}

export function LeaderboardScreen({ onClose }: { onClose: () => void }) {
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const currentUser = useGameStore((s) => s.pet.name); // Using pet name as a proxy for identifying self if needed

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    const fetchLeaderboard = async (searchQuery?: string) => {
        setLoading(true);
        const res = await apiService.getLeaderboard(searchQuery);
        if (res.success && res.data) {
            setLeaderboard(res.data.leaderboard);
        }
        setLoading(false);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchLeaderboard(search);
    };

    const STAGE_ICONS: Record<string, string> = {
        egg: '🥚',
        baby: '🐣',
        child: '🐥',
        teen: '🦜',
        adult: '🦅',
        elder: '🦉',
        legendary: '🐉',
    };

    return (
        <div className="leaderboard-screen" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'var(--bg-app)',
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
        }}>
            <header className="screen-header" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                <button
                    onClick={onClose}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-secondary)',
                        fontSize: '1.5rem',
                        cursor: 'pointer'
                    }}
                >
                    ←
                </button>
                <h1 className="screen-title" style={{ flex: 1, margin: 0 }}>Leaderboard</h1>
            </header>

            <div className="leaderboard-content" style={{ padding: '0 20px 20px', flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

                {/* Search Bar */}
                <form onSubmit={handleSearch} style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <input
                            type="text"
                            placeholder="Search username..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px 40px 12px 16px',
                                background: 'var(--bg-surface)',
                                border: '1px solid var(--border-default)',
                                borderRadius: 'var(--radius-md)',
                                color: 'var(--text-primary)',
                                fontSize: '1rem'
                            }}
                        />
                        <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}>
                            <SearchIcon size={20} />
                        </span>
                    </div>
                    <button
                        type="submit"
                        style={{
                            padding: '0 20px',
                            background: 'var(--accent)',
                            border: 'none',
                            borderRadius: 'var(--radius-md)',
                            color: 'white',
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                    >
                        Search
                    </button>
                </form>

                {/* Header Row */}
                <div className="leaderboard-header" style={{
                    display: 'grid',
                    gridTemplateColumns: '40px 1fr 100px',
                    padding: '10px 15px',
                    color: 'var(--text-secondary)',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    borderBottom: '1px solid var(--border-default)'
                }}>
                    <span>#</span>
                    <span>Player</span>
                    <span style={{ textAlign: 'right' }}>Net Worth</span>
                </div>

                {/* List */}
                <div className="leaderboard-list" style={{ flex: 1, overflowY: 'auto' }}>
                    {loading ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                            Loading...
                        </div>
                    ) : leaderboard.length === 0 ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                            No players found.
                        </div>
                    ) : (
                        leaderboard.map((entry, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="leaderboard-item"
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '40px 1fr 100px',
                                    padding: '15px',
                                    background: 'var(--bg-surface)',
                                    borderBottom: '1px solid var(--border-default)',
                                    alignItems: 'center'
                                }}
                            >
                                <span className="rank" style={{
                                    fontWeight: 'bold',
                                    color: index < 3 ? 'var(--accent)' : 'var(--text-secondary)',
                                    fontSize: index < 3 ? '1.2rem' : '1rem'
                                }}>
                                    {index + 1}
                                </span>

                                <div className="player-info" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span className="player-avatar" style={{ fontSize: '1.5rem' }}>
                                        {STAGE_ICONS[entry.pet_stage] || '🥚'}
                                    </span>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span className="player-name" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                                            {entry.username}
                                        </span>
                                        <span className="pet-name" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                            {entry.pet_name}
                                        </span>
                                    </div>
                                </div>

                                <div className="player-worth" style={{ textAlign: 'right', fontWeight: 600, color: '#F59E0B' }}>
                                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginRight: '4px' }}>$</span>
                                    {entry.net_worth.toLocaleString()}
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
