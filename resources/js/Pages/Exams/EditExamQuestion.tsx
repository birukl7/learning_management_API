import type React from "react"
import { useState, useEffect, useCallback, useMemo } from "react"
import { Head, useForm, usePage } from "@inertiajs/react"
import axios from "axios"
import { Button } from "@/Components/ui/button"
import { Textarea } from "@/Components/ui/textarea"
import { Label } from "@/Components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/Components/ui/radio-group"
import { Checkbox } from "@/Components/ui/checkbox"
import InputError from "@/Components/InputError"
import { Input } from "@/Components/ui/input"
import type { ExamChapter, ExamGrade, ExamQuestion, Exam } from "@/types"
import InputLabel from "@/Components/InputLabel"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select"
import Authenticated from "@/Layouts/AuthenticatedLayout"
import { X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card"
import BackLink from "@/Components/BackLink"
import { SessionToast } from "@/Components/SessionToast"
import { router } from "@inertiajs/react"

interface EditExamQuestionAlertProps {
  exam_grades: ExamGrade[]
  exam: Exam
  question: ExamQuestion
}

const EditExamQuestion = ({ exam_grades, question, exam }: EditExamQuestionAlertProps) => {
  // console.log(question)
  const [options, setOptions] = useState<string[]>(JSON.parse(question.options))
  const [correctAnswer, setCorrectAnswer] = useState<string | string[]>(JSON.parse(question.answer))
  const [isMultipleChoice, setIsMultipleChoice] = useState(Array.isArray(JSON.parse(question.answer)))
  const [questionImagePreview, setQuestionImagePreview] = useState<string | null>(question.question_image_url)
  const [imageExplanationPreview, setImageExplanationPreview] = useState<string | null>(question.image_explanation_url)
  const [examChapters, setExamChapters] = useState<ExamChapter[]>([])

  const { data, setData, post, processing, errors, reset, clearErrors, setError } = useForm<{
    _method: string
    exam_id: string
    exam_type_id: string
    exam_year_id: string
    exam_course_id: string
    exam_grade_id: string
    exam_chapter_id: string | null
    question_text: string
    video_explanation_url: string
    question_image_url: string | null | File
    image_explanation_url: string | null | File
    text_explanation: string
    options: string[]
    answer: string[]
  }>({
    _method: "PATCH",
    exam_id: question.exam_id.toString(),
    exam_type_id: question.exam_type_id?.toString(),
    exam_year_id: question.exam_year_id?.toString(),
    exam_course_id: question.exam_course_id?.toString(),
    exam_grade_id: question.exam_grade_id?.toString() || "",
    exam_chapter_id: question.exam_chapter_id?.toString() || "",
    question_text: question.question_text,
    video_explanation_url: question.video_explanation_url || "",
    question_image_url: null as File | null,
    image_explanation_url: null as File | null,
    text_explanation: question.text_explanation,
    options: JSON.parse(question.options),
    answer: JSON.parse(question.answer),
  })

  const fetchExamChapters = useCallback(async (examCourseId: string) => {
    try {
      const response = await axios.get(`/api/exam-chapters/${examCourseId}`)
      setExamChapters(response.data)
    } catch (error) {
      console.error("Error fetching exam chapters:", error)
    }
  }, [])

  const showExamGrade = () => {
    const excludedExamTypes = ["NGAT", "EXIT", "SAT", "UAT", "EXAM"]
    return !excludedExamTypes.includes(exam.exam_type?.name || "")
  }

  const getFilteredExamGrades = useMemo(() => {
    const selectedExamType = showExamGrade()
    if (!selectedExamType) return []

    switch (exam.exam_type?.name) {
      case "6th Grade Ministry":
        return exam_grades?.filter((grade) => [5, 6].includes(grade.grade)) || []
      case "8th Grade Ministry":
        return exam_grades?.filter((grade) => [7, 8].includes(grade.grade)) || []
      case "ESSLCE":
        return exam_grades?.filter((grade) => grade.grade >= 9 && grade.grade <= 12) || []
      default:
        return []
    }
  }, [])

  useEffect(() => {
    if (data.exam_course_id) {
      fetchExamChapters(data.exam_course_id)
    }
  }, [data.exam_course_id, fetchExamChapters])

  const handleExamGradeChange = useCallback(
    (value: string) => {
      setData((prevData) => ({
        ...prevData,
        exam_grade_id: value,
      }))
    },
    [setData],
  )

  const addOption = useCallback(() => {
    setOptions((prevOptions) => {
      // Restrict to maximum 8 options
      if (prevOptions.length >= 8) return prevOptions

      const newOptions = [...prevOptions, ""]
      setData("options", newOptions)
      return newOptions
    })
  }, [setData])

  const removeOption = useCallback(
    (index: number) => {
      setOptions((prevOptions) => {
        const newOptions = prevOptions.filter((_, i) => i !== index)
        setData("options", newOptions)
        return newOptions
      })
    },
    [setData],
  )

  const updateOption = useCallback(
    (index: number, value: string) => {
      setOptions((prevOptions) => {
        const newOptions = [...prevOptions]
        newOptions[index] = value
        setData("options", newOptions)
        return newOptions
      })
    },
    [setData],
  )

  const handleImageChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, field: "question_image_url" | "image_explanation_url") => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0]
        setData(field, file)
        const reader = new FileReader()
        reader.onload = (event) => {
          const base64String = event.target?.result as string
          if (field === "question_image_url") {
            setQuestionImagePreview(base64String)
          } else {
            setImageExplanationPreview(base64String)
          }
        }
        reader.readAsDataURL(file)
      }
    },
    [setData],
  )

  const validateForm = useCallback((): boolean => {
    let isValid = true
    clearErrors()

    if (!data.exam_type_id) {
      setError("exam_type_id", "Exam type is required")
      isValid = false
    }

    if (
      ["6th Grade Ministry", "8th Grade Ministry", "ESSCLE"].includes(exam.exam_type?.name ?? "") &&
      !data.exam_chapter_id
    ) {
      setError("exam_chapter_id", "Exam chapter is required")
      isValid = false
    }

    if (options.length < 2) {
      setError("options", "At least two options are required")
      isValid = false
    }

    if (options.some((option) => option.trim() === "")) {
      setError("options", "All options must be non-empty")
      isValid = false
    }

    if (isMultipleChoice && (correctAnswer as string[]).length === 0) {
      setError("answer", "At least one correct answer must be selected")
      isValid = false
    }

    if (!isMultipleChoice && (correctAnswer as string).trim() === "") {
      setError("answer", "A correct answer must be selected")
      isValid = false
    }

    return isValid
  }, [clearErrors, data.text_explanation, options, isMultipleChoice, correctAnswer, setError])

  const submit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()

      if (!validateForm()) {
        return
      }

      router.patch(route("exam-questions.update", question.id), data, {
        preserveScroll: true,
        preserveState: false,
        onSuccess: () => {
          // Handle success (e.g., show a success message)
        },
        onError: (errors) => {
          console.log("Validation errors:", errors)
        },
      })
    },
    [validateForm, data, question.id],
  )

  const memoizedExamGrades = useMemo(() => exam_grades, [exam_grades])
  const { flash } = usePage().props as unknown as { flash: { success?: string; error?: string } }

  const handleChapterChange = (value: string) => {
    const excludedExamTypes = ["NGAT", "EXIT", "SAT", "UAT", "EXAM"]
    const isExcludedType = excludedExamTypes.includes(exam.exam_type?.name || "")

    // Only allow "none" for excluded exam types
    if (value === "none" && isExcludedType) {
      setData("exam_chapter_id", null)
    } else if (value === "none" && !isExcludedType) {
      // Don't allow "none" for non-excluded types
      return
    } else {
      setData("exam_chapter_id", value)
    }
  }

  return (
    <Authenticated
      header={
        <div className="flex justify-between">
          <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Edit Exam Question</h2>
          <BackLink href={route("exam-details.show", exam.id)} text={"Back"} />
        </div>
      }
    >
      <Head title="Edit Exam Question" />

      {/* {flash.success && (<SessionToast message={flash.success }  />)} */}
      {flash.error && <SessionToast message={flash.error} />}

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle>Edit Exam Question</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={submit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    {showExamGrade() && data.exam_year_id && (
                      <div>
                        <InputLabel htmlFor="exam-grade" value="Exam Grade" />
                        <Select value={data.exam_grade_id} onValueChange={handleExamGradeChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an exam grade" />
                          </SelectTrigger>
                          <SelectContent>
                            {memoizedExamGrades.map((examGrade) => (
                              <SelectItem key={examGrade.id} value={examGrade.id.toString()}>
                                Grade {examGrade.grade}
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
                            ["NGAT", "EXIT", "SAT", "UAT", "EXAM"].includes(exam.exam_type?.name || "")
                              ? "Exam Chapter (optional)"
                              : "Exam Chapter"
                          }
                        />
                        <Select
                          value={data.exam_chapter_id == null ? "none" : data.exam_chapter_id}
                          onValueChange={handleChapterChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select an exam chapter" />
                          </SelectTrigger>
                          <SelectContent>
                            {["NGAT", "EXIT", "SAT", "UAT", "EXAM"].includes(exam.exam_type?.name || "") && (
                              <SelectItem value="none">None (No specific chapter)</SelectItem>
                            )}
                            {examChapters.map((chapter) => (
                              <SelectItem key={chapter.id} value={chapter.id.toString()}>
                                {chapter.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {["NGAT", "EXIT", "SAT", "UAT", "EXAM"].includes(exam.exam_type?.name || "") && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Leave empty if the question is not associated with a specific chapter.
                          </p>
                        )}
                        <InputError message={errors.exam_chapter_id} className="mt-2" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="question_text">Question Text</Label>
                      <Textarea
                        id="question_text"
                        value={data.question_text}
                        onChange={(e) => setData("question_text", e.target.value)}
                        required
                      />
                      <InputError message={errors.question_text} />
                    </div>

                    <div>
                      <Label htmlFor="question_image_url">Question Image (optional)</Label>
                      <Input
                        id="question_image_url"
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChange(e, "question_image_url")}
                      />
                      {questionImagePreview && (
                        <div className="mt-2">
                          <img
                            src={questionImagePreview || "/placeholder.svg"}
                            alt="Question Preview"
                            className="w-32 h-32 object-cover rounded-md"
                          />
                        </div>
                      )}
                      <InputError message={errors.question_image_url} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="image_explanation_url">Image Explanation (optional)</Label>
                      <Input
                        id="image_explanation_url"
                        name="image_explanation_url"
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChange(e, "image_explanation_url")}
                      />
                      {imageExplanationPreview && (
                        <img
                          src={imageExplanationPreview || "/placeholder.svg"}
                          alt="Explanation Preview"
                          className="mt-2 max-w-xs"
                        />
                      )}
                      <InputError message={errors.image_explanation_url} />
                    </div>

                    <div>
                      <Label htmlFor="text_explanation">Explanation (optional)</Label>
                      <Textarea
                        id="text_explanation"
                        value={data.text_explanation}
                        onChange={(e) => setData("text_explanation", e.target.value)}
                      />
                      <InputError message={errors.text_explanation} />
                    </div>

                    <div>
                      <Label htmlFor="video_explanation_url">Video Explanation URL (optional)</Label>
                      <Input
                        id="video_explanation_url"
                        type="url"
                        value={data.video_explanation_url}
                        onChange={(e) => setData("video_explanation_url", e.target.value)}
                      />
                      <InputError message={errors.video_explanation_url} />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Options</Label>
                  <div className="space-y-2">
                    {options.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Textarea
                          value={option}
                          className=" break-words"
                          onChange={(e) => updateOption(index, e.target.value)}
                          placeholder={`Option ${index + 1}`}
                          required
                        />
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeOption(index)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button type="button" variant="outline" onClick={addOption} disabled={options.length >= 8}>
                      Add Option
                    </Button>
                    {options.length >= 8 && (
                      <p className="text-xs text-muted-foreground mt-1">Maximum limit of 8 options reached.</p>
                    )}
                  </div>
                  <InputError message={errors.options} />
                </div>

                <div className="space-y-4">
                  <Label>Answer Type</Label>
                  <RadioGroup
                    value={isMultipleChoice ? "multiple" : "single"}
                    onValueChange={(value) => {
                      setIsMultipleChoice(value === "multiple")
                      setCorrectAnswer(value === "multiple" ? [] : "")
                    }}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="single" id="single" />
                      <Label htmlFor="single">Single Choice</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="multiple" id="multiple" />
                      <Label htmlFor="multiple">Multiple Choice</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-4">
                  <Label>Correct Answer(s)</Label>
                  {isMultipleChoice ? (
                    options.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Checkbox
                          id={`answer-${index}`}
                          checked={(correctAnswer as string[]).includes(option)}
                          onCheckedChange={(checked) => {
                            const newAnswer = checked
                              ? [...(correctAnswer as string[]), option]
                              : (correctAnswer as string[]).filter((a) => a !== option)
                            setCorrectAnswer(newAnswer)
                            setData("answer", newAnswer)
                          }}
                        />
                        <Label htmlFor={`answer-${index}`}>{option}</Label>
                      </div>
                    ))
                  ) : (
                    <RadioGroup
                      value={correctAnswer as string}
                      onValueChange={(value) => {
                        setCorrectAnswer(value)
                        setData("answer", [value])
                      }}
                    >
                      {options.map((option, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <RadioGroupItem value={option} id={`answer-${index}`} />
                          <Label htmlFor={`answer-${index}`}>{option}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}
                  <InputError message={errors.answer} />
                </div>

                <div>
                  <Button type="submit" disabled={processing}>
                    Update Question
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </Authenticated>
  )
}

export default EditExamQuestion
