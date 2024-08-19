'use client';
import { useLoginMutation, useSignupMutation } from '@/redux/api/userApi';
import { setAccessToken } from '@/services/actions/setAccessToken';
import { storeToken } from '@/services/auth.service';
import { IRegisterData } from '@/types/common.types';
import { RegisterFormSchema } from '@/types/Forms.types';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { FieldValues, useForm } from 'react-hook-form';
import { FaSignInAlt } from 'react-icons/fa';
import { IoIosArrowRoundBack } from 'react-icons/io';
import { IoEyeOffOutline, IoEyeOutline } from 'react-icons/io5';
import { toast } from 'sonner';

const Register = () => {
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
  const [isCPasswordVisible, setIsCPasswordVisible] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [signup, { isSuccess }] = useSignupMutation();
  const [login] = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(RegisterFormSchema),
  });

  const router = useRouter();

  const resetForm = () => {
    const nameInput = document.getElementById('name') as HTMLInputElement;
    const emailInput = document.getElementById('email') as HTMLInputElement;
    const passwordInput = document.getElementById(
      'password'
    ) as HTMLInputElement;
    const cpasswordInput = document.getElementById(
      'cpassword'
    ) as HTMLInputElement;

    nameInput.value = '';
    emailInput.value = '';
    passwordInput.value = '';
    cpasswordInput.value = '';
  };

  const toggleShowingPassword = () => {
    const passwordInput = document.getElementById(
      'password'
    ) as HTMLInputElement;
    if (passwordInput.type === 'password') {
      passwordInput.type = 'text';
      setIsPasswordVisible((prev) => !prev);
    } else {
      passwordInput.type = 'password';
      setIsPasswordVisible((prev) => !prev);
    }
  };

  const toggleShowingCPassword = () => {
    const passwordInput = document.getElementById(
      'cpassword'
    ) as HTMLInputElement;
    if (passwordInput.type === 'password') {
      passwordInput.type = 'text';
      setIsCPasswordVisible((prev) => !prev);
    } else {
      passwordInput.type = 'password';
      setIsCPasswordVisible((prev) => !prev);
    }
  };

  const handleSignup = async (signupData: FieldValues) => {
    const { name, email, password, cpassword } = signupData;

    if (password !== cpassword) {
      toast.error('Password and Confirm Password does not match', {
        position: 'top-right',
        duration: 1500,
        icon: '❌',
      });
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long', {
        position: 'top-right',
        duration: 1500,
        icon: '❌',
      });
      return;
    }

    // check if password contains at least one number and one uppercase letter
    const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])/;
    if (!passwordRegex.test(password)) {
      toast.error(
        'Password must contain at least one number and one uppercase letter',
        {
          position: 'top-right',
          duration: 1500,
          icon: '❌',
        }
      );
      return;
    }

    const dataToBeSent: IRegisterData = {
      name,
      email,
      password,
      role: 'user',
      profileImage: '',
    };

    try {
      setIsLoading(true);

      const response = await signup(dataToBeSent).unwrap();

      if (response?.statusCode === 201 && response?.data?._id) {
        const loginResponse = await login({
          email: signupData?.email,
          password: signupData?.password,
        }).unwrap();

        if (loginResponse.data?.accessToken) {
          storeToken(loginResponse.data?.accessToken);
          setAccessToken(loginResponse?.data?.accessToken, {
            redirect: '/dashboard',
          });
          toast.success('Account created successfully', {
            position: 'top-right',
            duration: 1500,
            icon: '🚀',
          });
          resetForm();
        }

        if (response?.statusCode === 201 && !loginResponse.data?.accessToken) {
          toast.error(
            'Account created successfully but failed to login. Please try again from the login page.',
            {
              position: 'top-right',
              duration: 1500,
              icon: '❌',
            }
          );

          router.push('/login');
        }
      } else if (response?.statusCode !== 201) {
        setIsLoading(false);
        toast.error(response?.message, {
          position: 'top-right',
          duration: 1500,
          icon: '❌',
        });
      }
    } catch (error) {
      setIsLoading(false);
      toast.error('Failed to create account', {
        position: 'top-right',
        duration: 1500,
        icon: '❌',
      });
    }
  };

  return (
    <div className="main-container flex justify-center items-center min-h-screen">
      <div
        className="shadow-lg dark:shadow-slate-800 pb-8 w-full md:w-10/12 lg:w-6/12 rounded-md"
        data-aos="zoom-in"
        data-aos-duration="1500"
      >
        <div className="shadow py-3 flex justify-between items-center">
          <h3 className="text-custom-black text-xl font-bold ml-8">
            Create New Account
          </h3>
          <Link
            href="/"
            className="flex justify-center items-center gap-x-1 group hover:text-primary transition-all duration-300 ease-in-out"
          >
            <IoIosArrowRoundBack />
            <button className="mr-2 text-dim hover:text-primary transition-all duration-300 ease-in-out">
              Home
            </button>
          </Link>
        </div>
        <div className="h-[2px] w-3/5 mb-6 bg-purple-400"></div>
        <div className="px-8">
          <form
            className="space-y-4 md:space-y-6"
            onSubmit={handleSubmit(handleSignup)}
          >
            <div>
              <label htmlFor="name" className="block mb-2 text-sm font-medium">
                Name
              </label>
              <input
                type="text"
                id="name"
                className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 focus:outline-none"
                placeholder="e.g. Babul Akter"
                {...register('name', { required: true })}
              />
              {errors.name && (
                <span className="text-red-500 text-xs mt-1">
                  {errors.name.message?.toString()}
                </span>
              )}
            </div>
            <div>
              <label htmlFor="email" className="block mb-2 text-sm font-medium">
                Email
              </label>
              <input
                type="email"
                id="email"
                className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 focus:outline-none"
                placeholder="name@company.com"
                {...register('email', { required: true })}
              />
              {errors.email && (
                <span className="text-red-500 text-xs mt-1">
                  {errors.email.message?.toString()}
                </span>
              )}
            </div>
            <div className="relative">
              <label
                htmlFor="password"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Password
              </label>
              <input
                type={isPasswordVisible ? 'text' : 'password'}
                id="password"
                placeholder="••••••••"
                className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 focus:outline-none"
                {...register('password', { required: true })}
              />
              {errors.password && (
                <span className="text-red-500 text-xs mt-1">
                  {errors.password.message?.toString()}
                </span>
              )}
              <span
                className="absolute cursor-pointer top-10 right-3"
                onClick={toggleShowingPassword}
              >
                {isPasswordVisible ? (
                  <IoEyeOutline className="dark:text-gray-600" />
                ) : (
                  <IoEyeOffOutline className="dark:text-gray-600" />
                )}
              </span>
            </div>
            <div className="relative">
              <label
                htmlFor="cpassword"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Confirm Password
              </label>
              <input
                type={isCPasswordVisible ? 'text' : 'password'}
                id="cpassword"
                placeholder="••••••••"
                className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 focus:outline-none"
                {...register('cpassword', { required: true })}
              />
              {errors.cpassword && (
                <span className="text-red-500 text-xs mt-1">
                  {errors.cpassword.message?.toString()}
                </span>
              )}
              <span
                className="absolute cursor-pointer top-10 right-3"
                onClick={toggleShowingCPassword}
              >
                {isCPasswordVisible ? (
                  <IoEyeOutline className="dark:text-gray-600" />
                ) : (
                  <IoEyeOffOutline className="dark:text-gray-600" />
                )}
              </span>
            </div>
            <button
              type="submit"
              className="btn-secondary w-full flex justify-center space-x-4 items-center"
            >
              <FaSignInAlt />
              <span> {isLoading ? 'Signing Up...' : 'Sign Up'} </span>
            </button>
          </form>

          {/* already registered */}
          <div className="flex items-center justify-between mt-12">
            <p className="text-sm text-offgray">Already Registered?</p>
            <Link href="/login">
              <span className="text-sm hover:text-orange-400 hover:transition-all duration-300 underline text-offgray">
                Go to LogIn
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
