import { signIn } from "@/auth";
import { Button } from "@/components/ui/button";
import { formatPageTitle } from "@/lib/formatPageTitle";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: formatPageTitle("Sign in")
};

export default function SignIn() {
    return (
        <main className="flex justify-center items-center w-full h-screen">
            <form
                action={async () => {
                    "use server";
                    await signIn("github", { redirectTo: "/" });
                }}
            >
                <Button variant="outline" type="submit">
                    Sign In with GitHub
                </Button>
            </form>
        </main>
    );
}
