import { type FormEventHandler, useState, useEffect, useCallback, useMemo } from "react"
import { useForm } from "@inertiajs/react"
import axios from "axios"
import { Button } from "@/Components/ui/button"
import { Input } from "@/Components/ui/input"
import { Label } from "@/Components/ui/label"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/Components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select"
import { PlusCircle } from "lucide-react"
import type { ExamCourse, ExamGrade, ExamType } from "@/types"
import { ScrollArea } from "@/Components/ui/scroll-area"
import { router } from "@inertiajs/react"

const CreateExamCourseAlert = ({
  examTypes,
  examGrades,
}: {
  examTypes: ExamType[]
  examGrades: ExamGrade[]
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [chapters, setChapters] = useState<{ title: string; sequence_order: number }[]>([])
  const [examCourses, setExamCourses] = useState<ExamCourse[]>([])
  const [chapterErrors, setChapterErrors] = useState<{ [key: number]: string }>({})
  const [duplicateError, setDuplicateError] = useState<string | null>(null)

  const { data, setData, post, processing, errors, reset } = useForm({
    exam_type_id: "",
    course_name: "",
    exam_course_id: "",
    exam_chapters: chapters,
    stream: null as string | null,
  })

  const addChapter = useCallback(() => {
    setChapters((prev) => {
      if (prev.length < 50) {
        return [...prev, { title: "", sequence_order: prev.length + 1 }]
      }
      return prev
    })
  }, [])

  const removeChapter = useCallback((index: number) => {
    setChapters((prev) => prev.filter((_, i) => i !== index))
    // Also remove any errors for this chapter
    setChapterErrors((prev) => {
      const newErrors = { ...prev }
      delete newErrors[index]
      return newErrors
    })
  }, [])

  const updateChapter = useCallback((index: number, field: string, value: string) => {
    setChapters((prev) => {
      const newChapters = [...prev]
      newChapters[index] = { ...newChapters[index], [field]: value }
      return newChapters
    })

    // Clear error for this chapter if it now has a value
    if (field === "title" && value.trim()) {
      setChapterErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[index]
        return newErrors
      })
    }
  }, [])

  useEffect(() => {
    setData("exam_chapters", chapters)
  }, [chapters, setData])

  const formatCourseTitle = (title: string): string => {
    if (!title) return ""

    // List of words that should not be capitalized (prepositions, articles, conjunctions)
    const lowercaseWords = [
      "a",
      "an",
      "the",
      "and",
      "but",
      "or",
      "for",
      "nor",
      "on",
      "at",
      "to",
      "by",
      "from",
      "in",
      "of",
      "with",
      "about",
      "as",
      "into",
      "like",
      "through",
      "after",
      "over",
      "between",
      "against",
      "during",
    ]

    // Split the title into words
    const words = title.toLowerCase().split(" ")

    // Capitalize each word unless it's in the lowercaseWords list (except for the first word)
    return words
      .map((word, index) => {
        // Always capitalize the first word
        if (index === 0) {
          return word.charAt(0).toUpperCase() + word.slice(1)
        }

        // Don't capitalize words in the lowercaseWords list
        if (lowercaseWords.includes(word)) {
          return word
        }

        // Capitalize other words
        return word.charAt(0).toUpperCase() + word.slice(1)
      })
      .join(" ")
  }

  const fetchExamCourses = useCallback(
    async (examTypeId: string, stream: string | null) => {
      try {
        // Only pass stream if the exam type is ESSLCE
        const isESSLCE = examTypes.find((type) => type.id.toString() === examTypeId)?.name === "ESSLCE"
        const response = await axios.get(`/api/exam-courses-create/${examTypeId}`, {
          params: isESSLCE ? { stream } : {},
        })
        setExamCourses(response.data)
      } catch (error) {
        console.error("Error fetching exam courses:", error)
      }
    },
    [examTypes],
  )

  const uniqueExamCourses = useMemo(() => {
    // Create a map to track unique course names (case insensitive)
    const courseMap = new Map()

    examCourses.forEach((course) => {
      const lowerCaseName = course.course_name.toLowerCase()
      // Only add the first occurrence of each course name
      if (!courseMap.has(lowerCaseName)) {
        courseMap.set(lowerCaseName, course)
      }
    })

    // Convert the map values back to an array
    return Array.from(courseMap.values())
  }, [examCourses])

  const showExamGrade = useMemo(() => {
    const selectedExamType = examTypes.find((type) => type.id.toString() === data.exam_type_id)
    return selectedExamType && ["6th Grade Ministry", "8th Grade Ministry", "ESSLCE"].includes(selectedExamType.name)
  }, [data.exam_type_id, examTypes])

  const getFilteredExamGrades = useMemo(() => {
    const selectedExamType = examTypes.find((type) => type.id.toString() === data.exam_type_id)
    if (!selectedExamType) return []

    switch (selectedExamType.name) {
      case "6th Grade Ministry":
        return examGrades.filter((grade) => [5, 6].includes(grade.grade))
      case "8th Grade Ministry":
        return examGrades.filter((grade) => [7, 8].includes(grade.grade))
      case "ESSLCE":
        return examGrades.filter((grade) => grade.grade >= 9 && grade.grade <= 12)
      default:
        return []
    }
  }, [data.exam_type_id, examTypes, examGrades])

  useEffect(() => {
    if (data.exam_type_id) {
      fetchExamCourses(data.exam_type_id, data.stream)
    } else {
      setExamCourses([])
    }
  }, [data.exam_type_id, data.stream, fetchExamCourses])

  // Validate chapters before submission
  const validateChapters = useCallback(() => {
    const newErrors: { [key: number]: string } = {}
    let isValid = true

    // Only validate if there are chapters
    if (chapters.length > 0) {
      chapters.forEach((chapter, index) => {
        if (!chapter.title.trim()) {
          newErrors[index] = "Chapter title cannot be empty"
          isValid = false
        }
      })
    }

    setChapterErrors(newErrors)
    return isValid
  }, [chapters])

  const submit: FormEventHandler = (e) => {
    e.preventDefault()

    // Reset duplicate error
    setDuplicateError(null)

    // First validate chapters
    if (!validateChapters()) {
      return // Stop submission if validation fails
    }

    // Check for duplicate course name
    if (data.course_name) {
      const normalizedNewName = data.course_name.toLowerCase()
      const duplicateCourse = examCourses.find((course) => course.course_name.toLowerCase() === normalizedNewName)

      if (duplicateCourse) {
        setDuplicateError("This course name already exists. Please choose a different name.")
        return // Stop submission
      }
    }

    // Filter out any empty chapters before submission (as an extra precaution)
    const filteredChapters = chapters.filter((chapter) => chapter.title.trim() !== "")
    setData("exam_chapters", filteredChapters)

    router.post(
      route("exam-courses.store"),
      {
        ...data,
        exam_chapters: filteredChapters,
      },
      {
        onSuccess: () => {
          setIsOpen(false)
          reset()
          setChapters([])
          setChapterErrors({})
        },
        onError: (errors) => {
          console.log("validation errors:", errors)
        },
      },
    )
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className="p-2 text-xs" onClick={() => setIsOpen(true)}>
          <PlusCircle className="w-5 h-5 mr-2" /> Add Exam Course/Chapters
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent className="max-w-[95vw] w-full sm:max-w-[500px] max-h-[90vh] flex flex-col p-0">
        <AlertDialogHeader className="p-6 pb-0">
          <AlertDialogTitle>Create Courses/Chapters</AlertDialogTitle>
          <AlertDialogDescription>Add exam course details and chapters</AlertDialogDescription>
        </AlertDialogHeader>

        <ScrollArea className="flex-grow px-6 overflow-y-auto">
          <div className=" pt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="exam_type_id">Exam Type</Label>
              <Select
                value={data.exam_type_id}
                onValueChange={(value) => {
                  setData("exam_type_id", value)
                  setData("exam_course_id", "")
                  setData("stream", null)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Exam Type" />
                </SelectTrigger>
                <SelectContent>
                  {examTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id.toString()}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.exam_type_id && <p className="text-red-500 text-sm">{errors.exam_type_id}</p>}
            </div>

            {data.exam_type_id &&
              examTypes.find((type) => type.id.toString() === data.exam_type_id)?.name === "ESSLCE" && (
                <div className="space-y-2">
                  <Label htmlFor="stream">Stream (Optional)</Label>
                  <Select
                    value={data.stream || ""}
                    onValueChange={(value) => setData("stream", value === "null" ? null : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Stream" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="null">None</SelectItem>
                      <SelectItem value="natural">Natural</SelectItem>
                      <SelectItem value="social">Social</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.stream && <p className="text-red-500 text-sm">{errors.stream}</p>}
                </div>
              )}

            <div className="space-y-2">
              <Label htmlFor="course_name">Course Name</Label>
              <Input
                id="course_name"
                value={data.course_name}
                onChange={(e) => {
                  const formattedName = formatCourseTitle(e.target.value)
                  setData("course_name", formattedName)
                  // Clear duplicate error when user types
                  if (duplicateError) setDuplicateError(null)
                }}
                placeholder="Enter course name"
                className={duplicateError ? "border-red-500" : ""}
              />
              {duplicateError && <p className="text-red-500 text-sm">{duplicateError}</p>}
              {errors.course_name && <p className="text-red-500 text-sm">{errors.course_name}</p>}
            </div>
          </div>
        </ScrollArea>

        <div className="flex justify-end space-x-2 p-6 pt-2 border-t">
          <AlertDialogCancel
            onClick={() => {
              setIsOpen(false)
              reset()
              setChapters([])
              setChapterErrors({})
            }}
          >
            Cancel
          </AlertDialogCancel>
          <Button type="button" disabled={processing || Object.keys(chapterErrors).length > 0} onClick={submit}>
            Create
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default CreateExamCourseAlert
