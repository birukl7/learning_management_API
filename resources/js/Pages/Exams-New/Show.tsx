import { DropdownMenuTrigger } from "@/Components/ui/dropdown-menu"

import type React from "react"
import { Head, Link, router, usePage } from "@inertiajs/react"
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout"
import { SessionToast } from "@/Components/SessionToast"
import { Button } from "@/Components/ui/button"
import { Card, CardContent } from "@/Components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table"
import { Badge } from "@/Components/ui/badge"
import { Eye, Search, Calendar, ChevronDown, Pencil, Trash2, SortAsc, SortDesc, Filter } from "lucide-react"
import { Input } from "@/Components/ui/input"
import { useState, useEffect } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/Components/ui/dropdown-menu"
import CreateExamAlert from "./CreateExamAlert"
import type { Exam } from "@/types"
import EditExamAlert from "./EditExamAlert"
import DeleteExamAlert from "./DeleteExamAlert"
import ViewLink from "@/Components/ViewLink"
import BackLink from "@/Components/BackLink"
import PermissionAlert from "@/Components/PermissionAlert"


interface ShowProps {
  exams: {
    data: Exam[]
    links: Array<{
      url: string | null
      active: boolean
      label: string
    }>
    meta: any
  }
  filteredCourses: { id: number; course_name: string }[]
  filteredYears: { id: number; year: string }[]
  courses: { id: number; course_name: string }[]
  years: { id: number; year: string }[]
  filters?: {
    course_id?: number | null
    year_id?: number | null
    search?: string
    sort?: string | null
  }
  examTypeId: number
  examTypeName: string
  canAdd: boolean
  canUpdate: boolean
  canDelete: boolean
}

