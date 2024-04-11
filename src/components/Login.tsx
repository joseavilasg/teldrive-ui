import { memo, useCallback, useEffect, useRef, useState } from "react"
import { AuthMessage } from "@/types"
import { useQueryClient } from "@tanstack/react-query"
import { useRouter, useSearch } from "@tanstack/react-router"
import {
  Autocomplete,
  AutocompleteItem,
  Avatar,
  Button,
  Input,
  Spinner,
} from "@tw-material/react"
import type { CountryCode } from "libphonenumber-js"
import meta from "libphonenumber-js/metadata.min.json"
import { Controller, useForm } from "react-hook-form"
import useWebSocket from "react-use-websocket"

import QrCode from "@/components/QrCode"
import { TelegramIcon } from "@/components/TelegramIcon"
import { useProgress } from "@/components/TopProgress"
import http from "@/utils/http"

const getKeys = Object.keys as <T>(object: T) => (keyof T)[]

const displayNames = new Intl.DisplayNames(["en"], { type: "region" })

function sortISOCodes(countryCodes: CountryCode[]) {
  return [...countryCodes].sort((countryCodeA, countryCodeB) => {
    const countryA = displayNames.of(countryCodeA) as string
    const countryB = displayNames.of(countryCodeB) as string

    return countryA.localeCompare(countryB)
  })
}

type FormState = {
  phoneCodeHash?: string
  phoneCode: string
  phoneNumber: string
  password?: string
}

type LoginType = "qr" | "phone"

const getWebSocketUrl = () => {
  const host = window.location.origin
  const url = new URL(host)
  return `${url.protocol === "http:" ? "ws" : "wss"}://${url.host}/api/auth/ws`
}

const initailState = {
  loginType: "phone" as LoginType,
  qrCode: "",
  step: 1,
  isLoading: false,
  form: {} as FormState,
}

const countries = meta.countries

const isoCodes = sortISOCodes(getKeys(countries))
  .filter((x) => x !== "TA" && x !== "AC")
  .map((code) => ({ value: code }))

