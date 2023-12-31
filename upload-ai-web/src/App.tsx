import { Button } from "@/components/ui/button";
import {  Github, Wand2 } from 'lucide-react'
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "./components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select";
import { Slider } from "./components/ui/slider";
import { VideoInput } from "./components/vide-input";
import PromptSelect from "./components/prompt-select";
import { useState } from "react";
import { useCompletion } from 'ai/react'
 
export function App() {
  const [temperature, setTemperature] = useState<number>(0.5)
  const [videoId, setVideoId] = useState<string | null>(null)
  const {
    input,
    setInput,
    handleInputChange,
    handleSubmit,
    completion,
    isLoading

  } = useCompletion({
    api: 'http://localhost:3333/ai/complete',
    body: {
      videoId,
      temperature,
     
    },
    headers:{
      'Content-Type': 'application/json'
    }
  })
  
  return (
    <>
      <div className="min-h-screen flex flex-col">
        <div className="px-6 py-3 flex items-center justify-between border-b">
          <h1 className="text-xl font-bold">Upload.ai</h1>
          <div className="flex items-center gap-3">
             <span className="text-sm text-muted-foreground">Develop with love 💙 </span>
             <Separator orientation="vertical" className="h-6" />
             <Button variant="secondary">
               <Github className="w-4 h-4 mr-2" />
                Github
             </Button>
          </div>
        </div>
        
        

        <main className="flex-1 p-6 flex gap-6 p">
          <div className="flex flex-col flex-1 gap-4">
             <div className="grid grid-rows-2 gap-4 flex-1">
                <Textarea className="resize-none p-4 leading-relaxed" value={input} onChange={handleInputChange} placeholder="Inclua o prompt para a IA" />
                <Textarea value={completion} className="resize-none p-4 leading-relaxed" placeholder="Resultado gerado pela IA" readOnly />
             </div>
             <p className="text-sm text-muted-foreground">
              Lembre-se: vc pode utilizar a variavel <code className="text-violet-400">{'{transcription}'}</code> no seu prompt para adicionar o conteudo</p>
          </div>
          <aside className="w-80 space-y-6">
              <VideoInput onVideoUplodad={setVideoId}  />
              <Separator />
              <form className="space-y-2" onSubmit={handleSubmit}>
              <div className="space-y-2 ">
                  <Label htmlFor="modelo">Prompt</Label>
                  <PromptSelect onLoad={setInput} />
                 
                 </div>

                 <div className="space-y-2 ">
                   <Label htmlFor="modelo">Modelo</Label>
                   <Select disabled defaultValue="gpt3.5" >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                         <SelectItem value="gpt3.5">GPT 3.5 Turbo</SelectItem>
                      </SelectContent>
                   </Select>
                   <span className="text-muted-foreground block text-sm italic">Nao disponivel no momento</span>


                 </div>

                 <Separator />

                 <div className="space-y-4">
                   <label>Temperatura</label>

                   <Slider min={0} max={1} step={0.1} value={[temperature]} onValueChange={value => setTemperature(value[0])}  />

                   <span className="text-muted-foreground block text-sm italic leading-relaxed">Valores mais alto tendem a deixar o resultado mais variavel e nao tao acertivos</span>
                 </div>

                 <Separator />

                 <Button type="submit" className="w-full" disabled={isLoading}  >
                   Executar
                   <Wand2 className="w-4 h-4 ml-2" />
                 </Button>
              </form>
          </aside>
        </main>
      </div>
    </>
  )
}
 