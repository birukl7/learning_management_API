import type React from "react"
import MainLayout from "@/Layouts/MainLayout"
import CreateExamQuestionAlert from "../Exam-Questions/CreateExamQuestionAlert"
import PermissionAlert from "@/Components/PermissionAlert"
import { PlusCircle, Search } from "lucide-react"
import type { Exam, ExamChapter, ExamQuestion, PaidExam } from "@/types"
import QuestionCard from "../Exams/QuestionCard"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select"
import { Link, useForm } from "@inertiajs/react"
import { useCallback, useEffect, useState } from "react"
import axios from "axios"
import { Input } from "@/Components/ui/input"
import BackLink from "@/Components/BackLink"
import { router } from "@inertiajs/react"
import ExamStatisticsDialog from "../Exams-New/exam-statistics-dialog"

interface IndexProps {
  exam: Exam
  exam_chapters: ExamChapter[]
  exam_grades: any[]
  exam_questions: {
    data: ExamQuestion[]
    links: Array<{
      url: string | null
      active: boolean
      label: string
    }>
  }
  filters: {
    search: string
    examChapter: string
    examGrade: string
  }
  canAddExamQuestions: boolean
  canUpdateExamQuestions: boolean
  canDeleteExamQuestions: boolean
  paidExams: PaidExam[]
}

