import { defineAction } from "astro:actions";
import { z } from "astro:schema";


export const server = {
  /* action declarations (RPCs) */
   getGreeting: defineAction({
    input: z.object({
      name: z.string(),
    }),
    handler: async (input) => {
      console.log('Greeting sent to', input.name);
      return `Hello, ${input.name}!`
    }
  })

}