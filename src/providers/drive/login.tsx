import { memo, useCallback } from "react"
import provider from "@/providers"
import { useSearch } from "@tanstack/react-router"
import { Button } from "@tw-material/react"
import IconGithub from "~icons/mdi/github"

export const Login = memo(() => {
  const params = useSearch({ from: "/_auth/login" })

  const handleLogin = useCallback(() => {
    provider.signIn("github", { callbackUrl: params.redirect ?? "/" })
  }, [params.redirect])

  return (
    <div className="m-auto flex rounded-large h-48 max-w-sm flex-row justify-center items-center bg-surface mt-12">
      <Button
        onPress={handleLogin}
        variant="filledTonal"
        className="w-[80%] text-inherit"
        startIcon={<IconGithub />}
      >
        Sign In
      </Button>
    </div>
  )
})
