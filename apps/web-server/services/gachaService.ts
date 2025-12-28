import supabase from '../config/supabaseClient.js';

import * as commandService from './commandService.js';

// Estructura de un Premio
export interface GachaReward {
    id: string;
    name: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    type: 'currency' | 'item' | 'rank' | 'xp';
    value: string | number; // Ej: 100 (monedas), "vip_rank" (id)
    chance: number; // Porcentaje 0-100 (ej: 0.5 para legendario)
    image_url?: string;
}

// Configuración Hardcoded (Idealmente iría en DB)
const REWARDS_POOL: GachaReward[] = [
    { id: 'xp_small', name: '100 XP', rarity: 'common', type: 'xp', value: 100, chance: 40 },
    { id: 'coins_small', name: '50 KilluCoins', rarity: 'common', type: 'currency', value: 50, chance: 30 },
    { id: 'coins_med', name: '200 KilluCoins', rarity: 'rare', type: 'currency', value: 200, chance: 15 },
    { id: 'item_diamond', name: 'Pack Diamantes', rarity: 'rare', type: 'item', value: 'diamond_pack', chance: 10 },
    { id: 'rank_vip_3d', name: 'VIP (3 Días)', rarity: 'epic', type: 'rank', value: 'vip_3d', chance: 4 },
    { id: 'rank_mvp_1d', name: 'MVP (1 Día)', rarity: 'legendary', type: 'rank', value: 'mvp_1d', chance: 1 },
];

export const rollGacha = async (userId: string) => {
    // 1. Check Cooldown (1 free roll per 24 hours)
    const canRoll = await checkCooldown(userId);
    if (!canRoll) {
        throw new Error("COOLDOWN_ACTIVE");
    }

    // 2. Logic: Probability (Weighted Random)
    const random = Math.random() * 100;
    let currentWeight = 0;
    let selectedReward: GachaReward | null = null;

    for (const reward of REWARDS_POOL) {
        currentWeight += reward.chance;
        if (random <= currentWeight) {
            selectedReward = reward;
            break;
        }
    }

    // Fallback
    if (!selectedReward) selectedReward = REWARDS_POOL[0];

    // 3. Deliver Reward (Save to history)
    await saveDrop(userId, selectedReward);

    // 4. Queue Command in CrystalCore Bridge
    // Assuming userId is linked to a MC username, or we queue by UUID if supported.
    // For now, let's assume we need the username. We might need to fetch it.
    // This is a simplification. Ideally, pass username or fetch it.
    const command = getCommandForReward(selectedReward, userId); 
    if (command) {
        await commandService.queueCommand(command);
    }

    return selectedReward;
};

// Helper to generate commands based on reward type
const getCommandForReward = (reward: GachaReward, target: string): string | null => {
    // NOTE: 'target' should ideally be the Minecraft Username.
    // If 'userId' is a UUID, the command needs to support UUIDs or we need to resolve it.
    // For this implementation, we assume the frontend sends the MC Username as 'userId' 
    // OR that the plugin supports "uuid:<uuid>".
    
    switch (reward.type) {
        case 'currency':
             return `eco give ${target} ${reward.value}`;
        case 'rank':
             // vault/luckperms command
             return `lp user ${target} parent add ${reward.value}`;
        case 'item':
             // custom plugin command or give
             return `give ${target} ${reward.value} 1`;
        case 'xp':
             return `xp give ${target} ${reward.value}`;
        default:
             return null;
    }
}

const checkCooldown = async (userId: string): Promise<boolean> => {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    // Check last roll
    const { data, error } = await supabase
        .from('gacha_history')
        .select('created_at')
        .eq('user_id', userId)
        .gte('created_at', twentyFourHoursAgo)
        .order('created_at', { ascending: false })
        .limit(1);

    if (error) {
        console.error("Gacha Cooldown Check Error:", error);
        return false; // Fail safe
    }

    return data.length === 0;
};

const saveDrop = async (userId: string, reward: GachaReward) => {
    const { error } = await supabase
        .from('gacha_history')
        .insert({ 
            user_id: userId, 
            reward_id: reward.id, 
            reward_name: reward.name,
            rarity: reward.rarity,
            created_at: new Date() 
        });
    
    if (error) console.error("Error saving drop:", error);
    console.log(`[GACHA] User ${userId} won ${reward.name}`);
};

export const getHistory = async (userId: string) => {
    const { data, error } = await supabase
        .from('gacha_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);
        
    if (error) throw error;
    return data || [];
};
