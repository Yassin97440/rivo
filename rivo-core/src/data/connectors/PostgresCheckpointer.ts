import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres";
import { SupabaseClient } from "@supabase/supabase-js";
import pg, { Pool } from "pg";
interface PoolConfig {
    host: string;
    port: string;
    user: string;
    password: string;
    database: string;
}

export class PostgresCheckpointer  {

    private pool: Pool;
    public checkpointer: PostgresSaver;

    constructor() {
        this.pool = new Pool({
            connectionString: 'postgresql://rivo_checkpointer:@82.29.184.26:5432/rivo'
        });
        this.checkpointer = new PostgresSaver(this.pool);
        this.setup();
    }

    async setup() {
        await this.checkpointer.setup();
    }
}