export const Login = memo(() => {
  const { redirect } = useSearch({ from: "/_auth/login" })

  const queryClient = useQueryClient()

  const router = useRouter()

  const [state, setState] = useState(initailState)

  const { control, handleSubmit } = useForm({
    defaultValues: initailState.form,
  })

  const { sendJsonMessage, lastJsonMessage } = useWebSocket<AuthMessage>(
    `${getWebSocketUrl()}`,
    {}
  )

  const { startProgress, stopProgress } = useProgress()

  const postLogin = useCallback(
    async function postLogin(payload: Record<string, any>) {
      startProgress()
      const res = await http.post("/api/auth/login", payload)
      if (res.status === 200) {
        await queryClient.invalidateQueries({ queryKey: ["session"] })
        router.history.push(redirect || "/my-drive", { replace: true })
      }
      stopProgress()
    },
    [redirect]
  )

  const onSubmit = useCallback(
    ({ phoneNumber, phoneCode, password }: FormState) => {
      if (state.step === 1 && state.loginType === "phone") {
        setState((prev) => ({
          ...prev,
          isLoading: true,
          form: { ...prev.form, phoneNumber },
        }))
        sendJsonMessage({
          authType: state.loginType,
          message: "sendcode",
          phoneNo: phoneNumber,
        })
      } else if (state.step === 2 && state.loginType === "phone") {
        setState((prev) => ({
          ...prev,
          isLoading: true,
        }))
        sendJsonMessage({
          authType: state.loginType,
          message: "signin",
          phoneNo: phoneNumber,
          phoneCode,
          phoneCodeHash: state.form.phoneCodeHash,
        })
      } else if (state.step === 3) {
        setState((prev) => ({
          ...prev,
          isLoading: true,
        }))
        sendJsonMessage({
          authType: "2fa",
          password,
        })
      }
    },
    [state.form.phoneCodeHash, state.loginType, state.step]
  )

  const firstCall = useRef(false)

  useEffect(() => {
    if (state.loginType === "qr" && !firstCall.current) {
      sendJsonMessage({ authType: state.loginType })
      firstCall.current = true
    }
  }, [state.loginType])

  useEffect(() => {
    if (lastJsonMessage !== null) {
      if (lastJsonMessage?.message === "success") {
        postLogin(lastJsonMessage.payload)
        setState((prev) => ({
          ...prev,
          isLoading: false,
        }))
      } else if (lastJsonMessage?.payload?.phoneCodeHash) {
        const phoneCodeHash = lastJsonMessage.payload.phoneCodeHash as string
        setState((prev) => ({
          ...prev,
          isLoading: false,
          step: 2,
          form: { ...prev.form, phoneCodeHash },
        }))
      } else if (lastJsonMessage?.payload?.token) {
        setState((prev) => ({
          ...prev,
          qrCode: lastJsonMessage.payload.token as string,
        }))
      } else if (lastJsonMessage?.message === "2FA required") {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          step: 3,
        }))
      } else if (lastJsonMessage.type === "error") {
        //toast.error(lastJsonMessage.message)
      }
    }
  }, [lastJsonMessage])

  return (
    <div className="m-auto flex rounded-large max-w-md flex-col justify-center items-center bg-surface mt-6 gap-4 px-4 pt-6 pb-20">
      <form
        noValidate
        autoComplete="off"
        className="w-full flex flex-col items-center gap-8"
        onSubmit={!state.isLoading ? handleSubmit(onSubmit) : undefined}
      >
        {state.loginType === "phone" ? (
          <>
            <TelegramIcon className="size-40" />
            {state.step === 1 && (
              <Controller
                name="phoneNumber"
                control={control}
                rules={{ required: true }}
                render={({ field, fieldState: { error } }) => (
                  <Autocomplete
                    classNames={{
                      base: "max-w-xs",
                    }}
                    variant="bordered"
                    label="Phone No"
                    size="lg"
                    labelPlacement="outside"
                    items={isoCodes}
                    isRequired
                    menuTrigger="manual"
                    isInvalid={!!error}
                    allowsCustomValue={true}
                    errorMessage={error?.message}
                    inputValue={field.value}
                    onInputChange={field.onChange}
                    // onSelectionChange={(val) => field.onChange(val)}
                    // onInputChange={(val) => {
                    //   if (val.startsWith("+")) field.onChange(val)
                    //   else if (val)
                    //     field.onChange(`+${state.countries[val]?.[0]} `)
                    //   else field.onChange(val)
                    // }}
                    startContent={
                      <Avatar
                        className="w-7 h-4 rounded-none"
                        src={`https://flagcdn.com/in.svg`}
                      />
                    }
                  >
                    {(code) => {
                      const country = displayNames.of(code.value) as string
                      return (
                        <AutocompleteItem
                          key={code.value}
                          textValue={code.value}
                          hideSelectedIcon
                        >
                          <span className="flex w-full justify-between">
                            <span>{country}</span>
                            <span>{`+${countries?.[code.value]?.[0]}`}</span>
                          </span>
                        </AutocompleteItem>
                      )
                    }}
                  </Autocomplete>
                )}
              />
            )}
            {state.step === 2 && (
              <Controller
                name="phoneCode"
                control={control}
                rules={{ required: true }}
                render={({ field, fieldState: { error } }) => (
                  <Input
                    isRequired
                    label="PhoneCode"
                    size="lg"
                    fullWidth
                    variant="bordered"
                    isInvalid={!!error}
                    errorMessage={error?.message}
                    {...field}
                  ></Input>
                )}
              />
            )}
          </>
        ) : (
          <div className="min-h-64 grid place-content-center">
            {state.step !== 3 && state.qrCode && (
              <QrCode qrCode={state.qrCode} />
            )}

            {state.step !== 3 && !state.qrCode && (
              <Spinner className="size-10" />
            )}
          </div>
        )}

        {state.step === 3 && (
          <Controller
            name="password"
            control={control}
            rules={{ required: true }}
            render={({ field, fieldState: { error } }) => (
              <Input
                isRequired
                label="2FA password"
                size="lg"
                fullWidth
                labelPlacement="outside"
                variant="bordered"
                isInvalid={!!error}
                errorMessage={error?.message}
                type="password"
                {...field}
              ></Input>
            )}
          />
        )}

        <div className="flex flex-col gap-6 w-full items-center">
          {(state.loginType === "phone" || state.step === 3) && (
            <Button
              type="submit"
              fullWidth
              variant="filledTonal"
              isLoading={state.isLoading}
              className="w-[80%] text-inherit"
            >
              {state.isLoading
                ? "Please Wait…"
                : state.step === 1
                  ? "Next"
                  : "Login"}
            </Button>
          )}
          {state.step !== 3 && (
            <Button
              onPress={() =>
                setState((prev) => ({
                  ...prev,
                  loginType: prev.loginType === "qr" ? "phone" : "qr",
                }))
              }
              fullWidth
              variant="filledTonal"
              className="w-[80%] text-inherit"
            >
              {state.loginType === "qr" ? "Phone Login" : "QR Login"}
            </Button>
          )}
        </div>
      </form>
    </div>
  )
})
