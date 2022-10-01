
import "dotenv/config";
import { server } from './app';
import { socketInitialization } from "./socket";
import { initData } from "./init/InitData";
import { initializeDataSource } from './utils/functions/dataSource';


(async () => {
  try {
    await initializeDataSource();
    socketInitialization(server);
    const PORT : Number = Number(process.env.PORT) || 5000;
    server.listen(PORT, () => {
      console.log(`Listening on port ${PORT}`);
    });
    process.env.INIT_DATA == "true" && initData();
  } catch (error) {
    console.log('Connecting to database failed', error);
  }
})();
