import Pusher from "pusher-js";

export const pusherClient = new Pusher("fab9a9f9a51b72d77a57", {
  cluster: "us2",
  forceTLS: true,
});
