import { Request, Response } from 'express';
import { WebhookClient, EmbedBuilder } from 'discord.js';
import supabase from '../config/supabaseClient.js';

const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

// Helper to send Discord Webhook
interface WebhookDonation {
    from_name: string;
    amount: number;
    currency: string;
    message?: string;
}

const sendDiscordWebhook = async (donation: WebhookDonation) => {
    if (!webhookUrl) return;
    try {
        const webhookClient = new WebhookClient({ url: webhookUrl });
        const embed = new EmbedBuilder()
            .setTitle('🎉 ¡Nueva Donación!')
            .setColor(0xFFD700)
            .setDescription(`**${donation.from_name || 'Anónimo'}** ha donado **${donation.amount} ${donation.currency}**!`)
            .addFields({ name: 'Mensaje', value: donation.message || '¡Muchas gracias por el apoyo! 🌊' })
            .setTimestamp()
            .setFooter({ text: 'CrystalTides SMP' });

        await webhookClient.send({
            embeds: [embed],
        });
    } catch (error) {
        console.error('Error sending webhook:', error);
    }
}

export const testDonation = async (req: Request, res: Response) => {
    try {
        const { username, amount, currency } = req.body;
        // Mock object for the test
        const mockDonation: WebhookDonation = {
            from_name: username || 'Test User',
            amount: amount || 69,
            currency: currency || 'USD',
            message: 'Alerta de prueba'
        };
        await sendDiscordWebhook(mockDonation);
        res.json({ success: true, message: 'Test announcement sent' });
    } catch {
        // console.error('Error sending webhook:', error); // Removed unused error
        res.status(500).json({ success: false, message: 'Failed test' });
    }
};

export const getDonations = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const search = req.query.search as string;

        let query = supabase
            .from('donations')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range((page - 1) * limit, page * limit - 1);

        if (search) {
            query = query.ilike('from_name', `%${search}%`);
        }

        const { data, error, count } = await query;

        if (error) throw error;

        res.json({
            data: data,
            total: count || 0,
            page,
            totalPages: count ? Math.ceil(count / limit) : 1
        });
    } catch (error) {
        console.error('Error fetching donations:', error);
        res.status(500).json({ message: 'Error fetching donations' });
    }
};

export const createDonation = async (req: Request, res: Response) => {
    try {
        const { from_name, amount, currency, message, is_public, email } = req.body;
        
        const { data, error } = await supabase
            .from('donations')
            .insert([{ 
                from_name, 
                amount, 
                currency: currency || 'USD', 
                message, 
                is_public: is_public ?? true, 
                buyer_email: email,
                created_at: new Date()
            }])
            .select()
            .single();

        if (error) throw error;

        // Optionally trigger webhook for real manual donations too
        if (data) await sendDiscordWebhook(data);

        res.status(201).json(data);
    } catch (error) {
        console.error('Error creating donation:', error);
        res.status(500).json({ message: 'Error creating donation' });
    }
};

export const updateDonation = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const { data, error } = await supabase
            .from('donations')
            .update(req.body)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Error updating donation:', error);
        res.status(500).json({ message: 'Error updating donation' });
    }
};

export const deleteDonation = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const { error } = await supabase
            .from('donations')
            .delete()
            .eq('id', id);

        if (error) throw error;
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting donation:', error);
        res.status(500).json({ message: 'Error deleting donation' });
    }
};

export const getDonationStats = async (req: Request, res: Response) => {
    try {
        // Fetch all amounts for calc (warning: heavy if many rows, better to use RPC or created aggregated view later)
        const { data, error } = await supabase
            .from('donations')
            .select('amount, created_at, currency');

        if (error) throw error;

        const totalAmount = data.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
        
        // Detailed Month Calc
        const now = new Date();
        const currentMonthIdx = now.getMonth();
        const currentYear = now.getFullYear();
        
        const prevDate = new Date();
        prevDate.setMonth(now.getMonth() - 1);
        const prevMonthIdx = prevDate.getMonth();
        const prevYear = prevDate.getFullYear();

        let currentMonthParams = 0;
        let prevMonthParams = 0;

        // Basic monthly aggregation in JS
        const months: Record<string, number> = {};
        
        data.forEach(d => {
            const date = new Date(d.created_at);
            const amt = Number(d.amount) || 0;
            
            // Monthly Agg
            const key = `${date.toLocaleString('default', { month: 'short' })}`; // e.g. "Dec"
            months[key] = (months[key] || 0) + amt;

            // Current Month Calc
            if (date.getMonth() === currentMonthIdx && date.getFullYear() === currentYear) {
                currentMonthParams += amt;
            }

            // Prev Month Calc
            if (date.getMonth() === prevMonthIdx && date.getFullYear() === prevYear) {
                prevMonthParams += amt;
            }
        });

        // Calculate Percent Change
        let percentChange = 0;
        if (prevMonthParams === 0) {
            percentChange = currentMonthParams > 0 ? 100 : 0;
        } else {
            percentChange = ((currentMonthParams - prevMonthParams) / prevMonthParams) * 100;
        }

        const monthlyStats = Object.keys(months).map(month => ({
            month,
            amount: months[month]
        }));

        res.json({
            totalAmount,
            currentMonth: currentMonthParams.toFixed(2),
            percentChange: Math.round(percentChange),
            count: data.length,
            monthlyStats
        });
    } catch (error) {
        console.error('Error fetching donation stats:', error);
        res.status(500).json({ message: 'Error fetching stats' });
    }
};
