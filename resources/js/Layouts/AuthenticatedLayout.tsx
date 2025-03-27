import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren, ReactNode, useState } from 'react';

export default function Authenticated({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {

    const user = usePage().props.auth.user;
    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);

    const { auth } = usePage().props as unknown as {
        auth: { user: { permissions: string[] } | null };
    };
    

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="border-b border-gray-100 bg-white">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex">
                            
                        <div className="flex shrink-0 items-center">
                            {auth?.user?.permissions?.includes("can view dashboard") ? (
                                <Link href="/">
                                    <ApplicationLogo className="block h-9 w-auto fill-current text-gray-800" />
                                </Link>
                            ) : (
                                <ApplicationLogo className="block h-9 w-auto fill-current text-gray-800" />
                            )}
                        </div>


                            <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">


                                {
                                    auth?.user?.permissions?.includes("can view dashboard") && (
                                        <NavLink
                                        prefetch
                                        href={route('dashboard')}
                                        active={route().current('dashboard')}
                                        >
                                            Dashboard
                                        </NavLink>
                                    )
                                }


                                {
                                    auth?.user?.permissions?.includes("can view courses") && (
                                        <NavLink
                                        prefetch
                                        href={route('courses.index')}  
                                        active={route().current('courses.index')} 
                                        >
                                            Courses
                                        </NavLink>
                                    )
                                }


                                {
                                    auth?.user?.permissions?.includes("can view exams") && (
                                        <NavLink
                                        prefetch
                                        href={route('exams-new.index')}  
                                        active={route().current('exams.index')} 
                                        >
                                            Exams
                                        </NavLink>
                                    )
                                }
  

                                {
                                    auth?.user?.permissions?.includes("can view exam courses") && (
                                        <NavLink
                                        prefetch
                                        href={route('exam-courses.index')}  
                                        active={route().current('exam-courses.index')} 
                                    >
                                        Exam Courses
                                    </NavLink>
                                    )
                                }

                                
                                {
                                   auth?.user?.permissions?.includes("can view subscription") && (
                                    <NavLink
                                        prefetch
                                        href={route('subscriptions.index')}  
                                        active={route().current('subscriptions.index')} 
                                    >
                                        Subscriptions
                                    </NavLink>
                                   ) 
                                }

                                {
                                   auth?.user?.permissions?.includes("can view students management") && (
                                    <NavLink
                                    prefetch
                                    href={route('student-managements.index')}  
                                    active={route().current('student-managements.index')} 
                                    >
                                        Students Management
                                    </NavLink>
                                   ) 
                                }

                                {
                                   auth?.user?.permissions?.includes("can view workers management") && (
                                    <NavLink
                                    prefetch
                                    href={route('user-managements.index')}  
                                    active={route().current('user-managements.index')} 
                                    >
                                        Workers Management
                                    </NavLink>
                                   ) 
                                }
 


                            </div>
                        </div>

                        <div className="hidden sm:ms-6 sm:flex sm:items-center">
                            <div className="relative ms-3">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-md">
                                            <button
                                                type="button"
                                                className="inline-flex items-center rounded-md border border-transparent bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-500 transition duration-150 ease-in-out hover:text-gray-700 focus:outline-none"
                                            >
                                                {user.name}

                                                <svg
                                                    className="-me-0.5 ms-2 h-4 w-4"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        </span>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content>
                                        <Dropdown.Link
                                            href={route('profile.edit')}
                                        >
                                            Profile
                                        </Dropdown.Link>
                                        <Dropdown.Link
                                            href={route('logout')}
                                            method="post"
                                            as="button"
                                        >
                                            Log Out
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        <div className="-me-2 flex items-center sm:hidden">
                            <button
                                onClick={() =>
                                    setShowingNavigationDropdown(
                                        (previousState) => !previousState,
                                    )
                                }
                                className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 transition duration-150 ease-in-out hover:bg-gray-100 hover:text-gray-500 focus:bg-gray-100 focus:text-gray-500 focus:outline-none"
                            >
                                <svg
                                    className="h-6 w-6"
                                    stroke="currentColor"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        className={
                                            !showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                    <path
                                        className={
                                            showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <div
                    className={
                        (showingNavigationDropdown ? 'block' : 'hidden') +
                        ' sm:hidden'
                    }
                >
                    <div className="space-y-1 pb-3 pt-2">

                        {
                            auth?.user?.permissions?.includes("can view dashboard") && (

                            <ResponsiveNavLink
                                cacheFor={'10s'}
                                prefetch
                                href={route('dashboard')}
                                active={route().current('dashboard')}
                            >
                                Dashboard
                            </ResponsiveNavLink>
                            ) 
                        }


                        {
                            auth?.user?.permissions?.includes("can view courses") && (

                            <ResponsiveNavLink
                                prefetch
                                cacheFor={'20s'}
                                href={route('courses.index')}
                                active={route().current('courses.index')}
                            >
                                Courses
                            </ResponsiveNavLink>
                            ) 
                        }

                        
                        {
                            auth?.user?.permissions?.includes("can view exams") && (

                            <ResponsiveNavLink
                                cacheFor={'20s'}
                                prefetch
                                href={route('exams-new.index')}
                                active={route().current('exams.index')}
                            >
    
                                Exams 
                            </ResponsiveNavLink>
                            ) 
                        }


                        {
                            auth?.user?.permissions?.includes("can view exam courses") && (


                            <ResponsiveNavLink
                                cacheFor={'20s'}
                                prefetch
                                href={route('exam-courses.index')}
                                active={route().current('exam-courses.index')}
                            >
                                Exam Courses
                            </ResponsiveNavLink>
                            ) 
                        }
                        
                        
                        {
                            auth?.user?.permissions?.includes("can view subscription") && (


                            <ResponsiveNavLink
                                prefetch
                                cacheFor={'10s'}
                                href={route('subscriptions.index')}
                                active={route().current('subscriptions.index')}
                            >
                                Subscription
                            </ResponsiveNavLink>
                            ) 
                        }


                        {
                            auth?.user?.permissions?.includes("can view workers management") && (


                            <ResponsiveNavLink
                                prefetch
                                cacheFor={'30s'}
                                href={route('user-managements.index')}
                                active={route().current('user-managements.index')}
                            >
                                Workers Management
                            </ResponsiveNavLink>
                            ) 
                        }


                        {
                            auth?.user?.permissions?.includes("can view students management") && (

                            <ResponsiveNavLink
                                prefetch cacheFor={'10s'}
                                href={route('student-managements.index')}
                                active={route().current('student-managements.index')}
                            >
                                Students Management
                            </ResponsiveNavLink>
                            ) 
                        }



                        {/* <ResponsiveNavLink
                            cacheFor={'20s'}
                            prefetch
                            href={route('exams.index')}
                            active={route().current('exams.index')}
                        >
                            Exams
                        </ResponsiveNavLink> */}



                        



                    </div>

                    <div className="border-t border-gray-200 pb-1 pt-4">
                        <div className="px-4">
                            <div className="text-base font-medium text-gray-800">
                                {user.name}
                            </div>
                            <div className="text-sm font-medium text-gray-500">
                                {user.email}
                            </div>
                        </div>

                        <div className="mt-3 space-y-1">
                            <ResponsiveNavLink href={route('profile.edit')}>
                                Profile
                            </ResponsiveNavLink>
                            <ResponsiveNavLink
                                method="post"
                                href={route('logout')}
                                as="button"
                            >
                                Log Out
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>

            {header && (
                <header className="bg-white shadow">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}
            <main>{children}</main>
        </div>
    );
}
