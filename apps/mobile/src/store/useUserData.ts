import { create } from "zustand"
import { UserDataDto } from "@repo/dto"

type UserDataState = {
    userData: UserDataDto | null
    setUserData: (userData: UserDataDto) => void
    removeUserData: () => void
}

const useUserDataStore = create<UserDataState>((set) => ({
    userData: null,
    setUserData: (userData) => set({ userData }),
    removeUserData: () => set({ userData: null })
}))

export default useUserDataStore
