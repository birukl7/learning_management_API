import Dropdown from '@/Components/Dropdown'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table'
import { Head, Link, router } from '@inertiajs/react'
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react'
import dayjs from 'dayjs'
import realativeTime from 'dayjs/plugin/relativeTime'

import TextInput from '@/Components/TextInput'
import Authenticated from '@/Layouts/AuthenticatedLayout'
import AlertBan from './AlertBan'
import UserDetailDrawer from './ShowDrawer'
import { ExamCourse } from '@/types'
import AlertUnBan from './AlertUnBan'
import PermissionAlert from '@/Components/PermissionAlert'
// import { SubscriptionRequest } from '@/types'
import { Avatar } from '@/Components/ui/avatar';

dayjs.extend(realativeTime)

interface SubscriptionRequest {
  id: number
  exam_course: ExamCourse[] | null
  total_price: number
  proof_of_payment: string
  transaction_id: string
  status: "Pending" | "Approved" | "Rejected"
  created_at: string
  updated_at: string
  subscription: {
    id: number
    subscription_start_date: string
    subscription_end_date: string
    created_at: string
    updated_at: string
  } | null
}

interface User{
  email: string
  id: number,
  bio: string,
  avatar: string
  name: string,
  bannedUser: boolean
  subscriptionRequests: SubscriptionRequest[]
  created_at: string,
  updated_at: string,
  station?: {name: string}
  creator?: {name: string},
  updater?: {name: string},
  permissions: string[]
}

interface UsersResponse{
  data: User[]
  links: any
  meta: {links: any[]}
}

interface IndexProps{
  users: UsersResponse,
  queryParams?: any,
  success: string,
  canBan: boolean,
  canUnBan: boolean,
}

const Index = ({users, queryParams={}, success, canBan, canUnBan}: IndexProps) => {


  queryParams = queryParams || {}

  // console.log(users)
  const searchFieldChanged = (name: string, value: any) => {
    if (value) {
      queryParams[name] = value;
    } else {
      delete queryParams[name];
    }
    router.get(route('student-managements.index'), queryParams);
  };

  const sortChanged = (name: string) => {
    if (name === queryParams.sort_field) {
      queryParams.sort_direction = queryParams.sort_direction === 'asc' ? 'desc' : 'asc';
    } else {
      queryParams.sort_field = name;
      queryParams.sort_direction = 'asc';
    }
    router.get(route('student-managements.index'), queryParams);
  };

  const onKeyDown = (name: string, e: any) => {
    if (e.key !== 'Enter') return;
    searchFieldChanged(name, e.target.value);
  };


  return (
    <Authenticated
      header={
        <div className='flex justify-between'>
          <h1 className=' font-bold'>Student Management</h1>
        
      </div>
      }
    >

    <Head title='student management' />
    <div className="py-12">
        <div className="max-w-[1300px] mx-auto sm:px-6 lg:px-8">
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg dark:bg-gray-900">
            <div className="p-6 text-gray-900 dark:text-gray-100">

            <Table>
                <TableCaption>A list of users</TableCaption>
                <TableHeader>

                  <TableRow>
                    <TableHead onClick={() => sortChanged('id')} className='text-nowrap'>
                      <div className='flex items-center gap-x-1'>
                        #No
                        <div className=' hover:cursor-pointer'>
                          <ChevronUpIcon className='w-4' />
                          <ChevronDownIcon className='w-4 -mt-3' />
                        </div>
                      </div>
                    </TableHead>
                    <TableHead className='w-[200px]' onClick={()=> sortChanged('name')}>
                      <div className='flex items-center gap-x-1'>
                        <span className='text-nowrap'>Name</span>
                        <div className=' hover:cursor-pointer'>
                          <ChevronUpIcon className='w-4' />
                          <ChevronDownIcon className='w-4 -mt-3' />
                        </div>
                      </div>
                    </TableHead >

                    <TableHead onClick={()=> sortChanged('email')} className=' text-nowrap'>
                      <div className='flex items-center gap-x-1'>
                        <span className='text-nowrap'>Email</span>
                        <div className=' hover:cursor-pointer'>
                          <ChevronUpIcon className='w-4' />
                          <ChevronDownIcon className='w-4 -mt-3' />
                        </div>
                      </div>
                    </TableHead>


                    <TableHead onClick={()=> sortChanged('created_at')} className=' text-nowrap'>
                      <div className='flex items-center gap-x-1'>
                        <span className='text-nowrap'>Registration Date</span>
                        <div className=' hover:cursor-pointer'>
                          <ChevronUpIcon className='w-4' />
                          <ChevronDownIcon className='w-4 -mt-3' />
                        </div>
                      </div>
                    </TableHead>
                   
                    <TableHead className='text-nowrap'>Actions</TableHead>
                  </TableRow>

                </TableHeader>

                <TableHeader>
                  <TableHead></TableHead>
                  <TableHead className='w-10'>
                    <TextInput 
                      className=' w-full'
                      placeholder='Student Name'
                      defaultValue={queryParams.name}
                      onBlur={(e)=> searchFieldChanged('name', e.target.value)}
                      onKeyDown={(e) => onKeyDown('name', e)}
                    />
                  </TableHead>
                  <TableHead></TableHead>
                  <TableHead></TableHead>
                  <TableHead></TableHead>
                  <TableHead></TableHead>
                  <TableHead></TableHead>
                  <TableHead></TableHead>
              
                  <TableHead></TableHead>
                  <TableHead></TableHead>
                  <TableHead></TableHead>
                </TableHeader>

                <TableBody>
                  {users.data.map((user,index)=>(
                    <TableRow key={index}>
                      <TableCell className=' text-nowrap'>
                        {index+1}
                      </TableCell>
                      <TableCell className=' text-nowrap'>
                        {user.name}
                      </TableCell>
                      <TableCell className=' text-nowrap'>
                        {user.email || 'N/A'}
                      </TableCell>
                      <TableCell className=' text-nowrap'>
                        {dayjs(user.created_at).fromNow() || 'N/A'}
                      </TableCell>
                      <TableCell className='text-nowrap'>
                        {<>
                        {/* <ShowAdminPrevillage 
                          user={user}
                        /> */}
                        </>}
                      </TableCell>

                      <TableCell className='flex gap-x-3 items-center'>
                        <UserDetailDrawer user={user} canBan={canBan} canUnban={canUnBan} />
                        {
                          user.bannedUser ?(
                            canUnBan ?
                          <AlertUnBan user={user} /> : <PermissionAlert children={'UnBan'}
                          permission='can unban a user' 
                          buttonVariant={'outline'}
                          className='bg-green-600 text-white p-2'/>
                        ): (
                            canBan ?
                          <AlertBan user={user}/> : <PermissionAlert children={'Ban'} permission={'can ban a user'}
                          buttonVariant={'outline'} className='bg-red-600 text-white p-2' />
                        )
                        }
                        
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="mt-6 flex justify-center items-center space-x-2">
            {users.meta.links?.map((link: { url: any; active: any; label: any }, index: React.Key | null | undefined) => (
              <Link
                key={index}
                href={link.url || '#'}
                className={`px-4 py-2 border rounded ${
                  link.active ? 'bg-blue-500 text-white' : 'bg-white text-blue-500'
                } ${!link.url ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-100'}`}
                preserveScroll
                preserveState
              >
                <span dangerouslySetInnerHTML={{ __html: link.label }}></span>
              </Link>
            ))}
          </div>

        </div>
      </div>
      
    </Authenticated>
  )
}

export default Index
