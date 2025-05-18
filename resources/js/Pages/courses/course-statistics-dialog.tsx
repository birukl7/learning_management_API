"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/Components/ui/dialog"
import { Button } from "@/Components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs"
import { Badge } from "@/Components/ui/badge"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import { CalendarDays, DollarSign, Users, BarChart3, Activity, Calendar } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table"
import { ScrollArea } from "@/Components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/Components/ui/avatar"
import type { Course } from "@/types/course"
import type { PaidCourse, User } from "@/types"


interface CourseStatisticsDialogProps {
  course: Course
  paidCourses: PaidCourse[]
}

export default function CourseStatisticsDialog({ course, paidCourses }: CourseStatisticsDialogProps) {
  const [open, setOpen] = useState(false)

  // Extract years from the data
  const extractYears = () => {
    const years = new Set<number>()

    paidCourses.forEach((paidCourse) => {
      if (paidCourse.created_at) {
        try {
          const date = new Date(paidCourse.created_at)
          if (!isNaN(date.getTime())) {
            years.add(date.getFullYear())
          }
        } catch (error) {
          console.error("Error extracting year:", error)
        }
      }
    })

    // If no years found, add current year
    if (years.size === 0) {
      years.add(new Date().getFullYear())
    }

    return Array.from(years).sort((a, b) => b - a) // Sort descending
  }

  const availableYears = extractYears()
  const [displayYear, setDisplayYear] = useState(availableYears[0] || new Date().getFullYear())

  // Get the actual course price based on subscription type
  const getCoursePrice = (subscriptionType: string | undefined): number => {
    if (!subscriptionType) return 0

    switch (subscriptionType) {
      case "oneMonth":
        return Number(course.on_sale_one_month || course.price_one_month || 0)
      case "threeMonths":
        return Number(course.on_sale_three_month || course.price_three_month || 0)
      case "sixMonths":
        return Number(course.on_sale_six_month || course.price_six_month || 0)
      case "yearly":
        return Number(course.on_sale_one_year || course.price_one_year || 0)
      default:
        return 0
    }
  }

  // Calculate total revenue based on course prices
  const totalRevenue = paidCourses.reduce((total, paidCourse) => {
    const price = getCoursePrice(paidCourse.subscriptionRequest?.subscription_type)
    return total + price
  }, 0)

  const activeSubscriptions = paidCourses.filter((paidCourse) => paidCourse.expired === 0).length
  const expiredSubscriptions = paidCourses.filter((paidCourse) => paidCourse.expired === 1).length

  // Only include subscription types that have actual enrollments
  const getSubscriptionTypeData = () => {
    const typeCounts: Record<string, number> = {}

    paidCourses.forEach((paidCourse) => {
      const type = paidCourse.subscriptionRequest?.subscription_type
      if (type) {
        typeCounts[type] = (typeCounts[type] || 0) + 1
      }
    })

    // Only include types with actual enrollments
    return Object.entries(typeCounts)
      .filter(([_, count]) => count > 0) // Only include types with enrollments
      .map(([name, value]) => ({
        name: formatSubscriptionType(name),
        value,
      }))
  }

  // Format subscription type for display
  const formatSubscriptionType = (type: string) => {
    switch (type) {
      case "oneMonth":
        return "1 Month"
      case "threeMonths":
        return "3 Months"
      case "sixMonths":
        return "6 Months"
      case "yearly":
        return "1 Year"
      default:
        return type
    }
  }

  // Check if subscription type is on sale
  const isOnSale = (type: string | undefined) => {
    if (!type) return false

    switch (type) {
      case "oneMonth":
        return !!course.on_sale_one_month && course.on_sale_one_month < course.price_one_month
      case "threeMonths":
        return !!course.on_sale_three_month && course.on_sale_three_month < course.price_three_month
      case "sixMonths":
        return !!course.on_sale_six_month && course.on_sale_six_month < course.price_six_month
      case "yearly":
        return !!course.on_sale_one_year && course.on_sale_one_year < course.price_one_year
      default:
        return false
    }
  }

  // Get monthly revenue data for the selected year
  const getMonthlyRevenueData = () => {
    // Initialize all months with zero revenue
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const monthlyData: Record<string, number> = {}

    // Initialize all months with zero
    months.forEach((month) => {
      monthlyData[`${month} ${displayYear}`] = 0
    })

    // Process actual data
    paidCourses.forEach((paidCourse) => {
      if (!paidCourse.created_at) return

      try {
        // Parse the date string
        const date = new Date(paidCourse.created_at)

        // Skip invalid dates
        if (isNaN(date.getTime())) return

        // Only include data from the selected year
        if (date.getFullYear() !== displayYear) return

        // Get month name
        const monthName = date.toLocaleString("en-US", { month: "short" })
        const monthYear = `${monthName} ${displayYear}`

        // Get price based on subscription type
        const price = getCoursePrice(paidCourse.subscriptionRequest.subscription_type)

        // Add to monthly total
        monthlyData[monthYear] = (monthlyData[monthYear] || 0) + price
      } catch (error) {
        console.error("Error processing date:", error, paidCourse.created_at)
      }
    })

    // Convert to array format for the chart
    return months.map((month) => ({
      name: `${month} ${displayYear}`,
      value: monthlyData[`${month} ${displayYear}`] || 0,
    }))
  }

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Calculate subscription status
  const getSubscriptionStatus = (paidCourse: PaidCourse) => {
    if (paidCourse.expired === 1) {
      return "Expired"
    }

    const subscription = paidCourse.subscriptionRequest?.subscriptions?.[0]
    if (!subscription) return "Unknown"

    return subscription.status
  }

  // Colors for pie chart
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]

  // Debug log to see what data we're working with
  useEffect(() => {
    if (paidCourses.length > 0) {
      console.log("Processing paid courses for chart data:")
      paidCourses.forEach((course) => {
        try {
          const date = new Date(course.created_at)
          const monthName = date.toLocaleString("en-US", { month: "short" })
          const year = date.getFullYear()
          const price = getCoursePrice(course.subscriptionRequest.subscription_type)

          console.log(
            `Course ID: ${course.id}, Date: ${course.created_at}, Month: ${monthName}, Year: ${year}, Price: ${price}`,
          )
        } catch (error) {
          console.error("Error in debug log:", error)
        }
      })

      console.log("Monthly data:", getMonthlyRevenueData())
    }
  }, [paidCourses, displayYear])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <BarChart3 className="h-4 w-4" />
          Course Statistics
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-xl">Course Statistics: {course.course_name}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[calc(90vh-120px)] pr-4">
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                    Total Enrollments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{paidCourses.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {activeSubscriptions} active, {expiredSubscriptions} expired
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <DollarSign className="mr-2 h-4 w-4 text-muted-foreground" />
                    Total Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalRevenue.toLocaleString()} Birr</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <Activity className="mr-2 h-4 w-4 text-muted-foreground" />
                    Subscription Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className={activeSubscriptions > 0 ? "bg-green-500" : "bg-secondary"}>
                      {activeSubscriptions} Active
                    </Badge>
                    <Badge variant="destructive">{expiredSubscriptions} Expired</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {Math.round((activeSubscriptions / (paidCourses.length || 1)) * 100)}% active rate
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <Tabs defaultValue="revenue" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="revenue">Revenue Analysis</TabsTrigger>
                <TabsTrigger value="subscriptions">Subscription Types</TabsTrigger>
              </TabsList>

              <TabsContent value="revenue" className="space-y-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Monthly Revenue</CardTitle>
                      <CardDescription>Revenue generated over time</CardDescription>
                    </div>

                    {/* Year selector */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Year:</span>
                      <select
                        className="border rounded px-2 py-1 text-sm"
                        value={displayYear}
                        onChange={(e) => setDisplayYear(Number(e.target.value))}
                      >
                        {availableYears.map((year) => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </div>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={getMonthlyRevenueData()} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
                        <YAxis />
                        <Tooltip formatter={(value) => [`${value} Birr`, "Revenue"]} />
                        <Bar dataKey="value" fill="#8884d8" name="Revenue (Birr)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="subscriptions">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Subscription Types</CardTitle>
                    <CardDescription>Distribution of subscription durations</CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    {getSubscriptionTypeData().length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={getSubscriptionTypeData()}
                            cx="50%"
                            cy="50%"
                            labelLine={true}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {getSubscriptionTypeData().map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [value, "Subscriptions"]} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        No subscription data available
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Detailed User Table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  Enrolled Users
                </CardTitle>
                <CardDescription>Detailed information about each enrollment</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Subscription Type</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paidCourses.map((paidCourse) => {
                      const subscription = paidCourse.subscriptionRequest?.subscriptions?.[0]
                      const user = paidCourse.user
                      const subscriptionType = paidCourse.subscriptionRequest?.subscription_type

                      return (
                        <TableRow key={paidCourse.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{user.name}</div>
                                <div className="text-xs text-muted-foreground">{user.email || "No email"}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {subscriptionType ? formatSubscriptionType(subscriptionType) : "Unknown"}
                          </TableCell>
                          <TableCell>
                            {getCoursePrice(subscriptionType).toLocaleString()} Birr
                            {isOnSale(subscriptionType) && (
                              <Badge
                                variant="outline"
                                className="ml-2 text-xs bg-amber-100 text-amber-800 border-amber-200"
                              >
                                On Sale
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <CalendarDays className="h-3 w-3 text-muted-foreground" />
                              {formatDate(subscription?.subscription_start_date)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              {formatDate(subscription?.subscription_end_date)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                paidCourse.expired === 1
                                  ? "destructive"
                                  : getSubscriptionStatus(paidCourse) === "Active"
                                    ? "default"
                                    : "secondary"
                              }
                              className={
                                paidCourse.expired === 0 && getSubscriptionStatus(paidCourse) === "Active"
                                  ? "bg-green-500"
                                  : ""
                              }
                            >
                              {paidCourse.expired === 1 ? "Expired" : getSubscriptionStatus(paidCourse)}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                    {paidCourses.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                          No enrollments found for this course
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
