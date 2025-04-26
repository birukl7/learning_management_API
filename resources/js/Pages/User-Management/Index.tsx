import Dropdown from '@/Components/Dropdown'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table'
import { Head, Link, router } from '@inertiajs/react'
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react'
import dayjs from 'dayjs'
import realativeTime from 'dayjs/plugin/relativeTime'
import TextInput from '@/Components/TextInput'
import Authenticated from '@/Layouts/AuthenticatedLayout'
import { AlertDelete } from './AlertDelete'
import ShowAdminPrevillage from '@/Components/ShowAdminPrevillage'
import { SessionToast } from '@/Components/SessionToast'
import PermissionAlert from '@/Components/PermissionAlert'

dayjs.extend(realativeTime)

interface user{
  email: string
  id: number,
  name: string,
  created_at: string,
  updated_at: string,
  creator?: {name: string},
  updater?: {name: string},
  permissions: string[]
}

interface UsersResponse{
  data: user[]
  links: any
  meta: {links: any[]}
}

interface IndexProps{
  users: UsersResponse,
  queryParams?: any,
  session: string,
  canAdd: boolean
  canUpdate: boolean
  canDelete: boolean
}


function Index({users, queryParams={}, session, canUpdate, canDelete, canAdd}: IndexProps) {
  queryParams = queryParams || {}

  console.log(users)
  
  const searchFieldChanged = (name: string, value: any) => {
    if (value) {
      queryParams[name] = value;
    } else {
      delete queryParams[name];
    }
    router.get(route('user-managements.index'), queryParams);
  };

  const sortChanged = (name: string) => {
    if (name === queryParams.sort_field) {
      queryParams.sort_direction = queryParams.sort_direction === 'asc' ? 'desc' : 'asc';
    } else {
      queryParams.sort_field = name;
      queryParams.sort_direction = 'asc';
    }
    router.get(route('user-managements.index'), queryParams);
  };

  const onKeyDown = (name: string, e: any) => {
    if (e.key !== 'Enter') return;
    searchFieldChanged(name, e.target.value);
  };

  return (
    <Authenticated
        header={
          <div className='flex justify-between'>
            <h1 className=' font-bold text-xl'>User Management</h1>
            {
              canAdd ?   
              <Link prefetch className='p-2 text-xs text-white border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground bg-customBlue' href={route('user-managements.create')}>Add User</Link> : <PermissionAlert children={'Add Worker'} permission={'can add a worker'} buttonVariant={'outline'} />
            }
          
        </div>
        }
    >
      <Head title='user management' />
      {
        session ? <SessionToast message={session} /> : null
      }
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
                    <TableHead className='text-nowrap'>Privillages</TableHead>
                    <TableHead className='text-nowrap'>Creator</TableHead>
                    <TableHead className='text-nowrap'>Updater</TableHead>
                    <TableHead className='text-nowrap'>Actions</TableHead>
                  </TableRow>

                </TableHeader>

                <TableHeader>
                  <TableHead></TableHead>
                  <TableHead className='w-10'>
                    <TextInput 
                      className=' w-full'
                      placeholder='Admin Name'
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
                        {
                          canUpdate ?  <ShowAdminPrevillage 
                          user={user} 
                        /> : <PermissionAlert children={'Show Privileges'} permission={'can show privilegs'} buttonVariant={'outline'}                        />
                        }
                       
                        </>}
                      </TableCell>
                      <TableCell className=' text-nowrap'>
                        {user.creator?.name || 'N/A'}
                      </TableCell>
                      <TableCell className=' text-nowrap'>
                        {user.updater?.name || 'N/A'}
                      </TableCell>
                      <TableCell className='flex gap-x-3 items-center'>
                        
                            {
                              canUpdate ?  
                              <Dropdown>
                          <Dropdown.Trigger>
                          <button>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                            </svg>
                          </button>
                          </Dropdown.Trigger>
                              <Dropdown.Content >
                              <Dropdown.Link
                                prefetch
                                as='button'
                                href={route('user-managements.edit', user.id)} 
                                method='get'
                              >
                                Edit
                              </Dropdown.Link>
                            </Dropdown.Content>
                            </Dropdown> : <PermissionAlert children={'Edit'} permission='can edit a worker' buttonVariant={'outline'} />
                            }


                        {
                          canDelete ? <AlertDelete user={user}/> : <PermissionAlert permission='can delete a user' children={'Delete'}  buttonVariant={'destructive'}/>
                        }
                        
                      </TableCell>

                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>

    </Authenticated>
  )
}

export default Index
