import { userInfo } from "os"
import { Client } from "pg";

export const pgProvider = [{
    provide: 'PG_CONNECTION',
    useFactory: () => {
        const client = new Client({
            host: 'localhost',
            port: 5436,
            user: 'postgres',
            password: 'Popeye08',
            database: 'gids6082_db'
    });
    client.connect();
    return client;
    }
}]