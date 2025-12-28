import express from 'express';
import { handleKofiWebhook } from '../controllers/webhookController.js';

const router = express.Router();

router.post('/kofi', handleKofiWebhook);
router.post('/minecraft', (req, res) => {
    // Basic placeholder for MC events
    const { event, player, details, secret } = req.body;
    
    // Security check (Optional: verify secret from plugin)
    if (process.env.MC_WEBHOOK_SECRET && secret !== process.env.MC_WEBHOOK_SECRET) {
        return res.status(401).json({ error: "Invalid secret" });
    }

    console.log(`[MC Webhook] Event: ${event} | Player: ${player}`);
    
    // Notify Discord (async)
    import('../services/discordService.js').then(s => s.notifyMinecraftEvent(event, player, details));

    res.json({ success: true });
});

export default router;
