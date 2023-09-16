import { fastify } from "fastify";  
import { getAllPrompts } from "./routes/get-all-prompts";
import { uploadVideos } from "./routes/upload-videos";
import { createTranscription } from "./routes/create-transcription";
import { generateAiCompletionRoute } from "./routes/generate-ai.competion";
import { fastifyCors } from '@fastify/cors'

const app = fastify();

app.get("/", async (request, reply) => {
   return { hello: "world" };
})

app.register(fastifyCors, {
  origin: '*',
})

app.register(getAllPrompts)
app.register(uploadVideos)
app.register(createTranscription)
app.register(generateAiCompletionRoute)

app.listen({
    port: 3333,
}).then((address) => {
    console.log(`Server is listening on ${address}`);
})