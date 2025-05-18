import { useForm } from "@inertiajs/react"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/Components/ui/alert-dialog"
import { Button } from "@/Components/ui/button"
import { type FormEventHandler, useState, useEffect } from "react"
import { PlusCircle } from "lucide-react"
import { ScrollArea } from "@/Components/ui/scroll-area"
import InputError from "@/Components/InputError"
import type { Exam, ExamChapter, ExamGrade } from "@/types"
import InputLabel from "@/Components/InputLabel"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select"
import axios from "axios"
import QuestionForm from "./QuestionForm"

interface CreateExamQuestionAlertProps {
  exam: Exam
  exam_grades?: ExamGrade[]
}

const CreateExamQuestionAlert = ({ exam, exam_grades }: CreateExamQuestionAlertProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [examChapters, setExamChapters] = useState<ExamChapter[]>([])

  const { data, setData, post, processing, errors, reset, clearErrors, setError } = useForm<
    {
      exam_id: string
      exam_type_id: string
      exam_year_id: string
      exam_course_id: string
      exam_grade_id: string
      exam_chapter_id: string | null
      questions: {
        question_text: string
        question_image_url: string | null
        image_explanation_url: string | null
        text_explanation: string
        video_explanation_url: string
        options: string[]
        answer: string[]
      }[]
    } & Record<string, any>
  >({
    exam_id: exam.id.toString(),
    exam_type_id: exam.exam_type_id.toString(),
    exam_year_id: exam.exam_year_id.toString(),
    exam_course_id: exam.exam_course_id?.toString() || "",
    exam_grade_id: "",
    exam_chapter_id: null,
    questions: [
      {
        question_text: "",
        text_explanation: "",
        video_explanation_url: "",
        question_image_url: "",
        image_explanation_url: "",
        options: [],
        answer: [],
      },
    ],
  })

  const showExamGrade = () => {
    const excludedExamTypes = ["NGAT", "EXIT", "SAT", "UAT", "EXAM"]

    return !excludedExamTypes.includes(exam.exam_type?.name || "")
  }

  const getFilteredExamGrades = () => {
    const selectedExamType = showExamGrade()
    if (!selectedExamType) return

    switch (exam.exam_type?.name) {
      case "6th Grade Ministry":
        return exam_grades?.filter((grade) => [5, 6].includes(grade.grade))
      case "8th Grade Ministry":
        return exam_grades?.filter((grade) => [7, 8].includes(grade.grade))
      case "ESSLCE":
        return exam_grades?.filter((grade) => grade.grade >= 9 && grade.grade <= 12)
      default:
        return []
    }
  }

  useEffect(() => {
    if (!isOpen) {
      resetForm()
    }
  }, [isOpen])

  const resetForm = () => {
    reset()
    setExamChapters([])
    clearErrors()
  }

  const fetchExamChapters = async (courseId: string, gradeId?: string) => {
    try {
      let url = `/api/exam-courses-chapters-questions/${courseId}`
      // Only append grade ID to the URL if it exists and we're showing exam grades
      if (gradeId && showExamGrade()) {
        url += `/${gradeId}`
      }

      const response = await axios.get(url)
      setExamChapters(response.data)
    } catch (error) {
      console.error("Error fetching exam chapters:", error)
    }
  }

  const handleExamGradeChange = (value: string) => {
    setData({ ...data, exam_grade_id: value })

    // Only fetch if there's a selected course ID
    if (data.exam_course_id) {
      fetchExamChapters(data.exam_course_id, value)
    }
  }

  const handleChapterChange = (value: string) => {
    // If "none" is selected, set exam_chapter_id to null
    if (value === "none") {
      setData("exam_chapter_id", null)
    } else {
      setData("exam_chapter_id", value)
    }
  }

  useEffect(() => {
    if (data.exam_course_id) {
      // If we don't show exam grade, fetch chapters without grade ID
      // Otherwise, only fetch if grade ID is selected
      if (!showExamGrade()) {
        fetchExamChapters(data.exam_course_id)
      } else if (data.exam_grade_id) {
        fetchExamChapters(data.exam_course_id, data.exam_grade_id)
      }
    }
  }, [data.exam_course_id, data.exam_grade_id])

  const addQuestion = () => {
    // Restrict to maximum 10 questions
    if (data.questions.length >= 10) return
    setData("questions", [
      ...data.questions,
      {
        question_text: "",
        text_explanation: "",
        question_image_url: null,
        video_explanation_url: "",
        options: [],
        answer: [],
        image_explanation_url: null,
      },
    ])
  }

  const removeQuestion = (index: number) => {
    setData(
      "questions",
      data.questions.filter((_, i) => i !== index),
    )
  }

  const updateQuestion = (index: number, field: string, value: any) => {
    const updatedQuestions = [...data.questions]
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value }
    setData("questions", updatedQuestions)
  }

  const validateForm = (): boolean => {
    let isValid = true
    clearErrors()

    if (showExamGrade() && !data.exam_grade_id) {
      setError("exam_grade_id", "Exam grade is required")
      isValid = false
    }

    // Check if chapter is required (when exam type is not in the excluded list)
    const excludedExamTypes = ["NGAT", "EXIT", "SAT", "UAT", "EXAM"]
    const isChapterRequired = !excludedExamTypes.includes(exam.exam_type?.name || "")

    if (isChapterRequired && (!data.exam_chapter_id || data.exam_chapter_id === "none")) {
      setError(
        "exam_chapter_id",
        "Exam chapter is required. Create it in the exam course management first if it doesn't exist.",
      )
      isValid = false
    }

    data.questions.forEach((question, index) => {
      if (!question.question_text) {
        setError(`questions.${index}.text_explanation`, "Question text is required")
        isValid = false
      }
      // if (!question.text_explanation) {
      //   setError(`questions.${index}.text_explanation`, "Explanation is required")
      //   isValid = false
      // }
      if (question.options.length < 2) {
        setError(`questions.${index}.options`, "At least two options are required")
        isValid = false
      }
      if (question.options.some((option) => option.trim() === "")) {
        setError(`questions.${index}.options`, "All options must be non-empty")
        isValid = false
      }
      if (question.answer.length === 0) {
        setError(`questions[${index}].answer`, "At least one correct answer must be selected")
        isValid = false
      }
    })

    return isValid
  }

  const submit: FormEventHandler = (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    post(route("exam-questions.store"), {
      preserveScroll: true,
      preserveState: false,
      onSuccess: () => {
        setIsOpen(false)
        resetForm()
      },
      onError: (errors: Record<string, string>) => {
        console.log("Validation errors:", errors)
      },
    })
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Exam Questions
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="sm:max-w-[900px] h-[90vh] p-0 flex flex-col">
        <AlertDialogHeader className="p-6 pb-0">
          <AlertDialogTitle>Create New Exam Questions</AlertDialogTitle>
          <AlertDialogDescription>Fill in the details for the new exam questions.</AlertDialogDescription>
        </AlertDialogHeader>

        <ScrollArea className="flex-grow px-6 overflow-y-auto overflow-x-auto">
          <form onSubmit={submit} className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {showExamGrade() && data.exam_year_id && (
                <div>
                  <InputLabel htmlFor="exam-grade" value="Exam Grade" />
                  <Select value={data.exam_grade_id} onValueChange={handleExamGradeChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an exam grade" />
                    </SelectTrigger>
                    <SelectContent>
                      {getFilteredExamGrades()?.map((examGrade) => (
                        <SelectItem key={examGrade.id} value={examGrade.id.toString()}>
                          Grade - {examGrade.grade}
                          {examGrade.stream ? ` - ${examGrade.stream}` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <InputError message={errors.exam_grade_id} className="mt-2" />
                </div>
              )}

              {data.exam_course_id && (
                <div>
                  <InputLabel
                    htmlFor="exam-chapter"
                    value={
                      !["NGAT", "EXIT", "SAT", "UAT", "EXAM"].includes(exam.exam_type?.name || "")
                        ? "Exam Chapter"
                        : "Exam Chapter (Optional)"
                    }
                  />
                  <Select
                    value={data.exam_chapter_id === null ? "none" : data.exam_chapter_id}
                    onValueChange={handleChapterChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an exam chapter" />
                    </SelectTrigger>
                    <SelectContent>
                      {["NGAT", "EXIT", "SAT", "UAT", "EXAM"].includes(exam.exam_type?.name || "") && (
                        <SelectItem value="none">None (No specific chapter)</SelectItem>
                      )}
                      {examChapters?.map((chapter) => (
                        <SelectItem key={chapter.id} value={chapter.id.toString()}>
                          {chapter.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {["NGAT", "EXIT", "SAT", "UAT", "EXAM"].includes(exam.exam_type?.name || "") && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Select "None" if the question is not associated with a specific chapter.
                    </p>
                  )}
                  <InputError message={errors.exam_chapter_id} className="mt-2" />
                </div>
              )}
            </div>

            <div className="space-y-4">
              {data.questions.map((question, index) => (
                <QuestionForm
                  key={index}
                  index={index}
                  question={question}
                  updateQuestion={updateQuestion}
                  removeQuestion={removeQuestion}
                  errors={
                    Object.fromEntries(Object.entries(errors).filter(([_, v]) => v !== undefined)) as Record<
                      string,
                      string
                    >
                  }
                />
              ))}
            </div>

            <Button type="button" variant="outline" onClick={addQuestion}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Another Question
            </Button>
            {data.questions.length >= 10 && (
              <p className="text-sm text-muted-foreground mt-1">Maximum limit of 10 questions reached.</p>
            )}
          </form>
        </ScrollArea>

        <AlertDialogFooter className="px-6 py-4">
          <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={processing} onClick={submit}>
            Create Questions
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default CreateExamQuestionAlert
