import { useState } from "react"
import { useForm } from "@inertiajs/react" 
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/Components/ui/dialog"
import { Button } from "@/Components/ui/button"
import { Input } from "@/Components/ui/input"
import { Label } from "@/Components/ui/label"
import InputError from "@/Components/InputError"

interface FileContentDialogProps {
  isOpen: boolean
  onClose: () => void
  contentId: number
}

export default function FileContentDialog({ isOpen, onClose, contentId }: FileContentDialogProps) {

  const [fileSizeError, setFileSizeError] = useState<string | null>(null)

  const { data, setData, post, processing, errors, reset, progress } = useForm({
    title: "",
    file_url: null as File | null,
    content_id: contentId,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    post(route("file-contents.store"), {
      onSuccess: () => {
        reset()
        onClose()
      },
      onError: (errors) => {
        console.log('Validation errors:', errors);
      },
    })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (file.size > 50 * 1024 * 1024) {
        setFileSizeError("File size must not exceed 50MB")
        setData("file_url", null)
       
      } else {
        setFileSizeError(null)
        setData("file_url", file)
        const reader = new FileReader()
      }
    } else {
      setData("file_url", null)
      setFileSizeError(null)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add File Content</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div >
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                value={data.title}
                onChange={(e) => setData("title", e.target.value)}
                className="col-span-3"
              />
              <InputError message={errors.title} className="mt-2" />
            </div>
            <div >
              <Label htmlFor="file_url" className="text-right">
                File
              </Label>
              <Input
                id="file_url"
                type="file"
                onChange={handleFileChange}
                className="col-span-3"
              />

            {fileSizeError && <p className="text-red-500 text-sm">{fileSizeError}</p>}
            {progress && (
              <progress value={progress.percentage} max="100" className="w-full h-2 bg-gray-200 rounded-lg mt-2">
                {progress.percentage}%
              </progress>
            )}
              <InputError className="mt-2" message={errors.file_url} />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={processing}>
              Add Content
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

