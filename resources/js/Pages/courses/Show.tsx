import { Head } from "@inertiajs/react"
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout"
import { BookOpen, Users, Layers, GraduationCap, Building, Clock, DollarSign, Star, UserCheck } from "lucide-react"
import { EnhancedTableDemo } from "@/Components/TableDemo"
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs"
import { Badge } from "@/Components/ui/badge"
import { Button } from "@/Components/ui/button"
import CreateChapter from "./CreateChapter"
import DeleteCourseAlert from "./DeleteCourseAlert"
import { UpdateCourseAlert } from "./UpdateCourseAlert"
import ChapterCard from "@/Components/ChapterCard"
import type { ShowCourseProps } from "@/types/show"
import dayjs from "dayjs"

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
}: ShowCourseProps) => {
  const gradeName = grades.find((grade) => grade.id === course.grade_id)?.grade_name || "N/A"

  return (
    <AuthenticatedLayout
      header={
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Course Details</h1>
        </div>
      }
    >
      <Head title={course.course_name} />
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
                      thumbnail.startsWith("/storage//id")
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
                        {category_name.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())}
                      </Badge>
                    </div>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <InfoItem
                      icon={<BookOpen className="w-5 h-5" />}
                      label="Chapters"
                      value={course.number_of_chapters}
                    />
                    {course.grade_id && (
                      <InfoItem icon={<GraduationCap className="w-5 h-5" />} label="Grade" value={gradeName} />
                    )}
                    {course.department_id && (
                      <InfoItem icon={<Building className="w-5 h-5" />} label="Department" value={department_name} />
                    )}
                    {course.batch_id && (
                      <InfoItem icon={<Users className="w-5 h-5" />} label="Batch" value={batch_name} />
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
                      salePrice={course.on_sale_month}
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
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Admin Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Admin Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <UpdateCourseAlert
                    course={course}
                    categories={categories}
                    grades={grades}
                    departments={departments}
                    batches={batches}
                    thumbnail={thumbnail}
                  />
                  <DeleteCourseAlert id={course.id} />
                </CardContent>
              </Card>

              {/* Course Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle>Course Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <StatItem icon={<UserCheck className="w-5 h-5" />} label="Enrolled Students" value="120" />
                  <StatItem icon={<Star className="w-5 h-5" />} label="Average Rating" value="4.5/5" />
                  <StatItem icon={<Users className="w-5 h-5" />} label="Completion Rate" value="78%" />
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
                    user="John Doe"
                  />
                  <UserActionInfo
                    icon={<Clock className="w-5 h-5" />}
                    label="Updated"
                    date={dayjs(course.updated_at).format("MMM D, YYYY")}
                    user="Jane Smith"
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
                  <EnhancedTableDemo chapters={chapters} />
                </TabsContent>
                <TabsContent value="grid">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                    {chapters.map((chapter, index) => (
                      <ChapterCard key={index} chapter={chapter} />
                    ))}
                  </div>
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
    <span className="text-sm font-medium text-gray-500">{label}</span>
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
  value: string
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

