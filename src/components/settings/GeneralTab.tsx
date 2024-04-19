import { memo, useCallback } from "react"
import { Button, Input } from "@tw-material/react"
import clsx from "clsx"
import { Controller, useForm } from "react-hook-form"

import useSettings from "@/hooks/useSettings"
import { scrollbarClasses } from "@/utils/classes"

export const GeneralTab = memo(() => {
  const { settings, setSettings } = useSettings()

  const { control, handleSubmit } = useForm({
    defaultValues: settings,
  })

  const onSubmit = useCallback((data: typeof settings) => setSettings(data), [])

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={clsx(
        "grid grid-cols-6 gap-8 p-2 w-full overflow-y-auto",
        scrollbarClasses
      )}
    >
      <div className="col-span-6 xs:col-span-3">
        <p className="text-lg font-medium">Resizer Host</p>
        <p className="text-sm font-normal text-on-surface-variant">
          Image Resize Url to resize images
        </p>
      </div>
      <Controller
        name="resizerHost"
        control={control}
        render={({ field, fieldState: { error } }) => (
          <Input
            size="lg"
            className="col-span-6 xs:col-span-3"
            variant="bordered"
            isInvalid={!!error}
            errorMessage={error?.message}
            {...field}
          ></Input>
        )}
      />
      <div className="col-span-6 xs:col-span-3">
        <p className="text-lg font-medium">Page Size</p>
        <p className="text-sm font-normal text-on-surface-variant">
          Number of items per page
        </p>
      </div>
      <Controller
        name="pageSize"
        control={control}
        render={({ field, fieldState: { error } }) => (
          <Input
            size="lg"
            className="col-span-6 xs:col-span-3"
            variant="bordered"
            isInvalid={!!error}
            errorMessage={error?.message}
            {...field}
            type="number"
          ></Input>
        )}
      />
      <div className="col-span-6 flex justify-end">
        <Button type="submit" variant="filledTonal">
          Save
        </Button>
      </div>
    </form>
  )
})
