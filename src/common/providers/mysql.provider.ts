import { createConnection } from "mysql2/promise"
import { hostname } from "os"

export const mysqlProvider = [{
    provide: 'MYSQL_CONNECTION',
    useFactory: async () => {
        const connection = await createConnection({
            host: 'localhost',
            port: 3306,
            user: 'root',
            password: 'Popeye08',
            database: 'gids6082_db'
        });

        return connection;
    }    
}]