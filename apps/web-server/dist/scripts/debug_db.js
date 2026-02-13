import supabase from '../config/supabaseClient.js';
async function checkConnection() {
    console.log("--- Supabase Connection Check ---");
    try {
        console.log("Checking 'events' table...");
        const { data: events, error: eventsError } = await supabase
            .from('events')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(1);
        if (eventsError) {
            console.error("❌ Error accessing 'events':", eventsError.message);
        }
        else {
            console.log("✅ 'events' table accessible. Count:", events?.length);
        }
        try {
            console.log("Checking 'news' table...");
            const { data: news, error: newsError } = await supabase
                .from('news')
                .select('*')
                .limit(1);
            if (newsError) {
                console.error("❌ Error accessing 'news':", newsError.message);
            }
            else {
                console.log("✅ 'news' table accessible. Count:", news?.length);
                if (news && news.length > 0) {
                    console.log("Schema Keys:", Object.keys(news[0]));
                }
                else {
                    console.log("⚠️ 'news' table empty, cannot infer schema.");
                }
            }
        }
        catch (e) {
            console.error("❌ Exception accessing 'news':", e);
        }
    }
    catch (e) {
        console.error("❌ Exception accessing 'events':", e);
    }
    try {
        console.log("Checking 'staff_tasks' table...");
        const { data: tasks, error: tasksError } = await supabase
            .from('staff_tasks')
            .select('id')
            .limit(1);
        if (tasksError) {
            console.error("❌ Error accessing 'staff_tasks':", tasksError.message);
        }
        else {
            console.log("✅ 'staff_tasks' table accessible. Count:", tasks?.length);
        }
    }
    catch (e) {
        console.error("❌ Exception accessing 'staff_tasks':", e);
    }
}
checkConnection();
