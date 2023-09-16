import { FastifyInstance } from "fastify";
import { fastifyMultipart } from "@fastify/multipart";
import path from "node:path";
import { randomUUID } from "node:crypto";
import fs from "node:fs";
import { pipeline } from "node:stream";
import { promisify } from "node:util";
import { prisma } from "../lib/prisma";

const pump = promisify(pipeline)

export async function uploadVideos(app: FastifyInstance) {
  app.register(fastifyMultipart, {
    limits: {
        fileSize: 1_048_576 * 25 // 25mb
    }
  })

  app.post("/upload", async (request, reply) => {
    const data = await request.file()

    if(!data) {
      return reply.status(400).send({
        error: "No file uploaded"
      })
    }


    const extension = path.extname(data.filename)

    if(extension !== ".mp3") {
      return reply.status(400).send({
        error: "Invalid file type"
      })
    }

    const fileBaseName = path.basename(data.filename, extension)
    const fileName = `${fileBaseName}-${randomUUID()}${extension}`

    const filePath = path.resolve(__dirname, "../../tmp", fileName)

    await pump(data.file, fs.createWriteStream(filePath))

    const video = await prisma.video.create({
      data: {
        name: data.filename,
        path: filePath,
      }
      
    })

    return {
      video
    }
    
  })
}
