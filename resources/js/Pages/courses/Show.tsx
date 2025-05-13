import { Head, Link, usePage } from "@inertiajs/react"
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout"
import { BookOpen, Users, GraduationCap, Building, Clock, UserCheck, Pencil, Trash2, Building2, ArrowLeft } from "lucide-react"
import { EnhancedTableDemo } from "@/Components/TableDemo"
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs"
import { Badge } from "@/Components/ui/badge"
import CreateChapter from "./CreateChapter"
import DeleteCourseAlert from "./DeleteCourseAlert"
import { UpdateCourseAlert } from "./UpdateCourseAlert"
import ChapterCard from "@/Components/ChapterCard"
import type { ShowCourseProps } from "@/types/show"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import PermissionAlert from "@/Components/PermissionAlert"
import { SessionToast } from "@/Components/SessionToast"
import { Button } from "@/Components/ui/button"
import CourseStatisticsDialog from "./course-statistics-dialog"


dayjs.extend(relativeTime)

const Show = ({
  course,
  thumbnail,
  category_name,
  department_name,
  batch_name,
  chapters,
  categories,
  grades,
  departments,
  batches,
  chaptersCount,
  enrolledStudents,
  canDelete,
  canUpdate,
  canDeleteChapters,
  canUpdateChapters,
  paidCourses
}: ShowCourseProps) => {

  console.log(paidCourses)

  const gradeName = grades.find((grade) => grade.id === Number(course.grade_id))?.grade_name || "N/A"

  const { flash } = usePage().props as unknown as { flash: { success?: string } };


  return (
    <AuthenticatedLayout
      header={
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Course Details</h1>

          <Link prefetch href={route('courses.index')}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
          </Link>
        </div>
      }
    >
      <Head title={course.course_name} />

      {flash.success && (<SessionToast message={flash.success }  />)}

      <div className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Course Header */}
              <Card className="overflow-hidden">
                <div className="relative h-64">
                  <img
                    src={
                      thumbnail?.startsWith("/storage//id")
                        ? `https://picsum.photos${thumbnail.replace("storage/", "")}`
                        : thumbnail
                    }
                    alt={course.course_name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-end">
                    <div className="p-6 text-white">
                      <h2 className="text-3xl font-bold mb-2">{course.course_name}</h2>
                      <Badge variant="secondary" className="text-sm">
                        {(() => {
                          const categoryNameMap: Record<string, string> = {
                            higher_grades: "High School",
                            random_courses: "Courses",
                          }

                          return (
                            categoryNameMap[category_name] ||
                            category_name.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
                          )
                        })()}
                      </Badge>
                    </div>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="flex sm:flex-row flex-col justify-between">
                    <InfoItem icon={<BookOpen className="w-5 h-5" />} label="Chapters:" value={chaptersCount} />
                    {course.grade_id && (
                      <InfoItem icon={<GraduationCap className="w-5 h-5" />} label="Grade:" value={gradeName} />
                    )}
                    {course.department_id && (
                      <InfoItem icon={<Building className="w-5 h-5" />} label="Department:" value={department_name} />
                    )}
                    {course.batch_id && (
                      <InfoItem icon={<Users className="w-5 h-5 text-nowrap" />} label="Batch:" value={batch_name} />
                    )}
                    {course.stream && (
                      <InfoItem
                        icon={<Building2 className="w-5 h-5 text-nowrap" />}
                        label="Stream:"
                        value={course.stream}
                      />
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Pricing */}
              <Card>
                <CardHeader>
                  <CardTitle>Pricing</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <PriceItem
                      duration="1 Month"
                      regularPrice={course.price_one_month}
                      salePrice={course.on_sale_one_month}
                    />
                    <PriceItem
                      duration="3 Months"
                      regularPrice={course.price_three_month}
                      salePrice={course.on_sale_three_month}
                    />
                    <PriceItem
                      duration="6 Months"
                      regularPrice={course.price_six_month}
                      salePrice={course.on_sale_six_month}
                    />
                    <PriceItem
                      duration="1 Year"
                      regularPrice={course.price_one_year}
                      salePrice={course.on_sale_one_year}
                    />
                  </div>
                </CardContent>
              </Card>

              <CourseStatisticsDialog
                course={course}
                paidCourses={paidCourses}
              />
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Admin Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Admin Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {canUpdate ? (
                    <UpdateCourseAlert
                      course={course}
                      categories={categories}
                      grades={grades}
                      departments={departments}
                      batches={batches}
                      thumbnail={thumbnail}
                    />
                  ) : (
                    <PermissionAlert
                      children="Update Course"
                      permission="update a course"
                      icon={<Pencil className="w-5 h-5 mr-2" />}
                      className="w-full bg-blue-600 hover:bg-blue-700 capitalize"
                    />
                  )}

                  {canDelete ? (
                    <DeleteCourseAlert id={course.id} />
                  ) : (
                    <PermissionAlert
                      children="Delete Course"
                      permission="update a course"
                      icon={<Trash2 className="w-5 h-5 mr-2" />}
                      className="w-full bg-red-500 hover:bg-red-700 capitalize"
                      buttonVariant={"destructive"}
                    />
                  )}
                </CardContent>
              </Card>

              {/* Course Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle>Course Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <StatItem icon={<UserCheck className="w-5 h-5" />} label="Enrolled Students" value={enrolledStudents} />
                </CardContent>
              </Card>

              {/* Course Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Course Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <UserActionInfo
                    icon={<Clock className="w-5 h-5" />}
                    label="Created"
                    date={dayjs(course.created_at).format("MMM D, YYYY")}
                    user={course.created_by?.name}
                  />
                  <UserActionInfo
                    icon={<Clock className="w-5 h-5" />}
                    label="Updated"
                    date={dayjs(course.updated_at).format("MMM D, YYYY")}
                    user={course.updated_by?.name}
                  />
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Chapters - Full Width */}
          <Card className="mt-8">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Chapters</CardTitle>
                <CreateChapter id={course.id} course_name={course.course_name} />
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="list" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="list">List View</TabsTrigger>
                  <TabsTrigger value="grid">Grid View</TabsTrigger>
                </TabsList>
                <TabsContent value="list">
                  <EnhancedTableDemo
                    chapters={chapters}
                    canEditChapter={canUpdateChapters}
                    canDeleteChapter={canDeleteChapters}
                  />
                </TabsContent>
                <TabsContent value="grid">
                  {chapters.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                      {chapters.map((chapter, index) => (
                        <ChapterCard key={index} chapter={chapter} />
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16">
                      <img src={"/images/Course app-rafiki.svg"} alt="No data available" className="w-48 h-48" />
                      <p className="text-gray-500 mt-4 text-lg">No chapters available. Start creating one!</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthenticatedLayout>
  )
}

interface InfoItemProps {
  icon: React.ReactNode
  label: string
  value: number | string
}

const InfoItem = ({ icon, label, value }: InfoItemProps) => (
  <div className="flex items-center space-x-2">
    {icon}
    <span className="text-sm font-medium text-nowrap text-gray-500">{label}</span>
    <span className="font-semibold">{value}</span>
  </div>
)

interface PriceItemProps {
  duration: string
  regularPrice: number
  salePrice?: number
}

const PriceItem = ({ duration, regularPrice, salePrice }: PriceItemProps) => (
  <div className="flex items-center justify-between p-4 border rounded-lg">
    <div>
      <p className="font-medium">{duration}</p>
      <div className="flex items-center space-x-2">
        <span className={`text-lg font-bold ${salePrice ? "line-through text-gray-400" : ""}`}>
          {regularPrice} Birr
        </span>
        {salePrice && <span className="text-lg font-bold text-green-600">{salePrice} Birr</span>}
      </div>
    </div>
    {/* <Button variant="outline">Select</Button> */}
  </div>
)

interface StatItemProps {
  icon: React.ReactNode
  label: string
  value: number | string
}

const StatItem = ({ icon, label, value }: StatItemProps) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center space-x-2">
      {icon}
      <span className="text-sm font-medium text-gray-500">{label}</span>
    </div>
    <span className="font-semibold">{value}</span>
  </div>
)

interface UserActionInfoProps {
  icon: React.ReactNode
  label: string
  date: string
  user: string
}

const UserActionInfo = ({ icon, label, date, user }: UserActionInfoProps) => (
  <div className="flex items-center space-x-2">
    {icon}
    <div>
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="text-sm">
        <span className="font-semibold">{date}</span> by <span className="font-semibold">{user}</span>
      </p>
    </div>
  </div>
)

export default Show

