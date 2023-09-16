import { FileVideo2, Upload } from "lucide-react";
import { Separator } from "./ui/separator";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { ChangeEvent, FormEvent, useMemo, useRef, useState } from "react";
import { getFFmpeg } from "@/lib/ffmpeg";
import { fetchFile } from '@ffmpeg/util' 
import { Progress } from "./ui/progress";
import { api } from "@/lib/api";

type Status = 'waiting' | 'converting' | 'uploading' | 'transcriting' | 'finished'

const StatusMessage = {
  waiting: 'Aguardando',
  converting: 'Convertendo Video',
  uploading: 'Enviando Video',
  transcriting: 'Transcrevendo Video',
  finished: 'Finalizado',

}

export const VideoInput = ({ onVideoUplodad }:
  {
    onVideoUplodad: (videoId: string) => void
  }) => {
  const [p, setP] = useState<number | null>(null)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const promptInputRef = useRef<HTMLTextAreaElement>(null)
  const [status, setStatus] = useState<Status>('waiting')


  async function converVideoToAudio(video: File) {
    console.log('Converting Video to Audio .... ')

    const ffmeg = await getFFmpeg()

    console.log('Writting file .... ')
    await ffmeg.writeFile('input.mp4', await fetchFile(video))

    ffmeg.
    on('progress', ({ progress }) => {
      setP(Math.round(progress * 100))
    })


    await ffmeg.exec([
      '-i',
      'input.mp4',
      '-map',
      '0:a',
      '-b:a',
      '20k',
      '-acodec',
      'libmp3lame',
      'output.mp3',
    ])

    const data = await ffmeg.readFile('output.mp3')

    const audioFileBlob = new Blob([data], { type: 'audio/mpeg' })
    const audioFile = new File([audioFileBlob], 'output.mp3', { type: 'audio/mpeg' })

    console.log('Converting finished')

    return audioFile
    
  }

  async function handleUploadVideo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const prompt = promptInputRef.current?.value

    if (!videoFile) {
      return
    }

    // converter o video em audio
    setStatus('converting')
    const audioFile = await converVideoToAudio(videoFile)

    const formData = new FormData()
    formData.append('file', audioFile)
    formData.append('prompt', prompt || '')

    setStatus('uploading')
    const response = await api.post('/upload', formData)

    const videoId = response.data.video.id

    setStatus('transcriting')
    await api.post(`/videos/${videoId}/transcription`, {
      prompt,
    })

    setStatus('finished')
    onVideoUplodad(videoId)

  }

  function handleVideoChange(event: ChangeEvent<HTMLInputElement>) {
    const { files  } = event.currentTarget
    if (!files) {
      return
    }

    const selectFile = files[0]

    setVideoFile(selectFile)

  }

  const previewURl = useMemo(() => {
    if (!videoFile) {
      return null
    }

    return URL.createObjectURL(videoFile)

  },[videoFile])

  
  return (
    <>
    
    <form className="space-y-2 w-full" onSubmit={handleUploadVideo}>
        <label className="relative border w-full flex rounded-md aspect-video items-center justify-center text-muted-foreground cursor-pointer border-dashed text-sm flex-col gap-2 hover:bg-primary/10" htmlFor="video">
         {previewURl ? <video src={previewURl} controls={false} className="pointer-events-none animate-in fade-in absolute inset-0" /> : (
          <>
            <FileVideo2 className="w-4 h-4" />
            Carregar Video
          </>
         )}
        </label>
        <Progress value={p} max={100}  />
        <input type="file" id="video" accept="video/mp4" className="sr-only" onChange={handleVideoChange} />
        
        <Separator />
        <div className="space-y-2">
        <Label htmlFor="prompt">Prompt</Label>
        <Textarea ref={promptInputRef} disabled={!['waiting','finished'].includes(status)} id="prompt" className="h-20 resize-none  p-4 leading-relaxed" placeholder="Inclua palavras chaves mencioandas separadas por virgula" />

        </div>
        

        <Button type='submit' data-success={status === 'finished'} 
         className="w-full data-[success=true]:bg-emerald-400" disabled={!['waiting','finished'].includes(status)}>
          {status === 'waiting' ? (
            <>
              Carregar Video 
              <Upload className="w-4 h-4 ml-2" />
            </>
          ): (
            <>
            <div className="flex items-center justify-center">
              {StatusMessage[status]} 
            </div>
            </>
          )}
        </Button>
       

    </form>
    </>
  )
}