const Index = ({
  canAddExamQuestions,
  canUpdateExamQuestions,
  canDeleteExamQuestions,
  exam,
  exam_questions,
  exam_grades,
  exam_chapters,
  filters,
  paidExams,
}: IndexProps) => {
  const { data, setData } = useForm({
    search: filters?.search || "",
    examGrade: filters?.examGrade || "",
    examChapter: filters?.examChapter || "",
  })

  const getChapterTitle = (id: number) => exam_chapters?.find((g) => g.id === id)?.title || ""

  const [filteredExamChapters, setFilteredExamChapters] = useState<ExamChapter[]>([])

  // Check if the current exam type is in the excluded list
  const isExcludedExamType = () => {
    const excludedExamTypes = ["NGAT", "EXIT", "SAT", "UAT", "EXAM"]
    return excludedExamTypes.includes(exam.exam_type?.name || "")
  }

  useEffect(() => {
    if (isExcludedExamType()) {
      // For excluded exam types, fetch chapters directly without grade
      fetchExamChaptersForExcludedTypes(exam.exam_course_id?.toString() || "")
    } else if (data.examGrade) {
      // For regular exam types, fetch chapters based on grade
      fetchExamChapters(exam.exam_course_id?.toString() || "", data.examGrade)
    } else {
      setFilteredExamChapters([])
    }
  }, [data.examGrade, exam.exam_course_id, exam.exam_type?.name])

  // New function to fetch chapters for excluded exam types
  const fetchExamChaptersForExcludedTypes = useCallback(async (examCourseId: string) => {
    if (!examCourseId) return
    try {
      const response = await axios.get(`/api/exam-courses/${examCourseId}/chapters`)
      setFilteredExamChapters(response.data)
    } catch (error) {
      console.error("Error fetching exam chapters for excluded types:", error)
      setFilteredExamChapters([])
    }
  }, [])

  const fetchExamChapters = useCallback(async (examCourseId: string, gradeId: string) => {
    if (!examCourseId) return
    try {
      const response = await axios.get(`/api/exam-courses/${examCourseId}/grades/${gradeId}/chapters`)
      setFilteredExamChapters(response.data)
    } catch (error) {
      console.error("Error fetching exam chapters:", error)
      setFilteredExamChapters([])
    }
  }, [])

  const showExamGrade = () => {
    return !isExcludedExamType()
  }

  const handleExamGradeChange = (value: string) => {
    setData("examGrade", value)
    updateFilters({ examGrade: value })
  }

  const handleExamChapterChange = (value: string) => {
    setData("examChapter", value)
    updateFilters({ examChapter: value })
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setData("search", query)
    updateFilters({ search: query })
  }

  const updateFilters = (newFilters: Partial<typeof data>) => {
    router.get(
      route("exam-details.show", exam.id),
      { ...data, ...newFilters },
      {
        preserveState: true,
        preserveScroll: true,
      },
    )
  }

  const clearFilters = () => {
    setData({
      search: "",
      examGrade: "",
      examChapter: "",
    })

    router.get(
      route("exam-details.show", exam.id),
      { search: "", examGrade: "", examChapter: "" },
      {
        preserveState: true,
        preserveScroll: true,
      },
    )
  }

  const getFilteredExamGrades = () => {
    const selectedExamType = showExamGrade()
    if (!selectedExamType) return

    switch (exam.exam_type?.name) {
      case "6th Grade Ministry":
        return exam_grades.filter((grade) => [5, 6].includes(grade.grade))
      case "8th Grade Ministry":
        return exam_grades.filter((grade) => [7, 8].includes(grade.grade))
      case "ESSLCE":
        return exam_grades.filter((grade) => grade.grade >= 9 && grade.grade <= 12)
      default:
        return []
    }
  }

  return (
    <MainLayout
      tabTitle={"Exam Detail | Exam Questions"}
      pageTitle={
        exam.exam_type?.name +
        " - " +
        exam.exam_course?.course_name +
        " - " +
        exam.exam_year?.year +
        " - Exam Questions"
      }
      headerAction={
        <>
          <ExamStatisticsDialog exam={exam} paidExams={paidExams} />
          <BackLink href={route("exams-new.show", exam.exam_type_id)} text={"Back to " + exam.exam_type?.name} />
          {canAddExamQuestions ? (
            <CreateExamQuestionAlert exam={exam} exam_grades={exam_grades} />
          ) : (
            <PermissionAlert
              children={"Add Exam Questions"}
              permission={"can add exam questions"}
              buttonVariant={"outline"}
              icon={<PlusCircle className="mr-2 h-4 w-4" />}
            />
          )}
        </>
      }
    >
      <>
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex flex-wrap items-center gap-4">
            {showExamGrade() && (
              <Select value={data.examGrade} onValueChange={handleExamGradeChange}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Select Grade" />
                </SelectTrigger>
                <SelectContent>
                  {getFilteredExamGrades()?.map((grade) => (
                    <SelectItem key={grade.id} value={grade.id.toString()}>
                      Grade - {grade.grade} {grade.stream ? ` - ${grade.stream}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Select
              value={data.examChapter}
              onValueChange={handleExamChapterChange}
              disabled={!isExcludedExamType() && !data.examGrade}
            >
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Select Chapter" />
              </SelectTrigger>
              <SelectContent>
                {filteredExamChapters.map((chapter) => (
                  <SelectItem key={chapter.id} value={chapter.id.toString()}>
                    {chapter.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {(data.examGrade || data.examChapter || data.search) && (
              <button
                onClick={clearFilters}
                className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-md flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-1"
                >
                  <path d="M3 3h18v18H3z" style={{ opacity: 0 }} />
                  <circle cx="12" cy="12" r="10" />
                  <path d="m15 9-6 6" />
                  <path d="m9 9 6 6" />
                </svg>
                Clear Filters
              </button>
            )}
          </div>

          <div className="w-full sm:w-auto relative">
            <Input
              type="text"
              placeholder="Search Exam questions..."
              value={data.search}
              onChange={handleSearchChange}
              className="w-full sm:w-[300px] pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {exam_questions?.data.map((question) => (
            <QuestionCard
              key={question.id}
              question={{
                ...question,
                options: question.options,
                answer: question.answer,
              }}
              examGrades={exam_grades}
              canEdit={canUpdateExamQuestions}
              canDelete={canDeleteExamQuestions}
              getChapterTitle={getChapterTitle}
            />
          ))}
        </div>

        <div className="mt-6 flex justify-center items-center space-x-2">
          {exam_questions?.links.map((link, index) => (
            <Link
              key={index}
              href={link.url || "#"}
              className={`px-4 py-2 border rounded ${
                link.active ? "bg-blue-500 text-white" : "bg-white text-blue-500"
              } ${!link.url ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-100"}`}
              preserveScroll
              preserveState
            >
              <span dangerouslySetInnerHTML={{ __html: link.label }}></span>
            </Link>
          ))}
        </div>
      </>
    </MainLayout>
  )
}

export default Index
