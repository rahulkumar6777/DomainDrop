import { Worker } from 'bullmq'
import { welcomeEmailTemplate } from '../EmailTemplets/welcomeMail.js';
import { transporter } from '../utils/mail/transporter.js';
import { envs } from '../lib/env.js';
import { QUEUE_NAMES } from '../utils/queues/queueNames.js';
import { connection } from '../utils/queues/bullmqConnection.js';



const welcomeWorker = new Worker(QUEUE_NAMES.WELCOME, async (job) => {
    try {


        const { name, email } = job.data;

        if (!name || !email) {
            throw new Error("Missing job data");
        }

        const appUrl = `${envs.FRONTEND_URI}`;

        await transporter.sendMail({
            from: `DomainDrop ${envs.EMAIL_USER}`,
            to: email,
            subject: " Welcome to the DoaminDrop",
            html: welcomeEmailTemplate({ name, appUrl })
        })

        console.log(`Welcome email sent to user ${email}`)

    } catch (error) {
        throw error(error.message)
    }
}, { connection, concurrency: 3 })



welcomeWorker.on("completed", (job) => {
    console.log(`welcomes sent to user ${job.data.email}`)
});


welcomeWorker.on("failed", (job) => {
    console.log(`welcomes send failed to user ${job.data.email}`)
})