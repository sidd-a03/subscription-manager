import React, { useState } from 'react'
import {
  View,
  Text,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  TouchableOpacity,
  Alert
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Svg, { Path } from 'react-native-svg'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button, Input, TextField, Label, FieldError, useToast } from 'heroui-native'
import * as SecureStore from 'expo-secure-store'
import { useRouter, Link } from 'expo-router'
import { useUniwind } from 'uniwind'
import useAuthStore from '@/store/useAuthStore'
import axios from 'axios'
import { handleAuthError } from '@/lib/handle-auth-error'
import { AuthResponseDto } from '@repo/dto'
import useUserDataStore from '@/store/useUserData'

const signUpSchema = z.object({
  fullName: z.string().min(3, {
    message: "Full name must be at least 3 characters"
  }).max(100, {
    message: "Full name must be at most 100 characters"
  }),
  email: z.string().email({
    message: "Invalid email"
  }),
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters" })
    .regex(/[A-Z]/, { message: "Must contain at least one uppercase letter" })
    .regex(/[0-9]/, { message: "Must contain at least one number" })
    .regex(/[\!@#\$%\^&\*\(\)\-_\+=\[\]\{\};':",\./<>\?\|\\]/, { message: "Must contain at least one special character" }),
  confirmPassword: z.string().min(8, {
    message: "Confirm Password must be at least 8 characters"
  })
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

type SignUpFormValues = z.infer<typeof signUpSchema>;

const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const router = useRouter()
  const { theme } = useUniwind();
  const { setToken, removeToken } = useAuthStore();
  const { setUserData, removeUserData } = useUserDataStore()
  const { toast } = useToast();

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors }
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: ''
    },
    mode: 'onTouched'
  })

  const onSubmit = async (data: SignUpFormValues) => {
    try {
      const backendUrl =
        process.env.EXPO_PUBLIC_BACKEND_URL || 'http://10.0.2.2:8000'



      const res = await axios.post(`${backendUrl}/api/auth/sign-up`, {
        email: data.email.trim().toLowerCase(),
        password: data.password,
        name: data.fullName.trim(),        
      }, 
      {
          headers: {
            "x-client-type": "mobile"
          }
        }
      )



      const { access_token, refresh_token, userData } = res.data as AuthResponseDto

      if(userData){
        removeUserData();
        setUserData(userData)
      }
      
      if (access_token) {
        removeToken() 
        setToken(access_token)
      }

      if (refresh_token) {
        await SecureStore.setItemAsync('refresh_token', refresh_token)
      }

      toast.show({
        variant: "success",
        label: "Welcome aboard! 🎉",
        description: "Account created successfully!"
      })

      router.replace("/(tabs)");
    } catch (error) {
      handleAuthError(error, setError, {
        email: "email",
        password: "password",
        fullName: "fullName"
      }, toast)
    }
  }

  const handleGoogleAuth = () => {
    const backendUrl =
      process.env.EXPO_PUBLIC_BACKEND_URL || 'http://10.0.2.2:8000'
    Alert.alert('Google Authentication', `Initiating OAuth with Google at ${backendUrl}/api/auth/google`)
  }

  const isDark = theme === 'dark'
  const backgroundColor = isDark ? '#0f172a' : '#f8fafc'

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor }} className="bg-slate-50 dark:bg-slate-950">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={{ flex: 1, backgroundColor }}
          contentContainerStyle={{ flexGrow: 1, padding: 24, justifyContent: 'center' }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View className="mb-6 flex flex-col gap-1.5">
            <Text className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              Create an account
            </Text>
            <Text className="text-base text-slate-500 dark:text-slate-400">
              Start managing your subscriptions for free
            </Text>
          </View>

          {/* Google OAuth Button */}
          <Button
            variant="outline"
            onPress={handleGoogleAuth}
            className="h-11 w-full flex-row gap-3 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all duration-200"
          >
            <Svg width={16} height={16} viewBox="0 0 24 24">
              <Path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <Path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <Path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <Path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </Svg>
            <Button.Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Sign up with Google
            </Button.Label>
          </Button>

          {/* Divider */}
          <View className="my-5 flex-row items-center gap-3">
            <View className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
            <Text className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              or
            </Text>
            <View className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
          </View>

          {/* Form */}
          <View className="flex flex-col gap-4">
            {/* Full Name */}
            <Controller
              control={control}
              name="fullName"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextField isInvalid={Boolean(errors.fullName)}>
                  <Label>Full name</Label>
                  <Input
                    placeholder="Jane Smith"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    className="h-11 px-4 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                  />
                  <FieldError>{errors.fullName?.message}</FieldError>
                </TextField>
              )}
            />

            {/* Email Field */}
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextField isInvalid={Boolean(errors.email)}>
                  <Label>Email address</Label>
                  <Input
                    placeholder="you@company.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    className="h-11 px-4 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                  />
                  <FieldError>{errors.email?.message}</FieldError>
                </TextField>
              )}
            />

            {/* Password Field */}
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextField isInvalid={Boolean(errors.password)}>
                  <Label>Password</Label>
                  <View className="relative justify-center">
                    <Input
                      placeholder="Minimum 8 characters"
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      className="h-11 pl-4 pr-12 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                    />
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-0 bottom-0 justify-center items-center"
                    >
                      {showPassword ? (
                        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 dark:text-slate-500">
                          <Path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                          <Path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                          <Path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                          <Path d="M2 2l20 20" />
                        </Svg>
                      ) : (
                        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 dark:text-slate-500">
                          <Path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                          <Path d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
                        </Svg>
                      )}
                    </TouchableOpacity>
                  </View>
                  <FieldError>{errors.password?.message}</FieldError>
                </TextField>
              )}
            />

            {/* Confirm Password Field */}
            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextField isInvalid={Boolean(errors.confirmPassword)}>
                  <Label>Confirm Password</Label>
                  <View className="relative justify-center">
                    <Input
                      placeholder="Minimum 8 characters"
                      secureTextEntry={!showConfirmPassword}
                      autoCapitalize="none"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      className="h-11 pl-4 pr-12 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                    />
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-0 bottom-0 justify-center items-center"
                    >
                      {showConfirmPassword ? (
                        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 dark:text-slate-500">
                          <Path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                          <Path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                          <Path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                          <Path d="M2 2l20 20" />
                        </Svg>
                      ) : (
                        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 dark:text-slate-500">
                          <Path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                          <Path d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
                        </Svg>
                      )}
                    </TouchableOpacity>
                  </View>
                  <FieldError>{errors.confirmPassword?.message}</FieldError>
                </TextField>
              )}
            />

            {/* Submit Button */}
            <Button
              onPress={handleSubmit(onSubmit)}
              className="h-11 w-full rounded-xl bg-teal-600 items-center justify-center shadow-md shadow-teal-500/20 active:scale-[0.98] mt-3"
            >
              <Button.Label className="text-white font-semibold text-sm">
                Create account
              </Button.Label>
            </Button>
          </View>

          {/* Footer Navigation */}
          <View className="mt-8 flex-row justify-center gap-1.5">
            <Text className="text-sm text-slate-500 dark:text-slate-400">
              Already have an account?
            </Text>
            <Link href="/(auth)/sign-in" asChild>
              <TouchableOpacity>
                <Text className="font-semibold text-teal-600 dark:text-teal-400">
                  Sign in
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

export default SignUp