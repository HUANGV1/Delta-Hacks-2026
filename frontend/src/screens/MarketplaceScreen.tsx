import { motion } from 'framer-motion';
import { useGameStore } from '../store';
import { useState } from 'react';
import apiService from '../services/api';
import type { Item } from '../types';

const ITEMS: Omit<Item, 'acquiredAt'>[] = [
    { id: 'beanie_red', name: 'Red Beanie', type: 'hat', cost: 100, rarity: 'common', description: 'A cozy red beanie' },
    { id: 'sunglasses', name: 'Cool Shades', type: 'glasses', cost: 250, rarity: 'rare', description: 'Block the haters' },
    { id: 'chain_gold', name: 'Gold Chain', type: 'neck', cost: 1000, rarity: 'epic', description: 'Pure 24k gold' },
    { id: 'party_hat', name: 'Party Hat', type: 'hat', cost: 500, rarity: 'uncommon', description: 'Time to celebrate!' },
    { id: 'bow_tie', name: 'Bow Tie', type: 'neck', cost: 150, rarity: 'common', description: 'For formal occasions' },
];

export function MarketplaceScreen() {
    const coins = useGameStore(s => s.coins);
    const inventory = useGameStore(s => s.inventory) || [];
    const pet = useGameStore(s => s.pet);
    const setGameState = useGameStore(s => s.setGameState);
    const [loadingId, setLoadingId] = useState<string | null>(null);

    const cosmetics = pet.cosmetics || {};

    const handleBuy = async (item: typeof ITEMS[0]) => {
        if (loadingId) return;
        setLoadingId(item.id);
        try {
            const res = await apiService.buyItem(item.id);
            if (res.success && res.data?.gameState) {
                setGameState(res.data.gameState);

                // Auto-equip item after purchase
                const equipRes = await apiService.equipItem(item.id, item.type);
                if (equipRes.success && equipRes.data?.gameState) {
                    setGameState(equipRes.data.gameState);
                }
            } else {
                alert(res.message || 'Failed to buy item');
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingId(null);
        }
    };

    const handleEquip = async (item: typeof ITEMS[0]) => {
        if (loadingId) return;
        setLoadingId(item.id);
        try {
            const res = await apiService.equipItem(item.id, item.type);
            if (res.success && res.data?.gameState) {
                setGameState(res.data.gameState);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingId(null);
        }
    };

    const handleUnequip = async (item: typeof ITEMS[0]) => {
        if (loadingId) return;
        setLoadingId(item.id);
        try {
            const res = await apiService.equipItem(null, item.type);
            if (res.success && res.data?.gameState) {
                setGameState(res.data.gameState);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingId(null);
        }
    };

    return (
        <div className="screen-content" style={{ paddingBottom: '80px' }}>
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="header-card"
            >
                <h1>Marketplace</h1>
                <div className="coin-balance">
                    <span style={{ fontSize: '24px' }}>🪙</span>
                    <span style={{ fontSize: '20px', fontWeight: 'bold' }}>{coins.balance.toLocaleString()}</span>
                </div>
            </motion.div>

            <div className="marketplace-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', padding: '0 4px' }}>
                {ITEMS.map((item, index) => {
                    const owned = inventory.some(i => i.id === item.id);
                    const equipped = cosmetics[item.type as keyof typeof cosmetics] === item.id;
                    const canAfford = coins.balance >= item.cost;
                    const isLoading = loadingId === item.id;

                    return (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className={`item-card ${item.rarity}`}
                            style={{
                                background: 'rgba(255, 255, 255, 0.05)',
                                borderRadius: '16px',
                                padding: '16px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                border: equipped ? '2px solid #3B82F6' : '1px solid rgba(255,255,255,0.1)',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            {equipped && (
                                <div style={{
                                    position: 'absolute',
                                    top: 0,
                                    right: 0,
                                    background: '#3B82F6',
                                    padding: '4px 8px',
                                    borderBottomLeftRadius: '8px',
                                    fontSize: '10px',
                                    fontWeight: 'bold'
                                }}>
                                    EQUIPPED
                                </div>
                            )}

                            <div style={{ fontSize: '48px', marginBottom: '8px' }}>
                                {item.type === 'hat' ? '🧢' : item.type === 'glasses' ? '🕶️' : '👔'}
                            </div>

                            <h3 style={{ margin: '4px 0', fontSize: '16px' }}>{item.name}</h3>
                            <p style={{ margin: '0 0 12px 0', fontSize: '12px', opacity: 0.7 }}>{item.description}</p>

                            {!owned ? (
                                <button
                                    onClick={() => handleBuy(item)}
                                    disabled={!canAfford || isLoading}
                                    style={{
                                        width: '100%',
                                        padding: '8px',
                                        borderRadius: '8px',
                                        border: 'none',
                                        background: canAfford ? 'linear-gradient(135deg, #10B981, #059669)' : '#374151',
                                        color: 'white',
                                        fontWeight: 'bold',
                                        cursor: canAfford ? 'pointer' : 'not-allowed',
                                        opacity: isLoading ? 0.7 : 1
                                    }}
                                >
                                    {isLoading ? '...' : `Buy ${item.cost} 🪙`}
                                </button>
                            ) : (
                                <button
                                    onClick={() => equipped ? handleUnequip(item) : handleEquip(item)}
                                    disabled={isLoading}
                                    style={{
                                        width: '100%',
                                        padding: '8px',
                                        borderRadius: '8px',
                                        border: 'none',
                                        background: equipped ? '#374151' : '#3B82F6',
                                        color: 'white',
                                        fontWeight: 'bold',
                                        cursor: 'pointer',
                                        opacity: isLoading ? 0.7 : 1
                                    }}
                                >
                                    {isLoading ? '...' : equipped ? 'Unequip' : 'Equip'}
                                </button>
                            )}
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
