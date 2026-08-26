import corn from 'node-cron';
import { ApiKey } from '../models/apikeys.model.js'

const Batch_Size = 10_000;
let isRunning = false;

// this job run in every 1 hr
corn.schedule("0 * * * *", async (params) => {


    if (isRunning) {
        console.log('Previous job is still running, skipping...');
        return;
    }

    isRunning = true;
    let lastId = null;

    try {

        while (true) {

            const query = lastId ? { _id: { $gt: lastId }, status: "revoked" } : { status: "revoked" };

            const apikeys = await ApiKey.find(query).sort({ _id: 1 }).limit(Batch_Size).lean()

            if (apikeys.length === 0) {
                break;
            }

            console.log(`Processing ${apikeys.length} documents`);

            for (const apikey of apikeys) {
                await ApiKey.deleteOne({ _id: apikey._id })
            }

            lastId = apikeys[apikeys.length - 1]._id;
        }
    } catch (error) {
        throw new Error("Error While Remove ApiKey");

    } finally {
        isRunning = false;
    }
})