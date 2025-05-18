import type { PageProps } from "@/types"
import { Head, Link } from "@inertiajs/react"
import ApplicationLogo from "@/Components/ApplicationLogo"
import { BookOpen, Users, Award, BarChart2 } from "lucide-react"

export default function Welcome({ auth }: PageProps<{}>) {


  return (
    <>
      <Head title="">
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap" rel="stylesheet" />
      </Head>
      <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 font-['Outfit']">
        <header className="fixed w-full bg-white/80 backdrop-blur-sm z-10 shadow-sm">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-20 items-center justify-between">
              <div className="flex-shrink-0">
                <Link href="/">
                  <ApplicationLogo className="h-10 w-auto" />
                </Link>
              </div>
              <div className="flex items-center gap-4">
                {auth.user && auth?.user?.permissions?.includes("can view dashboard") ? (
                  <Link
                    prefetch
                    href={route("dashboard")}
                    className="rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-indigo-700 hover:shadow-lg"
                  >
                    Dashboard
                  </Link>
                ) : (
                  <Link
                    prefetch
                    href={route("login")}
                    className="rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-indigo-700 hover:shadow-lg"
                  >
                    Login
                  </Link>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="flex min-h-screen flex-col items-center justify-center px-4 pt-20 pb-24 text-center sm:px-6 lg:px-8">
          <div className="relative mx-auto max-w-4xl">
            {/* Decorative elements */}
            <div className="absolute -top-20 -left-20 h-40 w-40 rounded-full bg-blue-100 opacity-50 blur-3xl"></div>
            <div className="absolute -bottom-20 -right-20 h-40 w-40 rounded-full bg-indigo-100 opacity-50 blur-3xl"></div>

            <span className="inline-block rounded-full bg-indigo-100 px-4 py-1.5 text-sm font-medium text-indigo-800 mb-6">
              Admin Portal
            </span>

            <h1 className="text-[2.75rem] font-bold leading-tight tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
              Learning Management{" "}
              <span className="bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">System</span>
            </h1>

            <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-gray-600">
              Manage your courses, students, and instructors all in one place. Access comprehensive analytics and
              reporting to track learning progress.
            </p>

            <div className="mt-12">
              <Link
                prefetch
                href={route("login")}
                className="rounded-full bg-gradient-to-r from-indigo-600 to-blue-500 px-8 py-4 text-base font-medium text-white transition-all hover:shadow-lg hover:translate-y-[-2px]"
              >
                Get Started
              </Link>
            </div>

            {/* Feature highlights */}
            <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl bg-white p-6 shadow-sm transition-all hover:shadow-md">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
                  <BookOpen className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">Course Management</h3>
                <p className="text-sm text-gray-500">Create and manage courses with ease</p>
              </div>

              <div className="rounded-xl bg-white p-6 shadow-sm transition-all hover:shadow-md">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
                  <Users className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">Student Tracking</h3>
                <p className="text-sm text-gray-500">Monitor student progress and engagement</p>
              </div>

              <div className="rounded-xl bg-white p-6 shadow-sm transition-all hover:shadow-md">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
                  <Award className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">Certification</h3>
                <p className="text-sm text-gray-500">Issue certificates upon course completion</p>
              </div>

              <div className="rounded-xl bg-white p-6 shadow-sm transition-all hover:shadow-md">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
                  <BarChart2 className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">Analytics</h3>
                <p className="text-sm text-gray-500">Comprehensive reporting and insights</p>
              </div>
            </div>
          </div>
        </main>

        <footer className="w-full bg-white py-6 shadow-[0_-1px_3px_rgba(0,0,0,0.05)]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <p className="text-sm text-gray-500">
                &copy; {new Date().getFullYear()} Learning Management System. All rights reserved.
              </p>
              <div className="flex gap-6">
                <a href="#" className="text-sm text-gray-500 hover:text-indigo-600">
                  Privacy Policy
                </a>
                <a href="#" className="text-sm text-gray-500 hover:text-indigo-600">
                  Terms of Service
                </a>
                <a href="#" className="text-sm text-gray-500 hover:text-indigo-600">
                  Contact
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
