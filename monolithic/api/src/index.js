import { connectDb } from "./config/db/mongodb.js";
import { connectRedis } from "./config/redis/redis.js";
import app from "./server.js";
import { envs } from "./lib/env.js";
import { returnError } from "./utils/errors/sendError.js";
import { startExpiredUploadsWorker } from "./workers/expiredUploads.worker.js";


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

app.use((error, _req, res, _next) => {
    if (!error?.status || error.status >= 500) {
        console.error(error);
    }

    return returnError(res, error);
});

const startServer = async () => {
    await connectDb();
    await connectRedis();
    startExpiredUploadsWorker();
    await import("./workers/index.js")


    app.listen(envs.PORT, () => {
        console.log(`Server is running on port ${envs.PORT} in ${envs.NODE_ENV} mode`);
    });
};

startServer();

