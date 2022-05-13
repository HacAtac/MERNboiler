// import cron from 'node-cron'
// import {
//   moveStreamsOrigin,
//   pingStreamingServer,
// } from './pingStreamingServer.js'

// export const cronJobs = () => {
//   //             ┌────────────── second (optional)
//   //             │ ┌──────────── minute
//   //             │ │ ┌────────── hour
//   //             │ │ │ ┌──────── day of month
//   //             │ │ │ │ ┌────── month
//   //             │ │ │ │ │ ┌──── day of week
//   //             │ │ │ │ │ │
//   //             │ │ │ │ │ │
//   //             * * * * * *
//   cron.schedule('0 0 */1 * * *', async () => {
//     // This is for genesis
//     // await pingStreamingServer("gen", "54.243.204.186", "edge02");
//     // await pingStreamingServer("edge11", "54.236.210.165", "edge12");
//   })
// }
