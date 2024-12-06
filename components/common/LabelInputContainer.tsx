interface LabelInputContainerProps {
  children: React.ReactNode;
  className?: string;
}

export default function LabelInputContainer({
  children,
  className,
}: LabelInputContainerProps) {
  return (
    <div className={className}>
      <div className="flex flex-col space-y-2">{children}</div>
    </div>
  );
}
