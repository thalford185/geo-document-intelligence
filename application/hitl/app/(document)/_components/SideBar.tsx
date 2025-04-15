interface SideBarActionsProps {
  children: React.ReactNode;
  className?: string;
}
export function SideBarActions(props: SideBarActionsProps) {
  const { children, className } = props;
  return (
    <div
      className={`flex flex-row gap-4 flex flex-col gap-4 ${className || ""}`}
    >
      {children}
    </div>
  );
}

interface SideBarHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function SideBarHeader(props: SideBarHeaderProps) {
  const { children, className } = props;
  return (
    <div className={`flex flex-col gap-4 text-xl font-bold ${className || ""}`}>
      {children}
    </div>
  );
}

interface SideBarProps {
  children: React.ReactNode;
  className?: string;
}
export function SideBar(props: SideBarProps) {
  const { children, className } = props;
  return (
    <div
      className={`flex flex-col gap-4 p-8 border-r-1 h-full w-md ${className || ""}`}
    >
      {children}
    </div>
  );
}
