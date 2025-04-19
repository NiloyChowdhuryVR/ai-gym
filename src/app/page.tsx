import { SignInButton } from '@clerk/nextjs'
import Link from 'next/link'
import React from 'react'

const page = () => {
  return (
    <> 
    <div className='bg-red-100 h-screen flex justify-center items-center'>

    <Link href="/generate-program" className='bg-blue-800 text-5xl text-white' >Let's Start</Link>
    </div>
    </>
  )
}

export default page