import { sendMail } from "@/actions/sendMail.ts";
import { testCounter } from "@/actions/testCounter.ts";

export const server = {
    sendMail,
    testCounter
};