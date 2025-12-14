const supabase = require('./supabaseService');
const pollService = require('./pollService');

const getThreads = async (categoryId) => {
    const { data, error } = await supabase
        .from('forum_threads')
        .select('*')
        .eq('category_id', categoryId)
        .order('pinned', { ascending: false })
        .order('created_at', { ascending: false });
        
    if(error) throw error;
    return data; // Returns list of threads
};

const getThread = async (id) => {
    const { data: thread, error } = await supabase
        .from('forum_threads')
        .select('*')
        .eq('id', id)
        .single();
    
    if(error) throw error;
    
    let poll = null;
    if (thread.poll_id) {
         poll = await pollService.getPollById(thread.poll_id);
    }
    
    return { ...thread, poll };
};

const createThread = async ({ category_id, title, content, user_data, poll_data }) => {
    // 1. Create Thread
    const { data: thread, error } = await supabase
        .from('forum_threads')
        .insert([{
            category_id,
            user_id: user_data.id,
            author_name: user_data.name,
            author_avatar: user_data.avatar,
            author_role: user_data.role,
            title,
            content,
            views: 0
        }])
        .select()
        .single();
        
    if(error) throw error;

    // 2. Create Poll if requested
    if (poll_data && poll_data.enabled) {
        // If discord link provided, maybe question is empty? 
        // Logic: If linking discord, maybe we don't create a local poll but just store link?
        // But pollService.createPoll handles discord_link.
        
        const poll = await pollService.createPoll({
            thread_id: thread.id,
            title: title + " - Encuesta",
            question: poll_data.question || "Encuesta externa",
            options: poll_data.options || [],
            closes_at: poll_data.closes_at,
            discord_link: poll_data.discord_link
        });
        
        await supabase.from('forum_threads').update({ poll_id: poll.id }).eq('id', thread.id);
    }

    return thread;
};

const getPosts = async (threadId) => {
    const { data, error } = await supabase.from('forum_posts').select('*').eq('thread_id', threadId).order('created_at', {ascending:true});
    if(error) throw error;
    return data;
};

const createPost = async ({ thread_id, content, user_data }) => {
    const { data, error } = await supabase.from('forum_posts').insert([{
        thread_id, 
        content, 
        user_id: user_data.id, 
        author_name: user_data.name, 
        author_avatar: user_data.avatar, 
        author_role: user_data.role
    }]).select().single();
    if(error) throw error;
    return data;
};

const getCategoryStats = async () => {
    const categories = [2, 3, 4];
    const stats = [];

    // News (Cat 1)
    const { count: newsCount } = await supabase.from('news').select('*', { count: 'exact', head: true }).eq('status', 'Published');
    stats.push({
        id: 1,
        topics: newsCount || 0,
        posts: newsCount || 0,
        lastPost: { user: "Staff", date: "Reciente" }
    });

    // Forum Cats
    for (const catId of categories) {
        const { count } = await supabase.from('forum_threads').select('*', { count: 'exact', head: true }).eq('category_id', catId);
        
        const { data: lastThread } = await supabase.from('forum_threads').select('author_name, created_at').eq('category_id', catId).order('created_at', {ascending:false}).limit(1).single();
        
        let lastPostData = { user: "Nadie", date: "-" };
        if (lastThread) {
             lastPostData = { user: lastThread.author_name, date: new Date(lastThread.created_at).toLocaleDateString() };
        }

        stats.push({
            id: catId,
            topics: count || 0,
            posts: count || 0, 
            lastPost: lastPostData
        });
    }
    return stats;
}

module.exports = { getThreads, getThread, createThread, getPosts, createPost, getCategoryStats };
