import { SupabaseClient } from "@supabase/supabase-js";

interface PoolConfig {
    host: string;
    port: string;
    user: string;
    password: string;
    database: string;
}

export class PgChatMemoryConnector  {

    private poolConfig: PoolConfig = {
        host: process.env.PG_HOST || 'db.phweeegnovwpduxymnsz.supabase.co',
        port: process.env.PG_PORT || '5432',
        user: process.env.PG_USER || 'postgres',
        password: process.env.PG_PASSWORD || 'postgres',
        database: process.env.PG_DATABASE || 'postgres'
    };
    constructor() {

    }
}