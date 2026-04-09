import { Skeleton } from "./skeleton"

export function CardSkeleton() {
  return (
    <div className="rounded-xl border border-system-strokecard bg-card p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Skeleton variant="heading" className="w-48" />
          <Skeleton variant="text" lines={2} />
        </div>
        <Skeleton variant="circle" className="h-12 w-12" />
      </div>
    </div>
  )
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-xl border border-system-strokecard bg-card shadow-sm">
      <div className="border-b border-system-strokecard p-4">
        <Skeleton variant="heading" className="w-32" />
      </div>
      <div className="p-4">
        <div className="flex flex-col gap-3">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton variant="circle" className="h-10 w-10" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton variant="text-sm" className="w-1/3" />
                <Skeleton variant="text-sm" className="w-1/2" />
              </div>
              <Skeleton variant="button" className="h-8 w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function ProfileSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Skeleton variant="avatar" className="h-20 w-20" />
        <div className="flex flex-col gap-2">
          <Skeleton variant="heading" className="w-48" />
          <Skeleton variant="text" className="w-32" />
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <Skeleton variant="text" lines={3} />
      </div>
      <div className="flex gap-2">
        <Skeleton variant="button" />
        <Skeleton variant="button" />
      </div>
    </div>
  )
}
