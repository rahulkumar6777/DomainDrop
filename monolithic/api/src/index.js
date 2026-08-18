import { uptime } from "process";
import { connectDb, disconnectDb } from "./config/db/mongodb.js";
import { connectRedis } from "./config/redis/redis.js";
import app from "./server.js";
import { envs } from "./lib/env.js";


//health route
app.get('/health', (_req, res) => {
    return res.status(200).json({
        success: true,
        time: new Date().toLocaleTimeString()
    })
})

// routers
import router from "./routes/index.js";
app.use('/api', router)


app.listen(envs.PORT, async () => {
    await connectDb();
    await connectRedis();
    console.log(`Server is running on port ${envs.PORT} in ${envs.NODE_ENV} mode`);
});