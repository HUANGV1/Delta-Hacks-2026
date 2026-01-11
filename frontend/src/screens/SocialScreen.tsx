import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import apiService from '../services/api';
import { TrophyIcon, UserIcon, StarIcon } from '../components/Icons';

interface LeaderboardUser {
    id: number;
    username: string;
    pet_name: string;
    pet_type: string;
    total_value: number;
}

interface SearchResult {
    id: number;
    username: string;
}

export function SocialScreen() {
    const [view, setView] = useState<'leaderboard' | 'search'>('leaderboard');
    const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (view === 'leaderboard') {
            loadLeaderboard();
        }
    }, [view]);

    const loadLeaderboard = async () => {
        setLoading(true);
        try {
            const response = await apiService.request('/social/leaderboard');
            if (response.success && response.data) {
                const apiData = response.data as any;
                setLeaderboard(apiData.data || []);
            }
        } catch (e) {
            console.error('Failed to load leaderboard:', e);
        }
        setLoading(false);
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        setLoading(true);
        try {
            const response = await apiService.request(`/social/search?query=${encodeURIComponent(searchQuery)}`);
            if (response.success && response.data) {
                const apiData = response.data as any;
                setSearchResults(apiData.data || []);
            }
        } catch (e) {
            console.error('Search failed:', e);
        }
        setLoading(false);
    };

    const getRankStyle = (index: number) => {
        if (index === 0) return { background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.2) 0%, rgba(245, 158, 11, 0.1) 100%)', borderColor: 'rgba(251, 191, 36, 0.3)' };
        if (index === 1) return { background: 'linear-gradient(135deg, rgba(192, 192, 192, 0.15) 0%, rgba(169, 169, 169, 0.1) 100%)', borderColor: 'rgba(192, 192, 192, 0.3)' };
        if (index === 2) return { background: 'linear-gradient(135deg, rgba(205, 127, 50, 0.15) 0%, rgba(184, 115, 51, 0.1) 100%)', borderColor: 'rgba(205, 127, 50, 0.3)' };
        return {};
    };

    const getRankIcon = (index: number) => {
        if (index === 0) return '🥇';
        if (index === 1) return '🥈';
        if (index === 2) return '🥉';
        return `#${index + 1}`;
    };

    return (
        <div className="social-screen">
            <header className="screen-header simple">
                <h1 className="screen-title">Social</h1>
            </header>

            <div className="social-content">
                {/* Tab Switcher */}
                <div className="tab-switcher">
                    <motion.button
                        className={`tab-btn ${view === 'leaderboard' ? 'active' : ''}`}
                        onClick={() => setView('leaderboard')}
                        whileTap={{ scale: 0.95 }}
                    >
                        <TrophyIcon size={16} />
                        Leaderboard
                    </motion.button>
                    <motion.button
                        className={`tab-btn ${view === 'search' ? 'active' : ''}`}
                        onClick={() => setView('search')}
                        whileTap={{ scale: 0.95 }}
                    >
                        <UserIcon size={16} />
                        Find Players
                    </motion.button>
                </div>

                {/* Leaderboard View */}
                {view === 'leaderboard' && (
                    <section className="leaderboard-section">
                        <div className="section-header">
                            <h2 className="section-title">
                                <span className="title-icon"><TrophyIcon size={18} color="#fbbf24" /></span>
                                Top Characters
                            </h2>
                            <span className="section-subtitle">Ranked by character value</span>
                        </div>

                        {loading ? (
                            <div className="loading-state">
                                <div className="loading-spinner" />
                                <span>Loading rankings...</span>
                            </div>
                        ) : leaderboard.length === 0 ? (
                            <div className="empty-state">
                                <span className="empty-icon">🏆</span>
                                <span>No players yet</span>
                            </div>
                        ) : (
                            <div className="leaderboard-list">
                                {leaderboard.map((user, index) => (
                                    <motion.div
                                        key={user.id}
                                        className={`leaderboard-card ${index < 3 ? 'top-three' : ''}`}
                                        style={getRankStyle(index)}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <div className="rank-badge">
                                            {getRankIcon(index)}
                                        </div>

                                        <div className="player-info">
                                            <span className="player-name">{user.username}</span>
                                            <span className="player-pet">
                                                {user.pet_name} • {user.pet_type}
                                            </span>
                                        </div>

                                        <div className="player-value">
                                            <StarIcon size={14} color="#fbbf24" />
                                            <span>{user.total_value.toLocaleString()}</span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </section>
                )}

                {/* Search View */}
                {view === 'search' && (
                    <section className="search-section">
                        <div className="search-bar">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                placeholder="Search by username..."
                                className="search-input"
                            />
                            <motion.button
                                className="search-btn"
                                onClick={handleSearch}
                                whileTap={{ scale: 0.95 }}
                                disabled={loading}
                            >
                                Search
                            </motion.button>
                        </div>

                        {loading ? (
                            <div className="loading-state">
                                <div className="loading-spinner" />
                                <span>Searching...</span>
                            </div>
                        ) : searchResults.length > 0 ? (
                            <div className="search-results">
                                {searchResults.map((user) => (
                                    <motion.div
                                        key={user.id}
                                        className="search-result-card"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                    >
                                        <div className="result-avatar">
                                            <UserIcon size={20} />
                                        </div>
                                        <span className="result-name">{user.username}</span>
                                        <motion.button
                                            className="view-profile-btn"
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            View
                                        </motion.button>
                                    </motion.div>
                                ))}
                            </div>
                        ) : searchQuery ? (
                            <div className="empty-state">
                                <span className="empty-icon">🔍</span>
                                <span>No players found</span>
                            </div>
                        ) : (
                            <div className="empty-state">
                                <span className="empty-icon">👥</span>
                                <span>Search for other players</span>
                            </div>
                        )}
                    </section>
                )}
            </div>
        </div>
    );
}
