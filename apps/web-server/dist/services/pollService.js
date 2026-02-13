import supabase from './supabaseService.js';
import { translateText } from './translationService.js';
export const getActivePoll = async () => {
    // 1. Fetch active poll
    const { data: poll, error } = await supabase
        .from('polls')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(); // maybeSingle allows null if 0 rows
    if (error) {
        console.error("Error fetching active poll:", error);
        return null;
    }
    if (!poll)
        return null;
    // 2. Fetch options
    const { data: options } = await supabase
        .from('poll_options')
        .select('*')
        .eq('poll_id', poll.id)
        .order('id', { ascending: true });
    const safeOptions = options || [];
    // Calculate total votes
    const totalVotes = safeOptions.reduce((sum, opt) => sum + (opt.votes || 0), 0);
    // Calculate percentages
    const optionsWithPercent = safeOptions.map((opt) => ({
        ...opt,
        percent: totalVotes === 0 ? 0 : Math.round(((opt.votes || 0) / totalVotes) * 100)
    }));
    // Calculate time remaining string
    let closesIn = 'Indefinido';
    if (poll.closes_at) {
        const total = Date.parse(poll.closes_at) - Date.now();
        const days = Math.floor(total / (1000 * 60 * 60 * 24));
        const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
        if (total <= 0)
            closesIn = "Finalizada";
        else if (days > 0)
            closesIn = `${days} días`;
        else
            closesIn = `${hours} horas`;
    }
    return {
        ...poll,
        options: optionsWithPercent,
        totalVotes,
        closesIn
    };
};
export const getPollById = async (id) => {
    const { data: poll, error } = await supabase.from('polls').select('*').eq('id', id).single();
    if (error || !poll)
        return null;
    const { data: options } = await supabase.from('poll_options').select('*').eq('poll_id', poll.id);
    const safeOptions = options || [];
    const totalVotes = safeOptions.reduce((acc, o) => acc + (o.votes || 0), 0);
    // Calculate percentages
    const optionsWithPercent = safeOptions.map((opt) => ({
        ...opt,
        percent: totalVotes === 0 ? 0 : Math.round(((opt.votes || 0) / totalVotes) * 100)
    }));
    // Time Calc
    let closesIn = 'Indefinido';
    if (poll.closes_at) {
        const total = Date.parse(poll.closes_at) - Date.now();
        const days = Math.floor(total / (1000 * 60 * 60 * 24));
        if (total <= 0)
            closesIn = "Finalizada";
        else
            closesIn = `${days} días`;
    }
    return { ...poll, options: optionsWithPercent, totalVotes, closesIn };
};
export const votePoll = async (pollId, optionId) => {
    // Naive fetch-update
    const { data: option, error: fetchError } = await supabase
        .from('poll_options')
        .select('votes')
        .eq('id', optionId)
        .single();
    if (fetchError || !option)
        throw new Error("Option not found");
    const newVotes = (option.votes || 0) + 1;
    const { error } = await supabase
        .from('poll_options')
        .update({ votes: newVotes })
        .eq('id', optionId);
    if (error)
        throw error;
    return { success: true, votes: newVotes };
};
export const createPoll = async ({ title, title_en, question, question_en, options, closes_at, thread_id, discord_link }) => {
    // Deactivate others ONLY if Global (no thread_id)
    if (!thread_id) {
        await supabase.from('polls').update({ is_active: false }).is('thread_id', null).neq('id', -1);
    }
    const finalTitleEn = title_en ? title_en : await translateText(title, 'en');
    const finalQuestionEn = question_en ? question_en : await translateText(question, 'en');
    const { data: poll, error } = await supabase
        .from('polls')
        .insert([{
            title,
            question,
            title_en: finalTitleEn,
            question_en: finalQuestionEn,
            is_active: true,
            closes_at,
            thread_id: thread_id || null,
            discord_link: discord_link || null
        }])
        .select()
        .single();
    if (error)
        throw error;
    if (options && options.length > 0) {
        // Options can be string[] or { label, label_en }[]
        const optionsData = await Promise.all(options.map(async (opt) => {
            let label = '';
            let label_en = '';
            if (typeof opt === 'string') {
                label = opt;
                label_en = await translateText(opt, 'en');
            }
            else {
                label = opt.label;
                label_en = opt.label_en ? opt.label_en : await translateText(opt.label, 'en');
            }
            return {
                poll_id: poll.id,
                label,
                label_en,
                votes: 0
            };
        }));
        const { error: optError } = await supabase.from('poll_options').insert(optionsData);
        if (optError)
            throw optError;
    }
    return poll;
};
export const updatePoll = async (id, { title, title_en, question, question_en, options, closes_at }) => {
    // 1. Update main fields
    const finalTitleEn = title_en ? title_en : await translateText(title, 'en');
    const finalQuestionEn = question_en ? question_en : await translateText(question, 'en');
    const { data: poll, error } = await supabase
        .from('polls')
        .update({
        title,
        title_en: finalTitleEn,
        question,
        question_en: finalQuestionEn,
        closes_at
    })
        .eq('id', id)
        .select()
        .single();
    if (error)
        throw error;
    // 2. Diff Options
    // FETCH EXISTING
    const { data: existingOptions } = await supabase
        .from('poll_options')
        .select('*')
        .eq('poll_id', id)
        .order('id', { ascending: true });
    const safeExisting = existingOptions || [];
    // We will update first N options, create remaining, delete extras?
    if (options && Array.isArray(options)) {
        for (let i = 0; i < options.length; i++) {
            const opt = options[i];
            const label = typeof opt === 'string' ? opt : opt.label;
            const label_en = typeof opt === 'string' ? await translateText(opt, 'en') : (opt.label_en || await translateText(opt.label, 'en'));
            if (safeExisting && i < safeExisting.length) {
                // UPDATE existing
                await supabase
                    .from('poll_options')
                    .update({ label, label_en })
                    .eq('id', safeExisting[i].id);
            }
            else {
                // CREATE new
                await supabase
                    .from('poll_options')
                    .insert({
                    poll_id: id,
                    label,
                    label_en,
                    votes: 0
                });
            }
        }
        // DELETE extras if new list is shorter
        if (safeExisting && safeExisting.length > options.length) {
            const toDelete = safeExisting.slice(options.length).map((o) => o.id);
            await supabase.from('poll_options').delete().in('id', toDelete);
        }
    }
    return poll;
};
export const closePoll = async (id) => {
    const { error } = await supabase
        .from('polls')
        .update({ is_active: false })
        .eq('id', id);
    if (error)
        throw error;
    return { success: true };
};
export const deletePoll = async (id) => {
    // 1. Delete options first (manual cascade)
    await supabase.from('poll_options').delete().eq('poll_id', id);
    // 2. Delete poll
    const { error } = await supabase.from('polls').delete().eq('id', id);
    if (error)
        throw error;
    return { success: true };
};
export const getPolls = async ({ page = 1, limit = 10 }) => {
    const offset = (page - 1) * limit;
    // Fetch polls
    const { data: polls, count, error } = await supabase
        .from('polls')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
    if (error)
        throw error;
    // Fetch options for these polls to calculate total votes
    if (!polls || polls.length === 0) {
        return { data: [], total: 0, page, totalPages: 0 };
    }
    // Cast as Poll[] to avoid 'any' issues downstream
    const safePolls = polls;
    const pollIds = safePolls.map((p) => p.id);
    const { data: options } = await supabase
        .from('poll_options')
        .select('poll_id, votes')
        .in('poll_id', pollIds);
    const safeOptions = options || [];
    // enrich polls
    const enrichedPolls = safePolls.map((p) => {
        const pOptions = safeOptions.filter((o) => o.poll_id === p.id);
        const totalVotes = pOptions.reduce((acc, curr) => acc + (curr.votes || 0), 0);
        return { ...p, totalVotes };
    });
    return {
        data: enrichedPolls,
        total: count,
        page,
        totalPages: Math.ceil((count || 0) / limit)
    };
};