const Show = ({
  exams,
  filteredCourses,
  filteredYears,
  filters = {},
  examTypeId,
  courses,
  years,
  examTypeName,
  canAdd,
  canDelete,
  canUpdate,
}: ShowProps) => {
  const { flash } = usePage().props as unknown as { flash: { success?: string } }
  const [searchTerm, setSearchTerm] = useState(filters.search || "")
  const [viewType, setViewType] = useState<"table" | "cards">("cards")
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm !== filters.search) {
        setIsSearching(true)
        router.get(
          window.location.pathname,
          {
            search: searchTerm,
            course_id: filters.course_id,
            year_id: filters.year_id,
            sort: filters.sort,
          },
          {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => setIsSearching(false),
          },
        )
      }
    }, 300)

    return () => clearTimeout(handler)
  }, [searchTerm])

  // Handle course selection
  const handleCourseSelect = (courseId: string | null) => {
    router.get(
      window.location.pathname,
      {
        course_id: courseId,
        year_id: filters.year_id,
        search: filters.search,
        sort: filters.sort,
      },
      {
        preserveState: true,
        preserveScroll: true,
      },
    )
  }

  // Handle year selection
  const handleYearSelect = (yearId: string | null) => {
    router.get(
      window.location.pathname,
      {
        year_id: yearId,
        course_id: filters.course_id,
        search: filters.search,
        sort: filters.sort,
      },
      {
        preserveState: true,
        preserveScroll: true,
      },
    )
  }

  // Handle sort selection
  const handleSortSelect = (sortOrder: string | null) => {
    router.get(
      window.location.pathname,
      {
        sort: sortOrder,
        year_id: filters.year_id,
        course_id: filters.course_id,
        search: filters.search,
      },
      {
        preserveState: true,
        preserveScroll: true,
      },
    )
  }

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("")
    router.get(
      window.location.pathname,
      {},
      {
        preserveState: true,
        preserveScroll: true,
      },
    )
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "ETB",
    }).format(price)
  }

  const renderPriceComparison = (regular: number, sale: number | null) => {
    // Only show sale price if it exists, is not zero, and is less than the regular price
    if (sale && sale > 0 && sale < regular) {
      return (
        <div className="flex flex-col">
          <span className="text-sm line-through text-muted-foreground">{formatPrice(regular)}</span>
          <span className="font-medium text-green-600">{formatPrice(sale)}</span>
        </div>
      )
    }
    return <span>{formatPrice(regular)}</span>
  }

  // Get sort icon based on current sort
  const getSortIcon = () => {
    if (filters.sort === "asc") return <SortAsc className="h-4 w-4" />
    if (filters.sort === "desc") return <SortDesc className="h-4 w-4" />
    return <Filter className="h-4 w-4" />
  }

  // Get sort label based on current sort
  const getSortLabel = () => {
    if (filters.sort === "asc") return "A to Z"
    if (filters.sort === "desc") return "Z to A"
    return "Sort"
  }

  return (
    <AuthenticatedLayout
      header={
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Exams Type - {examTypeName} </h1>

          <div className="flex items-center gap-2">
            <BackLink href={route("exams-new.index")} text="Back to Exam Type" />
            {canAdd ? (
              <CreateExamAlert examCourses={courses} examYears={years} exam_type_id={examTypeId} />
            ) : (
              <PermissionAlert children={"Add Exam"} permission={"can add an exam"} className="p-2 text-xs" />
            )}
          </div>
        </div>
      }
    >
      <Head title={"Exam Detail"} />

      {flash.success && <SessionToast message={flash.success} />}

      <div className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Course Navigation Bar */}
          <div className="mb-6 overflow-x-auto">
            <div className="inline-flex min-w-full p-1 bg-muted/30 rounded-lg">
              <Button
                variant={!filters.course_id ? "default" : "ghost"}
                className="rounded-md whitespace-nowrap"
                onClick={() => handleCourseSelect(null)}
              >
                All Courses
              </Button>

              {filteredCourses && filteredCourses.length > 0 ? (
                filteredCourses.map((course) => (
                  <Button
                    key={course?.id}
                    variant={filters.course_id === course?.id ? "default" : "ghost"}
                    className="rounded-md whitespace-nowrap"
                    onClick={() => handleCourseSelect(course.id.toString())}
                  >
                    {course?.course_name}
                  </Button>
                ))
              ) : (
                <p className="p-3 pt-1">No courses available.</p> // This message will be shown if filteredCourses is empty or null.
              )}
            </div>
          </div>

          {/* Year Filter, Sort Filter, and Search */}
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search exams..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-full"
                />
                {isSearching && (
                  <div className="absolute right-2.5 top-2.5">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                  </div>
                )}
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span className="hidden sm:inline">Year</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Filter by Year</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleYearSelect(null)}>All Years</DropdownMenuItem>
                  {filteredYears.map((year) => (
                    <DropdownMenuItem
                      key={year.id}
                      onClick={() => handleYearSelect(year.id.toString())}
                      className={filters.year_id === year.id ? "bg-muted" : ""}
                    >
                      {year.year}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Alphabetical Sort Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-1">
                    {getSortIcon()}
                    <span className="hidden sm:inline">{getSortLabel()}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Sort Alphabetically</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleSortSelect(null)}>Default</DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleSortSelect("asc")}
                    className={filters.sort === "asc" ? "bg-muted" : ""}
                  >
                    <SortAsc className="h-4 w-4 mr-2" /> A to Z
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleSortSelect("desc")}
                    className={filters.sort === "desc" ? "bg-muted" : ""}
                  >
                    <SortDesc className="h-4 w-4 mr-2" /> Z to A
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex gap-2">
              <Button
                variant={viewType === "table" ? "default" : "outline"}
                onClick={() => setViewType("table")}
                size="sm"
              >
                Table View
              </Button>
              <Button
                variant={viewType === "cards" ? "default" : "outline"}
                onClick={() => setViewType("cards")}
                size="sm"
              >
                Card View
              </Button>
            </div>
          </div>

          {/* Active Filters Display */}
          {(filters.course_id || filters.year_id || filters.search || filters.sort) && (
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">Active filters:</span>

              {filters.course_id && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <span>Course: {courses.find((c) => c.id === filters.course_id)?.course_name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 ml-1"
                    onClick={() => handleCourseSelect(null)}
                  >
                    <span className="sr-only">Remove</span>×
                  </Button>
                </Badge>
              )}

              {filters.year_id && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <span>Year: {years.find((y) => y.id === filters.year_id)?.year}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 ml-1"
                    onClick={() => handleYearSelect(null)}
                  >
                    <span className="sr-only">Remove</span>×
                  </Button>
                </Badge>
              )}

              {filters.sort && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <span>Sort: {filters.sort === "asc" ? "A to Z" : "Z to A"}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 ml-1"
                    onClick={() => handleSortSelect(null)}
                  >
                    <span className="sr-only">Remove</span>×
                  </Button>
                </Badge>
              )}

              {filters.search && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <span>Search: {filters.search}</span>
                  <Button variant="ghost" size="icon" className="h-4 w-4 p-0 ml-1" onClick={() => setSearchTerm("")}>
                    <span className="sr-only">Remove</span>×
                  </Button>
                </Badge>
              )}

              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={clearFilters}>
                Clear all
              </Button>
            </div>
          )}

          {/* Results Summary */}
          <div className="mb-4">
            <p className="text-sm text-muted-foreground"></p>
          </div>

          {/* Main Content Area */}
          {viewType === "table" ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Stream</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>1 Month</TableHead>
                    <TableHead>3 Months</TableHead>
                    <TableHead>6 Months</TableHead>
                    <TableHead>1 Year</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {exams.data.length > 0 ? (
                    exams.data.map((exam) => (
                      <TableRow key={exam.id}>
                        <TableCell className="font-medium">
                          {exam.exam_course ? (
                            exam.exam_course.course_name
                          ) : (
                            <span className="text-muted-foreground italic">No course</span>
                          )}
                        </TableCell>
                        <TableCell>{exam.exam_year?.year || "Unknown Year"}</TableCell>
                        <TableCell>
                          {exam.stream ? (
                            <Badge variant="outline">{exam.stream}</Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>{exam.exam_duration + " minutes" || "-"}</TableCell>
                        <TableCell>{renderPriceComparison(exam.price_one_month, exam.on_sale_one_month)}</TableCell>
                        <TableCell>{renderPriceComparison(exam.price_three_month, exam.on_sale_three_month)}</TableCell>
                        <TableCell>{renderPriceComparison(exam.price_six_month, exam.on_sale_six_month)}</TableCell>
                        <TableCell>{renderPriceComparison(exam.price_one_year, exam.on_sale_one_year)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Link href={route("exam-details.show", exam.id)} className="text-blue-500">
                              <Eye className="h-4 w-4" />
                            </Link>

                            {canUpdate ? (
                              <EditExamAlert exam={exam} examCourses={courses} examYears={years} />
                            ) : (
                              <PermissionAlert
                                children={"Edit"}
                                buttonVariant={"outline"}
                                className="p-2 text-xs"
                                buttonSize={"sm"}
                                permission="update an exam"
                                icon={<Pencil className="h-4 w-4 mr-1" />}
                              />
                            )}

                            {canDelete ? (
                              <DeleteExamAlert id={exam.id} />
                            ) : (
                              <PermissionAlert
                                children={"Delete"}
                                permission={"delete an exam"}
                                icon={<Trash2 className="h-4 w-4 mr-1" />}
                              />
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                        No exams found matching your criteria.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {exams.data.length > 0 ? (
                exams.data.map((exam) => (
                  <Card key={exam.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="bg-primary/10 p-4 flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold">
                            {exam.exam_course ? (
                              exam.exam_course.course_name
                            ) : (
                              <span className="italic text-muted-foreground">No course</span>
                            )}
                          </h3>
                          <div className="text-sm text-muted-foreground">{exam.exam_year?.year || "Unknown Year"}</div>
                        </div>
                        {exam.stream && <Badge variant="secondary">{exam.stream}</Badge>}
                      </div>

                      <div className="p-4">
                        <h4 className="font-medium mb-2">Pricing Options</h4>
                        <div className="grid grid-cols-2 gap-2 mb-4">
                          <div className="border rounded p-2">
                            <div className="text-xs text-muted-foreground">1 Month</div>
                            {renderPriceComparison(exam.price_one_month, exam.on_sale_one_month)}
                          </div>
                          <div className="border rounded p-2">
                            <div className="text-xs text-muted-foreground">3 Months</div>
                            {renderPriceComparison(exam.price_three_month, exam.on_sale_three_month)}
                          </div>
                          <div className="border rounded p-2">
                            <div className="text-xs text-muted-foreground">6 Months</div>
                            {renderPriceComparison(exam.price_six_month, exam.on_sale_six_month)}
                          </div>
                          <div className="border rounded p-2">
                            <div className="text-xs text-muted-foreground">1 Year</div>
                            {renderPriceComparison(exam.price_one_year, exam.on_sale_one_year)}
                          </div>
                        </div>
                        <div className="my-1">
                          <span className="text-xs text-muted-foreground">Duration:</span>{" "}
                          <span className="">{exam.exam_duration} minutes</span>
                        </div>

                        <div className="flex justify-end gap-2">
                          <ViewLink href={route("exam-details.show", exam.id)} />

                          {canUpdate ? (
                            <EditExamAlert exam={exam} examCourses={courses} examYears={years} />
                          ) : (
                            <PermissionAlert
                              children={"Edit"}
                              buttonVariant={"outline"}
                              className="p-2 text-xs"
                              buttonSize={"sm"}
                              permission="update an exam"
                              icon={<Pencil className="h-4 w-4 mr-1" />}
                            />
                          )}

                          {canDelete ? (
                            <DeleteExamAlert id={exam.id} />
                          ) : (
                            <PermissionAlert
                              children={"Delete"}
                              permission={"delete an exam"}
                              icon={<Trash2 className="h-4 w-4 mr-1" />}
                            />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-10 text-muted-foreground">
                  No exams found matching your criteria.
                </div>
              )}
            </div>
          )}

          {/* Pagination */}
          <div className="mt-6 flex justify-center items-center space-x-2">
            {exams.links?.map((link: { url: any; active: any; label: any }, index: React.Key | null | undefined) => (
              <Link
                key={index}
                prefetch
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
        </div>
      </div>
    </AuthenticatedLayout>
  )
}

export default Show

