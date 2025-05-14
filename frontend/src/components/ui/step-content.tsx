import { cn } from "@/lib/utils";
import { ComponentPropsWithoutRef } from "react";

const StepContent = ({ children, className }: ComponentPropsWithoutRef<"div">) => (
  <div className={cn("relative", className)}>
    {children}
  </div>
);

export default StepContent;