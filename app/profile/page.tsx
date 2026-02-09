import { redirect } from "next/navigation"
import ProfileForm from "./ProfileForm"

async function getUser() {
    return {
        email: "",
        username: ""
    }
}

export default async function ProfilePage() {
    const user = await getUser()

    if (!user) {
        redirect("/login")
    }

    return <ProfileForm user={user} />
}