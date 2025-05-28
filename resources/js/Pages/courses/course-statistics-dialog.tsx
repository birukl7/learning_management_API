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
import { CalendarDays, DollarSign, Users, BarChart3, Activity, Calendar } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table"
import { ScrollArea } from "@/Components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/Components/ui/avatar"
import type { Course } from "@/types/course"
import type { User } from "@/types"

interface PaidCourse {
  id: number
  user: User
  expired: number
  course_price: number // Added: actual price paid for the course
  subscriptionRequest: {
    total_price: number
    subscription_type?: string
    subscriptions?: {
      subscription_start_date?: string
      subscription_end_date?: string
      status?: string
    }[]
  }
  created_at: string
}

interface CourseStatisticsDialogProps {
  course: Course
  paidCourses: PaidCourse[]
}

export default function CourseStatisticsDialog({ course, paidCourses }: CourseStatisticsDialogProps) {
  const [open, setOpen] = useState(false)

  // Default to 2025 since we know we have data for that year
  const [displayYear, setDisplayYear] = useState(2025)

  // Get the actual price for a subscription type (for reference/comparison)
  const getSubscriptionPrice = (subscriptionType: string | undefined) => {
    if (!subscriptionType) return 0

    switch (subscriptionType) {
      case "oneMonth":
        const oneMonthSale = Number(course.on_sale_one_month || 0)
        const oneMonthRegular = Number(course.price_one_month || 0)
        return oneMonthSale > 0 ? oneMonthSale : oneMonthRegular
      case "threeMonths":
        const threeMonthSale = Number(course.on_sale_three_month || 0)
        const threeMonthRegular = Number(course.price_three_month || 0)
        return threeMonthSale > 0 ? threeMonthSale : threeMonthRegular
      case "sixMonths":
        const sixMonthSale = Number(course.on_sale_six_month || 0)
        const sixMonthRegular = Number(course.price_six_month || 0)
        return sixMonthSale > 0 ? sixMonthSale : sixMonthRegular
      case "yearly":
        const yearlySale = Number(course.on_sale_one_year || 0)
        const yearlyRegular = Number(course.price_one_year || 0)
        return yearlySale > 0 ? yearlySale : yearlyRegular
      default:
        return 0
    }
  }

  // Calculate total revenue based on actual course_price paid
  const totalRevenue = paidCourses.reduce((total, paidCourse, index) => {
    const actualPrice = Number(paidCourse.course_price || 0)
    console.log(`Revenue calculation - Course ${index + 1}: ${actualPrice} Birr (Running total: ${total + actualPrice})`)
    return total + actualPrice
  }, 0)

  console.log("=== TOTAL REVENUE ===")
  console.log(`Final total revenue: ${totalRevenue} Birr`)

  const activeSubscriptions = paidCourses.filter((paidCourse) => paidCourse.expired === 0).length
  const expiredSubscriptions = paidCourses.filter((paidCourse) => paidCourse.expired === 1).length

  console.log('activeSubscriptions:', activeSubscriptions)
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
        return Number(course.on_sale_one_month || 0) > 0
      case "threeMonths":
        return Number(course.on_sale_three_month || 0) > 0
      case "sixMonths":
        return Number(course.on_sale_six_month || 0) > 0
      case "yearly":
        return Number(course.on_sale_one_year || 0) > 0
      default:
        return false
    }
  }

  // Get monthly revenue data using actual course_price
  const getMonthlyRevenueData = () => {
    // Initialize all months with zero revenue
    const monthlyData = [
      { name: "Jan 2025", value: 0 },
      { name: "Feb 2025", value: 0 },
      { name: "Mar 2025", value: 0 },
      { name: "Apr 2025", value: 0 },
      { name: "May 2025", value: 0 },
      { name: "Jun 2025", value: 0 },
      { name: "Jul 2025", value: 0 },
      { name: "Aug 2025", value: 0 },
      { name: "Sep 2025", value: 0 },
      { name: "Oct 2025", value: 0 },
      { name: "Nov 2025", value: 0 },
      { name: "Dec 2025", value: 0 },
    ]

    console.log("=== DEBUGGING MONTHLY REVENUE ===")
    console.log("Total paid courses:", paidCourses.length)

    // Process the data from paidCourses
    paidCourses.forEach((paidCourse, index) => {
      try {
        const dateStr = paidCourse.created_at
        const actualPrice = Number(paidCourse.course_price || 0)

        console.log(`Course ${index + 1}:`)
        console.log(`  Date string: ${dateStr}`)
        console.log(`  Subscription type: ${paidCourse.subscriptionRequest?.subscription_type}`)
        console.log(`  Actual course price paid: ${actualPrice}`)

        if (!dateStr) {
          console.log(`  Skipping - no date`)
          return
        }

        const date = new Date(dateStr)

        if (isNaN(date.getTime())) {
          console.log(`  Skipping - invalid date`)
          return
        }

        const monthIndex = date.getMonth() // 0-11
        const year = date.getFullYear()

        console.log(`  Parsed date: ${date}`)
        console.log(`  Month index: ${monthIndex} (${monthlyData[monthIndex].name})`)
        console.log(`  Year: ${year}`)

        if (year !== 2025) {
          console.log(`  Skipping - not 2025`)
          return
        }

        console.log(`  Adding ${actualPrice} to ${monthlyData[monthIndex].name}`)
        console.log(`  Before: ${monthlyData[monthIndex].value}`)

        monthlyData[monthIndex].value += actualPrice

        console.log(`  After: ${monthlyData[monthIndex].value}`)
      } catch (error) {
        console.error(`Error processing course ${index}:`, error)
      }
    })

    console.log("=== FINAL MONTHLY DATA ===")
    monthlyData.forEach((month) => {
      if (month.value > 0) {
        console.log(`${month.name}: ${month.value} Birr`)
      }
    })

    return monthlyData
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

  // Log the paid courses data when the component mounts
  useEffect(() => {
    console.log("=== COURSE DATA DEBUG ===")
    console.log("Course prices:", {
      oneMonth: course.price_one_month,
      threeMonth: course.price_three_month,
      sixMonth: course.price_six_month,
      yearly: course.price_one_year,
      onSaleOneMonth: course.on_sale_one_month,
      onSaleThreeMonth: course.on_sale_three_month,
      onSaleSixMonth: course.on_sale_six_month,
      onSaleYearly: course.on_sale_one_year,
    })

    paidCourses.forEach((paidCourse, index) => {
      const subscriptionType = paidCourse.subscriptionRequest?.subscription_type
      const expectedPrice = getSubscriptionPrice(subscriptionType)
      const actualPrice = Number(paidCourse.course_price || 0)
      console.log(`Paid Course ${index + 1}:`, {
        id: paidCourse.id,
        subscription_type: subscriptionType,
        expected_price: expectedPrice,
        actual_course_price: actualPrice,
        subscription_total_price: paidCourse.subscriptionRequest?.total_price,
        created_at: paidCourse.created_at,
      })
    })
  }, [paidCourses, course])

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
                  <p className="text-xs text-muted-foreground">Based on actual course prices paid</p>
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
                  <CardHeader>
                    <CardTitle className="text-lg">Monthly Revenue (2025)</CardTitle>
                    <CardDescription>Revenue based on actual course prices paid</CardDescription>
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
                      <TableHead>Course Price</TableHead>
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
                      const actualPrice = Number(paidCourse.course_price || 0)
                      const expectedPrice = getSubscriptionPrice(subscriptionType)

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
                            <div className="space-y-1">
                              <div className="font-medium">{actualPrice.toLocaleString()} Birr</div>
                              {expectedPrice !== actualPrice && (
                                <div className="text-xs text-muted-foreground">
                                  Expected: {expectedPrice.toLocaleString()} Birr
                                </div>
                              )}
                              <div className="text-xs text-muted-foreground">
                                Total Paid: {Number(paidCourse.subscriptionRequest?.total_price || 0).toLocaleString()} Birr
                              </div>
                            </div>
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
