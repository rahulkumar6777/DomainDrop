import { envs } from "../../lib/env.js";
import { QUEUE_NAMES } from "./queueNames.js";
import { Queue } from "bullmq";
import { connection } from "./bullmqConnection.js";


export const welcomeQueue = new Queue(QUEUE_NAMES.WELCOME, { connection });