

import { api } from '@/lib/api'
import { useState, useEffect } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'

type Prompt = {
  id: string,
  template: string,
  title: string

}

export default function PromptSelect({ onLoad}: {
  onLoad: (template: string) => void
}) {
  const [prompts, setPrompts] = useState<Prompt[]>([])

  useEffect(() => {
    async function fetchPrompts() {
      const res = await api.get('/prompts')
      setPrompts(res.data.prompts)
    }

    fetchPrompts()

  },[])

  function handleOnSelectPrompt(id: string): void {
    const template = prompts.find(prompt => prompt.id === id)?.template || ''
    onLoad(template)
  }
  return (
    <>
    <Select onValueChange={handleOnSelectPrompt}>
      <SelectTrigger>
        <SelectValue placeholder="Selecione um prompt" />
      </SelectTrigger>
      <SelectContent>
        {prompts.map(({id, title}) => {
          return (
            <SelectItem key={id} value={id}>{title}</SelectItem>
          )
        })}
      </SelectContent>
    </Select>
    </>
  )
}
